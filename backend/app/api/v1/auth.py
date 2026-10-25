from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from backend.app.models.user import User, PatientPreference
from backend.app.models.audit import AuditLog
from backend.app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    PatientPreferenceCreate,
    PatientPreferenceResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["patient", "hospital_admin", "platform_admin"] else "patient",
        hospital_id=user_in.hospital_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log audit event
    client_ip = request.client.host if request.client else "unknown"
    audit = AuditLog(
        user_id=user.id,
        action="user_registered",
        resource_type="user",
        resource_id=user.id,
        details={"role": user.role},
        ip_address=client_ip
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

    client_ip = request.client.host if request.client else "unknown"
    audit = AuditLog(
        user_id=user.id,
        action="login_success",
        resource_type="user",
        resource_id=user.id,
        details={},
        ip_address=client_ip
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out. Session cleared."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/preferences", response_model=PatientPreferenceResponse)
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(PatientPreference).filter(PatientPreference.user_id == current_user.id).first()
    if not pref:
        raise HTTPException(status_code=404, detail="Preferences not configured yet")
    return PatientPreferenceResponse.model_validate(pref)

@router.post("/preferences", response_model=PatientPreferenceResponse)
def save_preferences(
    pref_in: PatientPreferenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(PatientPreference).filter(PatientPreference.user_id == current_user.id).first()
    if not pref:
        pref = PatientPreference(user_id=current_user.id, **pref_in.model_dump())
        db.add(pref)
    else:
        for k, v in pref_in.model_dump().items():
            setattr(pref, k, v)
    db.commit()
    db.refresh(pref)
    return PatientPreferenceResponse.model_validate(pref)
