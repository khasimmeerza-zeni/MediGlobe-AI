# MediGlobe AI 🌐🩺

### AI-Powered Global Medical Tourism and Journey Planning Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python_3.12-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14_TypeScript-000000.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS_3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

MediGlobe AI coordinates international medical travel across borders. Rather than functioning as a static hospital directory, MediGlobe AI couples **AI Medical Journey Planning** with a **Deterministic Rule-Based Conflict Engine** to continuously validate itineraries, expose hidden healthcare costs, and safeguard patient travel logistics.

---

## 🌟 Key Highlights & Unique Selling Proposition (USP)

1. **AI Journey Intelligence Engine**: Generates an end-to-end 7-stage personalized itinerary covering Initial Preparation, Hospital Discovery, Consultation Coordination, Cost & Budget Review, Travel Preparation, In-Hospital Procedures, and Post-Treatment Follow-up.
2. **Deterministic Logistical Conflict Detector**: Application-level rules mathematically identify schedule collisions (e.g. airport transfer overlapping with surgical consultation, hotel reservation ending before mandatory post-op follow-up).
3. **Transparent Journey Readiness Score (0 to 100)**: Calculated exclusively from 5 defined logistical checkpoints (Documents, Hospital Confirmation, Cost Ledger, Travel Synchronization, and Post-Op Continuity).
4. **Treatment Cost Intelligence**: Programmatic line-item cost categorization (procedure, diagnostics, consultations, lodging, ground transport) with automated missing category detection.
5. **Hospital Comparison Matrix**: Side-by-side comparison of up to 3 medical facilities detailing JCI/NABH/ISO accreditations, package inclusions, exclusions, and AI profile fit analysis.
6. **Secure Document Centre & Consent Engine**: Private object storage without public URLs, time-limited revocable hospital sharing permissions, and immutable audit logging.
7. **Zero-API-Key Mock AI Mode**: Runs fully offline with rich deterministic simulation data, with optional one-line switching to Google Gemini or OpenAI.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, React, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy ORM, Alembic |
| **Database** | SQLite (default out-of-the-box local) / PostgreSQL (production/Docker) |
| **AI Layer** | Configurable AI Provider Abstraction (`MockAIProvider`, `GeminiProvider`, `OpenAIProvider`), RAG grounding |
| **Security** | JWT Authentication, Role-Based Access Control (`patient`, `hospital_admin`, `platform_admin`), Private File Storage, Audit Logging |

---

## 🚀 Quick Start Guide (Local Development)

### Prerequisites
* **Python 3.12+**
* **Node.js 20+** and **npm**

### Step 1: Clone and Set Up Backend

```bash
# In the root repository directory
python -m pip install -r backend/requirements.txt

# Run the database seeder (populates rich international demo dataset)
python -m backend.app.seed

# Start the FastAPI backend server
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend API interactive documentation will be available at: **http://localhost:8000/api/v1/docs**

### Step 2: Set Up and Run Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🐳 Docker Deployment

To launch the full stack (PostgreSQL 16, FastAPI backend, Next.js frontend) using Docker Compose:

```bash
docker-compose up --build
```
* **Frontend**: `http://localhost:3000`
* **Backend API Docs**: `http://localhost:8000/api/v1/docs`
* **PostgreSQL**: `localhost:5432`

---

## 👥 Demo Personas (1-Click Switcher)

For hackathon judges and evaluators, the navbar features a quick persona switcher to test every role:

| Persona | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@mediglobe.ai` | `password123` | Active cardiac journey, 7-stage timeline, documents, travel calendar |
| **Hospital Admin** | `hospital@mediglobe.ai` | `password123` | Bangkok Global Health coordinator profile & authorized documents |
| **Platform Admin** | `admin@mediglobe.ai` | `password123` | Credential verification queue, security audit trail, demo data reset |

---

## 🧪 Automated Testing

MediGlobe AI includes comprehensive automated backend test suites testing authentication, role permissions, conflict detection, cost mathematics, and hospital comparisons:

```bash
# Run the test suite
python -m pytest backend/tests -v
```

All 13 automated tests pass with 100% success!

---

## 📁 Repository Structure

```
Project2/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI initialization & route mounting
│   │   ├── core/                    # Security, database session, configuration
│   │   ├── models/                  # 20 SQLAlchemy models (Users, Journeys, Hospitals, Docs)
│   │   ├── schemas/                 # Pydantic request & response validation schemas
│   │   ├── services/                # Conflict detector, readiness scorer, cost service
│   │   ├── ai/                      # AI Provider abstraction & RAG knowledge module
│   │   ├── api/v1/                  # REST API routes (auth, hospitals, journeys, costs, docs)
│   │   └── seed.py                  # Realistic international healthcare dataset
│   ├── tests/                       # Pytest automated test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Page 1: Landing Page
│   │   ├── dashboard/page.tsx       # Page 2: Patient Dashboard
│   │   ├── planner/page.tsx         # Page 3: AI Journey Planner
│   │   ├── timeline/page.tsx        # Page 4: AI Journey Timeline (7 Stages)
│   │   ├── hospitals/page.tsx       # Page 5: Global Hospital Explorer
│   │   ├── compare/page.tsx         # Page 6: Hospital Comparison Matrix
│   │   ├── costs/page.tsx           # Page 7: Treatment Cost Intelligence
│   │   ├── intelligence/page.tsx    # Page 8: Journey Intelligence Centre (USP)
│   │   ├── documents/page.tsx       # Page 9: Secure Document Centre
│   │   ├── travel/page.tsx          # Page 10: Travel Coordinator
│   │   ├── follow-up/page.tsx       # Page 11: Follow-up Care Coordinator
│   │   ├── admin/page.tsx           # Page 12: Hospital & Platform Admin Portals
│   │   └── login/page.tsx           # Interactive Login & Persona Switcher
│   ├── components/                  # Navbar, Footer, UI components
│   ├── lib/                         # API client, Auth Context, Utilities
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── architecture.md              # System design & Mermaid pipeline
│   ├── api.md                       # Comprehensive REST API catalog
│   └── demo-script.md               # 5-minute hackathon judge presentation script
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚖️ Clinical Safety & Legal Disclaimer

* MediGlobe AI is an administrative medical travel coordination and logistics decision-support platform.
* It does **not** independently diagnose medical conditions, prescribe medications or treatments, determine clinical suitability, or guarantee clinical surgical outcomes.
* In the event of an acute medical emergency, patients are instructed to immediately dial local emergency services (e.g., 911, 999, 112, 1669) rather than relying on automated software.

---

## 📄 License
This project is open-source under the MIT License.
