# MediGlobe AI — REST API Documentation

Base URL: `/api/v1`

Interactive OpenAPI Documentation: `http://localhost:8000/api/v1/docs`

---

## 1. Authentication & Preferences

### `POST /auth/register`
* **Description**: Register a new patient, hospital admin, or platform admin.
* **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "full_name": "Jane Doe",
    "role": "patient"
  }
  ```
* **Response**: `201 Created` with JWT access token and user profile.

### `POST /auth/login`
* **Description**: Authenticate using email and password.
* **Payload**: `{"email": "patient@mediglobe.ai", "password": "password123"}`
* **Response**: `200 OK` with `access_token` (Bearer) and user details.

### `GET /auth/me`
* **Security**: Bearer Token required.
* **Response**: Current authenticated user record.

### `POST /auth/preferences`
* **Description**: Save patient travel parameters, budget constraints, and accessibility requirements.

---

## 2. Hospitals & Comparison

### `GET /hospitals`
* **Query Parameters**:
  * `country`: Filter by host nation (e.g., "Thailand", "India", "Turkey").
  * `treatment`: Filter by medical category (e.g., "Cardiology").
  * `verified_only`: Boolean (`true`/`false`).
* **Response**: Array of hospitals with verified accreditations, services, and treatment estimates.

### `GET /hospitals/compare`
* **Query Parameters**: `ids` (comma-separated list of up to 3 hospital UUIDs).
* **Response**: Side-by-side comparison matrix, including AI profile match explanations and package inclusions/exclusions.

### `POST /hospitals/{hospital_id}/consult-request`
* **Description**: Transmit a non-confidential preliminary consultation inquiry to the hospital coordinator.

---

## 3. Journeys & AI Planner

### `POST /journeys`
* **Description**: Triggers the AI Medical Journey Intelligence Engine pipeline.
* **Payload**:
  ```json
  {
    "title": "Cardiac Care Journey: Bangkok",
    "treatment_category": "Cardiology",
    "selected_hospital_id": "uuid",
    "currency": "USD"
  }
  ```
* **Response**: `201 Created` containing full 7-stage itinerary, stages, and tasks.

### `GET /journeys`
* **Security**: Enforces object-level isolation. Patients see only their own journeys; hospital admins see journeys matching their hospital ID; platform admins see all.

### `PATCH /journeys/{journey_id}`
* **Description**: Update travel dates, title, or status (`planning`, `booked`, `in_travel`, `completed`).

---

## 4. Tasks & Timeline

### `GET /journeys/{journey_id}/tasks`
* **Response**: All tasks grouped by the 7 journey stages.

### `PATCH /tasks/{task_id}`
* **Payload**: `{"status": "completed"}` or `{"priority": "urgent"}`
* **Side-Effect**: Automatically recalculates Journey Readiness Score and checks for dependency conflicts.

---

## 5. Cost Intelligence

### `GET /journeys/{journey_id}/costs`
* **Response**:
  * `grand_total`: Programmatically calculated float.
  * `confirmed_total` & `unconfirmed_total`.
  * `categories`: Grouped by procedure, diagnostics, consultation, lodging, transport.
  * `missing_categories`: Array of detected missing budget components.
  * `confidence_level`: "high", "medium", or "insufficient_information".

### `POST /costs/compare`
* **Description**: Cross-hospital pricing benchmark for a given treatment category.

---

## 6. Journey Intelligence Centre

### `POST /journeys/{journey_id}/validate`
* **Description**: Runs deterministic rule-based conflict detector, updates alerts, calculates transparent readiness score, and returns plain-language AI explanation.
* **Response**:
  ```json
  {
    "readiness_score": 75.0,
    "score_grade": "Moderate Readiness (Action Items Pending)",
    "metrics_breakdown": [...],
    "total_alerts": 2,
    "alerts": [...],
    "ai_executive_summary": "• Schedule conflict: In-Person Consultation overlaps with Airport Transfer..."
  }
  ```

### `PATCH /alerts/{alert_id}/resolve`
* **Description**: Mark a detected alert acknowledged or resolved.

---

## 7. Secure Documents & Consents

### `POST /documents`
* **Content-Type**: `multipart/form-data`
* **Validation**: File extension (.pdf, .jpg, .png, .docx, .txt), max size 25 MB.
* **Storage**: Encrypted private storage (never accessible via public URLs).

### `GET /documents/{document_id}/download`
* **Security**: Enforces strict backend authorization checks before streaming file bytes.

### `POST /documents/{document_id}/share`
* **Description**: Grant temporary, revocable access to a hospital coordinator.

### `POST /consents`
* **Payload**: `{"consent_type": "hospital_sharing", "is_granted": true}`

---

## 8. Travel & Appointments

### `GET /journeys/{journey_id}/appointments`
### `POST /journeys/{journey_id}/appointments`
### `GET /journeys/{journey_id}/travel`
### `POST /journeys/{journey_id}/travel`
* **Side-Effect**: Triggers conflict detection to ensure no timing overlap with hospital appointments.

---

## 9. Platform Administration

### `GET /admin/hospitals/pending-verification`
* **Security**: `require_roles(["platform_admin"])`

### `PATCH /admin/hospitals/{hospital_id}/verification`
* **Payload**: `{"is_verified": true, "verification_notes": "JCI Accreditation confirmed"}`

### `GET /admin/audit-logs`
* **Security**: Platform admin only. Displays immutable audit events.

### `POST /admin/demo-data/reset`
* **Description**: Re-seeds database with standard demonstration dataset.
