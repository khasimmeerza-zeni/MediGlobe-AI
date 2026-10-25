# MediGlobe AI — Hackathon Demonstration Script

This script provides an engaging, step-by-step 5-minute presentation guide designed for hackathon judges and evaluators.

---

## Pre-Demo Setup (Takes 5 Seconds)

1. Start backend: `python -m uvicorn backend.app.main:app --reload --port 8000`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:3000`
4. The database is already pre-seeded with Sarah Jenkins' active Bangkok Cardiac journey!

---

## Step 1: Problem Statement & Landing Page (0:00 - 0:45)

* **Where**: Navigate to `http://localhost:3000`
* **What to Show**:
  * Highlight the headline: *"Your Global Medical Journey, Intelligently Planned."*
  * Explain the gap: Over 14 million people travel across borders each year for healthcare, but they rely on static marketing directories, encounter hidden out-of-pocket hospital costs, and face catastrophic logistical conflicts (missed transfers, premature hotel checkouts before surgical clearance).
  * Show the interactive "Journey Readiness Engine" preview card directly on the hero.

---

## Step 2: Patient Dashboard & Journey Readiness Score (0:45 - 1:30)

* **Where**: Click **"Dashboard"** in the top navigation or click *"Sign In"* -> select **"Patient (Sarah Jenkins)"**.
* **What to Show**:
  * **Journey Readiness Score (75/100)**: Explain that this is a transparent, administrative logistical indicator based exclusively on 5 concrete checkpoints (Documents, Hospital Selection, Cost Ledger, Travel Sync, and Post-Op Care). It does not score clinical suitability or treatment outcomes.
  * **Logistical Discrepancy Alert**: Point to the alert card displaying an overlap between an airport transfer and an in-person surgical evaluation.
  * **Cost Summary**: $18,350 total, with $16,550 confirmed and $1,800 pending, plus an automated banner warning about missing budget categories.

---

## Step 3: Global Hospital Explorer & 3-Way Side-by-Side Comparison (1:30 - 2:30)

* **Where**: Click **"Hospitals"** in the top navigation.
* **What to Show**:
  * Filter by Country: Select **"Thailand"**, **"India"**, or **"Turkey"**.
  * Point out verified accreditations: Bangkok Global Health has verified JCI Gold Seal; Anatolia Euro-Care in Istanbul has *"Pending Audit"* badge.
  * Check the **"Compare"** button on Bangkok Global Health, Apollo Apex Heart Institute, and Anatolia Euro-Care.
  * Click **"Compare Now"** in the floating bottom dock:
    * Show the side-by-side matrix comparing package inclusions vs exclusions.
    * Point out the **AI Profile Fit Analysis** explaining why each hospital matches the patient's care needs.
    * Show the medical disclaimer at the bottom.

---

## Step 4: Cost Intelligence & Missing Expense Detection (2:30 - 3:15)

* **Where**: Click **"Cost Intel"** in the top navigation.
* **What to Show**:
  * Explain our **Zero-Hallucination Arithmetic** principle: AI never performs financial arithmetic; totals are computed programmatically by backend Python services.
  * Point to the **Missing Essential Category Banner**: The platform flags that the hospital quotation is missing local medical ground transfers.
  * Demonstrate adding an expense item: Click **"Add Expense Item"**, enter $150 for Airport/Hospital Shuttle, and save.
  * Notice how the completeness percentage and readiness score immediately update!

---

## Step 5: The Primary USP — Journey Intelligence Centre (3:15 - 4:15)

* **Where**: Click **"Intelligence"** in the top navigation.
* **What to Show**:
  * Click **"Re-Scan Journey Rules"**.
  * Highlight the detected logistical discrepancies:
    1. **Critical Overlap**: The airport transfer window collides with Dr. Prasert's in-person pre-op hospital consultation.
    2. **Lodging Conflict**: The Sukhumvit hotel checkout occurs on Day 21, but the mandatory post-op echocardiogram and Fit-to-Fly consult occurs on Day 23! The patient would have nowhere to rest!
  * Show the **AI Plain-Language Analysis**: Explains the risks and suggests actionable administrative steps.
  * Click **"Mark Acknowledged"** to resolve an alert.

---

## Step 6: Secure Documents, Consent & Administration (4:15 - 5:00)

* **Where**: Click **"Documents"** in the top navigation.
* **What to Show**:
  * Private file repository (no public URLs; signed access only).
  * Show AI Administrative Summaries extracted from the uploaded passport and quotation.
  * Switch to **"Consent & Permissions"** tab: Toggle consent for hospital sharing and AI processing.
* **Where**: Switch to **"Admin Portal"** via the top persona switcher:
  * Show the pending verification queue for Anatolia Euro-Care.
  * Click **"Approve Credentials"**: The hospital is instantly certified with a verified timestamp and admin signature.
  * Review the real-time **Security & Audit Trail** recording every action.

---

## Closing Summary

"MediGlobe AI transforms medical tourism from a risky, disjointed ordeal into a verified, transparent, and coordinated journey — powered by intelligent planning and bulletproof logistical rules."
