from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models.user import User, PatientPreference
from backend.app.models.hospital import Hospital, HospitalService, HospitalCredential
from backend.app.models.cost import TreatmentEstimate, EstimateLineItem
from backend.app.models.journey import Journey, JourneyStage, JourneyTask, Appointment, TravelArrangement
from backend.app.models.document import Document, DocumentPermission, Consent
from backend.app.models.audit import KnowledgeSource, AuditLog
from backend.app.services.conflict_detector import sync_journey_alerts
from backend.app.services.readiness_scorer import calculate_readiness_score

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # If users already exist, clear for fresh seed or check
    if db.query(User).count() > 0:
        print("Database already contains data. Skipping re-seed.")
        db.close()
        return

    print("Seeding MediGlobe AI database with rich demonstration dataset...")

    now = datetime.now(timezone.utc)

    # 1. Create Users
    patient_user = User(
        email="patient@mediglobe.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Sarah Jenkins",
        role="patient",
        is_active=True
    )
    hospital_admin_user = User(
        email="hospital@mediglobe.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Dr. Somchai Prasert",
        role="hospital_admin",
        is_active=True
    )
    platform_admin_user = User(
        email="admin@mediglobe.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Eleanor Vance (Platform Director)",
        role="platform_admin",
        is_active=True
    )
    db.add_all([patient_user, hospital_admin_user, platform_admin_user])
    db.flush()

    # Patient Preferences
    pref = PatientPreference(
        user_id=patient_user.id,
        residence_country="United States",
        preferred_destinations=["Thailand", "India", "Turkey"],
        treatment_category="Cardiology",
        budget_min=12000.0,
        budget_max=22000.0,
        currency="USD",
        preferred_language="English",
        travel_flexibility="flexible",
        approximate_travel_date="Within 60 days",
        accessibility_needs="Wheelchair assistance required at airport arrival gate",
        help_with_docs=True
    )
    db.add(pref)

    # 2. Knowledge Sources (RAG Grounding)
    ks1 = KnowledgeSource(
        title="Thailand Medical Tourist Visa (MT) Regulations 2026",
        publisher="Ministry of Public Health & Immigration Bureau Thailand",
        source_category="visa_policy",
        text_content="Patients entering Thailand for medical care can apply for a specialized Medical Tourist Visa valid for up to 90 days. Requires a confirmed appointment letter from a JCI-accredited or Ministry-registered healthcare provider and proof of financial solvency.",
        last_verified_date=now - timedelta(days=20)
    )
    ks2 = KnowledgeSource(
        title="JCI International Clinical Standards for Surgical Transfer",
        publisher="Joint Commission International",
        source_category="hospital_guideline",
        text_content="International patients undergoing cardiac interventions must have documented post-operative stability and a written 'Fit to Fly' clearance signed by the lead cardiothoracic surgeon prior to international air transit. A minimum recovery interval of 7-10 days is recommended.",
        last_verified_date=now - timedelta(days=15)
    )
    ks3 = KnowledgeSource(
        title="Post-Operative Cardiac Rehabilitation Protocol Guidelines",
        publisher="World Health Travel Federation",
        source_category="clinical_travel",
        text_content="Continuous accommodation within 15 minutes of the hospital facility is mandated until initial post-discharge suture check and echocardiogram follow-up is concluded.",
        last_verified_date=now - timedelta(days=10)
    )
    db.add_all([ks1, ks2, ks3])

    # 3. Create 3 International Hospitals
    h1 = Hospital(
        name="Bangkok Global Health & Cardiology Center",
        country="Thailand",
        city="Bangkok",
        address="33 Sukhumvit Soi 3, Wattana, Bangkok 10110",
        website="https://bangkok-global-cardio.demo.mediglobe.ai",
        description="Premier international tertiary medical facility renowned for minimally invasive cardiac surgery, valve repair, and dedicated multilingual patient concierges.",
        logo_url="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80",
        rating_score=4.9,
        is_verified=True,
        verification_date=now - timedelta(days=45),
        verified_by="Platform Admin (Eleanor Vance)",
        verification_notes="Verified against Joint Commission International Gold Seal registry (Accreditation ID: JCI-THA-88214).",
        is_demo_data=True,
        languages=["English", "Thai", "Arabic", "Japanese", "German"],
        contact_email="international@bangkok-global-cardio.demo",
        phone="+66 2 066 8888"
    )
    hospital_admin_user.hospital_id = h1.id

    h2 = Hospital(
        name="Apollo Apex Heart & Orthopedic Institute",
        country="India",
        city="New Delhi",
        address="Sarita Vihar, Delhi Mathura Road, New Delhi 110076",
        website="https://apollo-apex.demo.mediglobe.ai",
        description="Renowned quaternary referral centre with over 25,000 successful cardiac interventions and advanced robotic joint replacement suites.",
        logo_url="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80",
        rating_score=4.8,
        is_verified=True,
        verification_date=now - timedelta(days=60),
        verified_by="Platform Admin (Eleanor Vance)",
        verification_notes="National Accreditation Board for Hospitals & Healthcare Providers (NABH) & JCI verified.",
        is_demo_data=True,
        languages=["English", "Hindi", "French", "Russian", "Arabic"],
        contact_email="helpdesk@apollo-apex.demo",
        phone="+91 11 2692 5858"
    )

    h3 = Hospital(
        name="Anatolia Euro-Care International Medical Center",
        country="Turkey",
        city="Istanbul",
        address="Barbaros Bulvari No. 128, Besiktas, Istanbul 34349",
        website="https://anatolia-eurocare.demo.mediglobe.ai",
        description="Eurasian medical bridge hospital delivering advanced oncology, proton therapy, and complex cardiovascular surgery with panoramic Bosphorus recovery suites.",
        logo_url="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80",
        rating_score=4.7,
        is_verified=False,  # Intentionally unverified for hackathon admin verification demo!
        verification_date=None,
        verified_by=None,
        verification_notes="Pending platform compliance document verification. Credential dossier submitted 3 days ago.",
        is_demo_data=True,
        languages=["English", "Turkish", "Russian", "Arabic"],
        contact_email="liaison@anatolia-eurocare.demo",
        phone="+90 212 310 2000"
    )
    db.add_all([h1, h2, h3])
    db.flush()

    # Hospital Credentials
    c1 = HospitalCredential(
        hospital_id=h1.id,
        title="JCI Gold Seal of Approval for Hospital Program",
        issuer="Joint Commission International",
        issue_date=now - timedelta(days=400),
        expiry_date=now + timedelta(days=695),
        credential_type="accreditation",
        verification_status="verified",
        verified_at=now - timedelta(days=45),
        evidence_url="https://jci.org/verify/THA-88214",
        notes="Triennial survey completed with exemplary rating."
    )
    c2 = HospitalCredential(
        hospital_id=h2.id,
        title="NABH Excellence in Tertiary Cardiology Care",
        issuer="National Accreditation Board for Hospitals",
        issue_date=now - timedelta(days=300),
        expiry_date=now + timedelta(days=795),
        credential_type="accreditation",
        verification_status="verified",
        verified_at=now - timedelta(days=60),
        evidence_url="https://nabh.co/verify/IND-44910",
        notes="Continuous quality index > 98%."
    )
    c3 = HospitalCredential(
        hospital_id=h3.id,
        title="TUV Rheinland ISO 9001:2015 Healthcare Management",
        issuer="TUV Rheinland",
        issue_date=now - timedelta(days=90),
        expiry_date=now + timedelta(days=640),
        credential_type="iso_certification",
        verification_status="pending_review",  # Demonstrates verification workflow
        verified_at=None,
        evidence_url="https://tuv.demo/cert/TURK-1092",
        notes="Awaiting administrator verification review."
    )
    db.add_all([c1, c2, c3])

    # Hospital Services
    s1 = HospitalService(hospital_id=h1.id, category="Cardiology", service_name="Minimally Invasive Valve Repair & Replacement", description="Transcatheter aortic valve implantation (TAVI) and endoscopic mitral repair.")
    s2 = HospitalService(hospital_id=h1.id, category="Cardiology", service_name="Coronary Artery Bypass Grafting (CABG)", description="Beating-heart off-pump bypass with rapid recovery protocol.")
    s3 = HospitalService(hospital_id=h2.id, category="Cardiology", service_name="Complex Robotic Angioplasty & Bypass", description="Precision robotic-assisted coronary intervention with bio-resorbable stents.")
    s4 = HospitalService(hospital_id=h3.id, category="Cardiology", service_name="Transcatheter Structural Heart Interventions", description="Comprehensive hybrid catheterization laboratory procedures.")
    db.add_all([s1, s2, s3, s4])

    # Treatment Estimates
    e1 = TreatmentEstimate(
        hospital_id=h1.id,
        treatment_category="Cardiology",
        treatment_name="Coronary Artery Bypass & Heart Valve Reconstruction",
        currency="USD",
        base_cost=15500.0,
        min_cost=14200.0,
        max_cost=18000.0,
        inclusions=["Surgeon & surgical team fees", "Pre-op consultations", "4-night standard private room stay", "Operating theatre fees", "Routine post-op nursing care"],
        exclusions=["Contingency ICU days beyond 48 hours", "Post-discharge rehabilitation medications", "Airport transfers", "Companion accommodation"],
        notes="Quotation based on standard clinical presentation without severe comorbidities.",
        is_published=True,
        is_demo_data=True
    )
    e2 = TreatmentEstimate(
        hospital_id=h2.id,
        treatment_category="Cardiology",
        treatment_name="Coronary Artery Bypass Graft (Off-Pump Beating Heart)",
        currency="USD",
        base_cost=9800.0,
        min_cost=8900.0,
        max_cost=12000.0,
        inclusions=["Surgical package", "Standard 5-day room", "Basic pre-op lab work", "Surgeon consultations"],
        exclusions=["Specialized drug-eluting stents if needed", "High-dependency stepdown room", "International interpreter services"],
        notes="Highly cost-competitive bundle for international patients.",
        is_published=True,
        is_demo_data=True
    )
    e3 = TreatmentEstimate(
        hospital_id=h3.id,
        treatment_category="Cardiology",
        treatment_name="Cardiovascular Valve Repair & Angioplasty Suite",
        currency="USD",
        base_cost=13200.0,
        min_cost=12000.0,
        max_cost=16500.0,
        inclusions=["Operating room", "Surgical specialist fee", "3 nights private room"],
        exclusions=["Diagnostic catheterization angiography", "Extended stay", "Local transfer"],
        notes="Awaiting formal pricing verification by platform administrator.",
        is_published=False,  # Unverified estimate
        is_demo_data=True
    )
    db.add_all([e1, e2, e3])
    db.flush()

    # 4. Create Active Demo Journey for Sarah Jenkins
    journey = Journey(
        user_id=patient_user.id,
        title="Bangkok Cardiac Care Journey: Sarah Jenkins",
        treatment_category="Cardiology",
        selected_hospital_id=h1.id,
        status="planning",
        readiness_score=0.0,
        departure_date=now + timedelta(days=12),
        return_date=now + timedelta(days=26),
        currency="USD",
        total_estimated_cost=18350.0
    )
    db.add(journey)
    db.flush()

    # Stages and Tasks
    stages_defs = [
        ("Initial Preparation", 1, "completed"),
        ("Hospital Discovery & Verification", 2, "completed"),
        ("Consultation Coordination", 3, "in_progress"),
        ("Cost and Budget Review", 4, "in_progress"),
        ("Travel Preparation", 5, "not_started"),
        ("Appointment Coordination & Hospital Stay", 6, "not_started"),
        ("Post-Treatment Follow-up & Return Care", 7, "not_started")
    ]
    created_stages = {}
    for name, order, st_status in stages_defs:
        s = JourneyStage(journey_id=journey.id, stage_order=order, stage_name=name, status=st_status)
        db.add(s)
        created_stages[order] = s
    db.flush()

    # Tasks
    t1 = JourneyTask(stage_id=created_stages[1].id, journey_id=journey.id, title="Compile Prior Cardiogram & Echo Scans", description="Gather recent echocardiogram recordings and cardiologist reports in English.", status="completed", priority="high", responsible_party="patient")
    t2 = JourneyTask(stage_id=created_stages[1].id, journey_id=journey.id, title="Verify Passport Expiration Date", description="Passport valid through December 2028 (Complies with 6-month rule).", status="completed", priority="urgent", responsible_party="patient")
    t3 = JourneyTask(stage_id=created_stages[2].id, journey_id=journey.id, title="Review Bangkok Global Health JCI Credentials", description="Hospital credentials verified on platform with Gold Seal accreditation.", status="completed", priority="medium", responsible_party="patient")
    t4 = JourneyTask(stage_id=created_stages[3].id, journey_id=journey.id, title="Attend Virtual Pre-Operative Consultation", description="Teleconsultation with Dr. Prasert to review surgical approach and anesthesia clearance.", status="completed", priority="high", responsible_party="hospital_coordinator")
    t5 = JourneyTask(stage_id=created_stages[4].id, journey_id=journey.id, title="Confirm Estimate Inclusions vs Out-of-Pocket Expenses", description="Review quotation exclusions: Quote does not include post-discharge recovery lodge and prescription meds.", status="in_progress", priority="urgent", responsible_party="patient", warning_notes="Quote missing local medical transfers.")
    t6 = JourneyTask(stage_id=created_stages[5].id, journey_id=journey.id, title="Book Airport Medical Transfer & Hotel", description="Reserve transport from Suvarnabhumi Airport and recovery hotel.", status="in_progress", priority="high", responsible_party="patient", requires_confirmation=True)
    t7 = JourneyTask(stage_id=created_stages[6].id, journey_id=journey.id, title="In-Person Pre-Op Admission & Blood Panel", description="Check-in at International Patient Pavilion for blood cross-matching and final ECG.", status="not_started", priority="urgent", responsible_party="hospital_coordinator")
    t8 = JourneyTask(stage_id=created_stages[7].id, journey_id=journey.id, title="Final Clinician Consultation & Fit-to-Fly Certification", description="Undergo final post-op ultrasound and receive signed fit-to-fly dossier.", status="not_started", priority="high", responsible_party="hospital_coordinator")
    db.add_all([t1, t2, t3, t4, t5, t6, t7, t8])

    # Cost Line Items (Programmatic breakdown with deliberate missing category and unconfirmed items)
    li1 = EstimateLineItem(journey_id=journey.id, estimate_id=e1.id, category="provider_procedure", item_name="Bypass & Reconstruction Surgical Package", estimated_amount=15500.0, currency="USD", confirmation_status="confirmed", is_included_in_base=True, source_reference="Hospital Official Quote #BGHC-2026-901")
    li2 = EstimateLineItem(journey_id=journey.id, estimate_id=e1.id, category="diagnostics", item_name="On-site Cardiac Imaging & Pre-Op Lab Suite", estimated_amount=650.0, currency="USD", confirmation_status="confirmed", is_included_in_base=False, source_reference="Diagnostic Fee Schedule")
    li3 = EstimateLineItem(journey_id=journey.id, estimate_id=e1.id, category="consultation", item_name="Lead Surgeon & Anesthesiologist Consultations", estimated_amount=400.0, currency="USD", confirmation_status="confirmed", is_included_in_base=True)
    li4 = EstimateLineItem(journey_id=journey.id, estimate_id=e1.id, category="accommodation", item_name="Sukhumvit Executive Suites (Recovery Stay)", estimated_amount=1800.0, currency="USD", confirmation_status="estimated", is_included_in_base=False, notes="Tentative estimate; 12 nights @ $150/night")
    # Notice: 'transport' category is intentionally omitted so the Cost Intelligence Centre detects the missing category!
    db.add_all([li1, li2, li3, li4])

    # 5. Travel Arrangements & Appointments with INTENTIONAL LOGISTICAL CONFLICTS
    # Conflict A: Airport Transfer overlapping with In-Person Consultation!
    # Conflict B: Hotel reservation checkout happens BEFORE follow-up consultation!
    
    # Inbound Flight
    arr_flight = TravelArrangement(
        journey_id=journey.id,
        arrangement_type="flight",
        provider_name="Thai Airways Flight TG 917",
        confirmation_code="TG-MED-9941",
        start_time=now + timedelta(days=12, hours=10),
        end_time=now + timedelta(days=12, hours=19),
        departure_location="London Heathrow (LHR)",
        arrival_location="Bangkok Suvarnabhumi (BKK)",
        cost=1100.0,
        currency="USD",
        status="confirmed",
        notes="Wheelchair assistance requested on arrival."
    )
    
    # Airport Transfer: Scheduled at Day 13 from 10:00 to 12:30
    arr_transfer = TravelArrangement(
        journey_id=journey.id,
        arrangement_type="transfer",
        provider_name="Bangkok Hospital Limousine & Patient Transfer",
        confirmation_code="TRF-8812",
        start_time=now + timedelta(days=13, hours=10),
        end_time=now + timedelta(days=13, hours=12, minutes=30),
        departure_location="Bangkok Suvarnabhumi (BKK)",
        arrival_location="Sukhumvit Executive Suites",
        cost=75.0,
        currency="USD",
        status="confirmed"
    )

    # Hotel Stay: Check-out on Day 21 at 11:00 AM
    arr_hotel = TravelArrangement(
        journey_id=journey.id,
        arrangement_type="hotel",
        provider_name="Sukhumvit Medical Executive Suites",
        confirmation_code="HTL-SUKH-541",
        start_time=now + timedelta(days=13, hours=12),
        end_time=now + timedelta(days=21, hours=11),  # Premature checkout!
        departure_location="Bangkok",
        arrival_location="Sukhumvit Soi 5",
        cost=1800.0,
        currency="USD",
        status="tentative",
        notes="Ground floor suite reserved with elevator access."
    )
    db.add_all([arr_flight, arr_transfer, arr_hotel])

    # Appointments:
    # 1. Hospital Consultation: Day 13 from 11:00 to 12:00 -> OVERLAPS with Airport Transfer!
    apt_consult = Appointment(
        journey_id=journey.id,
        hospital_id=h1.id,
        appointment_type="In-Person Surgical Pre-Op Evaluation",
        start_time=now + timedelta(days=13, hours=11),
        end_time=now + timedelta(days=13, hours=12),
        location="Bangkok Global Health - Building A, 4th Floor",
        doctor_name="Dr. Somchai Prasert",
        department="Cardiovascular Surgery",
        status="scheduled",
        is_teleconsult=False,
        notes="Mandatory pre-operative assessment with lead surgeon."
    )

    # 2. Cardiac Procedure: Day 15
    apt_surgery = Appointment(
        journey_id=journey.id,
        hospital_id=h1.id,
        appointment_type="Minimally Invasive Cardiac Procedure",
        start_time=now + timedelta(days=15, hours=8),
        end_time=now + timedelta(days=15, hours=14),
        location="Operating Suite 6B",
        doctor_name="Dr. Somchai Prasert",
        department="Cardiovascular Surgery",
        status="confirmed",
        is_teleconsult=False
    )

    # 3. Post-Op Follow-up Appointment: Day 23 -> Hotel check-out is Day 21! CONFLICT!
    apt_followup = Appointment(
        journey_id=journey.id,
        hospital_id=h1.id,
        appointment_type="Post-Operative Follow-Up & Fit-to-Fly Evaluation",
        start_time=now + timedelta(days=23, hours=9),
        end_time=now + timedelta(days=23, hours=11),
        location="Outpatient Cardiology Clinic, Room 402",
        doctor_name="Dr. Somchai Prasert",
        department="Cardiovascular Surgery",
        status="scheduled",
        is_teleconsult=False,
        notes="Final echocardiogram and suture inspection before international flight clearance."
    )
    db.add_all([apt_consult, apt_surgery, apt_followup])

    # 6. Sample Documents in Private Storage
    doc1 = Document(
        user_id=patient_user.id,
        journey_id=journey.id,
        filename="sarah_jenkins_passport_encrypted.pdf",
        original_name="Sarah_Jenkins_Passport_Copy.pdf",
        file_size=1420580,
        mime_type="application/pdf",
        file_path="storage/documents/sarah_jenkins_passport_encrypted.pdf",
        category="passport",
        is_sensitive=True,
        ai_summary="Valid passport issued by United States of America. Expiration date: Dec 14, 2028. Full name matches journey patient.",
        extracted_metadata={"document_type": "passport", "country": "USA", "verified_date": "2026-08-10"}
    )
    doc2 = Document(
        user_id=patient_user.id,
        journey_id=journey.id,
        filename="bangkok_cardio_official_quotation.pdf",
        original_name="Bangkok_Hospital_Quotation_BGHC901.pdf",
        file_size=874920,
        mime_type="application/pdf",
        file_path="storage/documents/bangkok_cardio_official_quotation.pdf",
        category="hospital_quote",
        is_sensitive=True,
        ai_summary="Official quotation for Coronary Artery Bypass ($15,500 USD). Includes surgeon fees, 4-night inpatient stay. Excludes post-discharge prescriptions and transport.",
        extracted_metadata={"total_quoted": 15500.0, "currency": "USD", "provider": "Bangkok Global Health"}
    )
    db.add_all([doc1, doc2])
    db.flush()

    # Document Permissions (Granted to Bangkok Global Health coordinator)
    perm = DocumentPermission(
        document_id=doc2.id,
        granted_to_user_id=hospital_admin_user.id,
        granted_to_hospital_id=h1.id,
        permission_type="view",
        expires_at=now + timedelta(days=60),
        is_active=True
    )
    db.add(perm)

    # Consent Records
    cons1 = Consent(user_id=patient_user.id, consent_type="data_processing", is_granted=True, granted_at=now - timedelta(days=5), ip_address="198.51.100.42")
    cons2 = Consent(user_id=patient_user.id, consent_type="ai_analysis", is_granted=True, granted_at=now - timedelta(days=5), ip_address="198.51.100.42")
    cons3 = Consent(user_id=patient_user.id, consent_type="hospital_sharing", is_granted=True, granted_at=now - timedelta(days=5), ip_address="198.51.100.42")
    db.add_all([cons1, cons2, cons3])

    # Audit Logs
    a1 = AuditLog(user_id=patient_user.id, action="journey_created", resource_type="journey", resource_id=journey.id, details={"title": journey.title}, ip_address="198.51.100.42")
    a2 = AuditLog(user_id=patient_user.id, action="document_uploaded", resource_type="document", resource_id=doc1.id, details={"filename": doc1.original_name}, ip_address="198.51.100.42")
    a3 = AuditLog(user_id=platform_admin_user.id, action="verify_hospital", resource_type="hospital", resource_id=h1.id, details={"status": "verified"}, ip_address="203.0.113.19")
    db.add_all([a1, a2, a3])

    db.commit()

    # Run conflict detection & readiness scoring for the journey
    sync_journey_alerts(db, journey.id)
    calculate_readiness_score(db, journey.id)

    print("Database successfully seeded with realistic international healthcare data, conflicting appointments, unverified credentials, and documents!")
    db.close()

if __name__ == "__main__":
    seed_database()
