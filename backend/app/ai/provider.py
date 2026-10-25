from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import json
import httpx
from datetime import datetime
from backend.app.core.config import settings

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_journey_plan(self, preferences: Dict[str, Any], hospital: Optional[Dict[str, Any]], knowledge: List[str]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def explain_hospital_match(self, preferences: Dict[str, Any], hospital: Dict[str, Any]) -> str:
        pass

    @abstractmethod
    async def explain_cost_difference(self, category: str, comparison_data: List[Dict[str, Any]]) -> str:
        pass

    @abstractmethod
    async def explain_journey_conflicts(self, conflicts: List[Dict[str, Any]]) -> str:
        pass

    @abstractmethod
    async def summarize_document(self, text_snippet: str, category: str) -> Dict[str, Any]:
        pass


class MockAIProvider(BaseAIProvider):
    """
    Mock AI Provider designed for zero-API-key local development and deterministic hackathon demonstrations.
    Produces rich, structured, validated outputs tailored to user preferences and hospital parameters.
    """
    async def generate_journey_plan(self, preferences: Dict[str, Any], hospital: Optional[Dict[str, Any]], knowledge: List[str]) -> Dict[str, Any]:
        hospital_name = hospital.get("name", "Participating International Medical Centre") if hospital else "International Care Provider"
        country = hospital.get("country", preferences.get("preferred_destinations", ["International Destination"])[0] if preferences.get("preferred_destinations") else "Thailand")
        city = hospital.get("city", "Bangkok")
        treatment = preferences.get("treatment_category", "Specialized Care")
        
        stages = [
            {
                "stage_order": 1,
                "stage_name": "Initial Preparation",
                "tasks": [
                    {
                        "title": f"Gather previous diagnostic reports for {treatment}",
                        "description": "Collect recent imaging scans, blood work, and physician consultation notes in English or certified translation.",
                        "status": "completed",
                        "priority": "high",
                        "responsible_party": "patient",
                        "requires_confirmation": False,
                        "source_references": ["KNOW-MED-DOC-01"]
                    },
                    {
                        "title": "Verify Passport Validity (Minimum 6 Months)",
                        "description": f"Ensure your passport has at least 6 months remaining from planned entry into {country}.",
                        "status": "completed",
                        "priority": "urgent",
                        "responsible_party": "patient",
                        "requires_confirmation": False,
                        "source_references": ["KNOW-VISA-01"]
                    }
                ]
            },
            {
                "stage_order": 2,
                "stage_name": "Hospital Discovery & Verification",
                "tasks": [
                    {
                        "title": f"Review {hospital_name} Accreditations & Specialist Credentials",
                        "description": "Examine verified international certifications (JCI / ISO) and surgeon credentials on the MediGlobe explorer.",
                        "status": "completed",
                        "priority": "medium",
                        "responsible_party": "patient",
                        "requires_confirmation": False,
                        "source_references": ["HOSP-CRED-01"]
                    },
                    {
                        "title": "Submit Medical Dossier for Hospital Pre-Screening",
                        "description": f"Securely share diagnostic records with {hospital_name} International Patient Liaison for preliminary clinical review.",
                        "status": "in_progress",
                        "priority": "high",
                        "responsible_party": "patient",
                        "requires_confirmation": True,
                        "source_references": ["HOSP-LIAISON-01"]
                    }
                ]
            },
            {
                "stage_order": 3,
                "stage_name": "Consultation Coordination",
                "tasks": [
                    {
                        "title": "Attend Remote Teleconsultation with Attending Specialist",
                        "description": "Discuss procedure roadmap, pre-requisite testing, and anesthesia precautions with the primary surgical team.",
                        "status": "awaiting_confirmation",
                        "priority": "high",
                        "responsible_party": "hospital_coordinator",
                        "requires_confirmation": True,
                        "source_references": ["TELECONSULT-GUIDE-03"]
                    },
                    {
                        "title": "Request Hospital Official Invitation Letter for Medical Visa",
                        "description": f"Hospital coordinator issues formal treatment confirmation letter to support entry visa application for {country}.",
                        "status": "not_started",
                        "priority": "medium",
                        "responsible_party": "hospital_coordinator",
                        "requires_confirmation": True,
                        "source_references": ["VISA-MED-02"]
                    }
                ]
            },
            {
                "stage_order": 4,
                "stage_name": "Cost and Budget Review",
                "tasks": [
                    {
                        "title": "Review Treatment Estimate Breakdown & Exclusions",
                        "description": "Carefully inspect included surgeon and room fees vs excluded medications, ICU contingencies, and companion meals.",
                        "status": "in_progress",
                        "priority": "urgent",
                        "responsible_party": "patient",
                        "requires_confirmation": True,
                        "warning_notes": "Quote missing local transfer fees and post-discharge medication estimate.",
                        "source_references": ["COST-POLICY-01"]
                    },
                    {
                        "title": "Confirm International Payment & Currency Transfer Protocol",
                        "description": f"Validate payment options with {hospital_name} billing (wire transfer, international card, medical escort deposit).",
                        "status": "not_started",
                        "priority": "medium",
                        "responsible_party": "patient",
                        "requires_confirmation": False
                    }
                ]
            },
            {
                "stage_order": 5,
                "stage_name": "Travel Preparation",
                "tasks": [
                    {
                        "title": f"Book Return Flights with Medical Flexibility Insurance",
                        "description": f"Book flexible flights into {city} international airport allowing date changes in case recovery requires extension.",
                        "status": "not_started",
                        "priority": "high",
                        "responsible_party": "patient",
                        "requires_confirmation": True
                    },
                    {
                        "title": "Reserve Hospital-Adjacent Medical Recovery Accommodation",
                        "description": "Secure hotel or recovery apartment within 15 minutes of hospital with elevator access and dietary accommodation.",
                        "status": "not_started",
                        "priority": "high",
                        "responsible_party": "patient",
                        "requires_confirmation": True
                    },
                    {
                        "title": "Arrange Wheelchair-Accessible Airport Arrival Transfer",
                        "description": f"Coordinate verified airport liaison to receive patient at {city} arrival hall directly to accommodation.",
                        "status": "not_started",
                        "priority": "medium",
                        "responsible_party": "travel_agent",
                        "requires_confirmation": True
                    }
                ]
            },
            {
                "stage_order": 6,
                "stage_name": "Appointment Coordination & Hospital Stay",
                "tasks": [
                    {
                        "title": "Check-in for In-Person Hospital Admission & Pre-Op Testing",
                        "description": "Undergo on-site ECG, blood panel, and final anesthesiologist clearance at the international patient center.",
                        "status": "not_started",
                        "priority": "urgent",
                        "responsible_party": "hospital_coordinator",
                        "requires_confirmation": True
                    },
                    {
                        "title": f"Scheduled Procedure at {hospital_name}",
                        "description": f"Execute planned {treatment} procedure followed by monitored in-patient recovery under surgical team supervision.",
                        "status": "not_started",
                        "priority": "urgent",
                        "responsible_party": "hospital_coordinator",
                        "requires_confirmation": True
                    }
                ]
            },
            {
                "stage_order": 7,
                "stage_name": "Post-Treatment Follow-up & Return Care",
                "tasks": [
                    {
                        "title": "Receive Final Discharge Dossier & 'Fit to Fly' Certificate",
                        "description": "Obtain signed clinician discharge summary, operative report, imaging disc, and formal fit-to-fly documentation.",
                        "status": "not_started",
                        "priority": "high",
                        "responsible_party": "hospital_coordinator",
                        "requires_confirmation": True
                    },
                    {
                        "title": "Transfer Care Dossier to Home Country Primary Care Physician",
                        "description": "Safely share translated discharge recommendations and ongoing medication schedule with local physician.",
                        "status": "not_started",
                        "priority": "medium",
                        "responsible_party": "patient",
                        "requires_confirmation": False
                    },
                    {
                        "title": "Conduct 30-Day Virtual Post-Op Follow-up",
                        "description": "Remote teleconsultation with treating hospital team to review recovery benchmarks and surgical site healing.",
                        "status": "not_started",
                        "priority": "medium",
                        "responsible_party": "hospital_coordinator",
                        "requires_confirmation": True
                    }
                ]
            }
        ]

        return {
            "journey_title": f"Personalized Medical Travel Plan: {treatment} in {city}, {country}",
            "treatment_category": treatment,
            "destination_summary": f"{city}, {country}",
            "hospital_name": hospital_name,
            "stages": stages,
            "readiness_summary": "Initial preparation is underway. Key action items require confirming hospital quote details and accommodation dates.",
            "disclaimer": "This itinerary coordinates logistical, administrative, and travel milestones. It is not an automated medical diagnosis or surgical prescription."
        }

    async def explain_hospital_match(self, preferences: Dict[str, Any], hospital: Dict[str, Any]) -> str:
        treatment = preferences.get("treatment_category", "your required care")
        destinations = preferences.get("preferred_destinations", [])
        h_name = hospital.get("name", "The hospital")
        country = hospital.get("country", "")
        
        reasons = []
        if country in destinations or not destinations:
            reasons.append(f"Located in your preferred country ({country})")
        if hospital.get("is_verified"):
            reasons.append("Maintains verified institutional accreditations (JCI / ISO)")
        langs = hospital.get("languages", ["English"])
        reasons.append(f"Provides multilingual support in {', '.join(langs)}")
        
        return f"{h_name} matches your profile for {treatment}: " + "; ".join(reasons) + ". Treatment estimates and dedicated international patient coordination are available."

    async def explain_cost_difference(self, category: str, comparison_data: List[Dict[str, Any]]) -> str:
        names = [item.get("hospital_name", "Provider") for item in comparison_data]
        return (
            f"Cost analysis for {category} across {', '.join(names)}: Variations typically reflect differences in included room categories (single private vs deluxe suite), "
            "bundled diagnostic panels, and whether airport transfers or post-procedure rehabilitation days are included in the base package. "
            "Always inspect specific excluded line items such as contingency ICU days before finalizing."
        )

    async def explain_journey_conflicts(self, conflicts: List[Dict[str, Any]]) -> str:
        if not conflicts:
            return "No critical logistical conflicts or timing overlaps detected across your scheduled appointments, transfers, and accommodation."
        
        summary_lines = []
        for c in conflicts:
            summary_lines.append(f"• [{c.get('severity', 'warning').upper()}] {c.get('description')}: {c.get('suggested_action')}")
        
        return "Logistical Analysis Detected Administrative Issues:\n" + "\n".join(summary_lines)

    async def summarize_document(self, text_snippet: str, category: str) -> Dict[str, Any]:
        return {
            "summary": f"Administrative extract for {category}: Document contains patient identification and clinical authorization markers suitable for international coordination.",
            "document_type": category,
            "confidence": "high",
            "needs_human_verification": True,
            "ai_extracted_fields": {
                "document_verified": False,
                "note": "Document uploaded securely to private repository."
            }
        }


class GeminiProvider(BaseAIProvider):
    """
    Google Gemini Provider implementation when GEMINI_API_KEY is supplied.
    Falls back gracefully to MockAIProvider if network error occurs.
    """
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback = MockAIProvider()

    async def generate_journey_plan(self, preferences: Dict[str, Any], hospital: Optional[Dict[str, Any]], knowledge: List[str]) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        prompt = (
            f"You are the MediGlobe AI Journey Engine. Generate a structured JSON medical travel journey.\n"
            f"Patient Preferences: {json.dumps(preferences)}\n"
            f"Hospital Details: {json.dumps(hospital or {})}\n"
            f"Grounding Knowledge: {json.dumps(knowledge[:3])}\n"
            "Return valid JSON matching the exact schema with journey_title, treatment_category, destination_summary, hospital_name, stages (7 stages with tasks), readiness_summary, disclaimer."
        )
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                })
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(raw_text)
        except Exception:
            pass
        return await self.fallback.generate_journey_plan(preferences, hospital, knowledge)

    async def explain_hospital_match(self, preferences: Dict[str, Any], hospital: Dict[str, Any]) -> str:
        return await self.fallback.explain_hospital_match(preferences, hospital)

    async def explain_cost_difference(self, category: str, comparison_data: List[Dict[str, Any]]) -> str:
        return await self.fallback.explain_cost_difference(category, comparison_data)

    async def explain_journey_conflicts(self, conflicts: List[Dict[str, Any]]) -> str:
        return await self.fallback.explain_journey_conflicts(conflicts)

    async def summarize_document(self, text_snippet: str, category: str) -> Dict[str, Any]:
        return await self.fallback.summarize_document(text_snippet, category)


def get_ai_provider() -> BaseAIProvider:
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.AI_MODEL_NAME)
    return MockAIProvider()
