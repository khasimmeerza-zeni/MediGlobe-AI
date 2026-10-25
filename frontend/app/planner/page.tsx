"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import {
  Sparkles,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  Globe2,
  FileCheck,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function JourneyPlannerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    residence_country: "United States",
    preferred_destinations: ["Thailand", "India"],
    treatment_category: "Cardiology",
    budget_min: "12000",
    budget_max: "20000",
    currency: "USD",
    preferred_language: "English",
    travel_flexibility: "flexible",
    approximate_travel_date: "Next 60 Days",
    accessibility_needs: "Wheelchair assistance on flight transfers",
    help_with_docs: true,
  });

  const handleDestinationToggle = (country: string) => {
    setFormData((prev) => {
      const exists = prev.preferred_destinations.includes(country);
      return {
        ...prev,
        preferred_destinations: exists
          ? prev.preferred_destinations.filter((c) => c !== country)
          : [...prev.preferred_destinations, country],
      };
    });
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      // 1. Save preferences
      await api.savePreferences({
        residence_country: formData.residence_country,
        preferred_destinations: formData.preferred_destinations,
        treatment_category: formData.treatment_category,
        budget_min: parseFloat(formData.budget_min) || 0,
        budget_max: parseFloat(formData.budget_max) || 0,
        currency: formData.currency,
        preferred_language: formData.preferred_language,
        travel_flexibility: formData.travel_flexibility,
        approximate_travel_date: formData.approximate_travel_date,
        accessibility_needs: formData.accessibility_needs,
        help_with_docs: formData.help_with_docs,
      });

      // 2. Call backend to create and generate structured journey
      const journey = await api.createJourney({
        title: `${formData.treatment_category} Medical Travel Plan (${formData.preferred_destinations.join(", ")})`,
        treatment_category: formData.treatment_category,
        currency: formData.currency,
      });

      setGeneratedPlan(journey);
      setStep(4); // Move to review step
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate journey plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-blue/10 text-health-blue text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Journey Intelligence Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Plan Your International Medical Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Tell us about your medical travel preferences. We'll search participating hospitals and generate an end-to-end 7-stage logistical plan.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between max-w-md mx-auto pt-2">
        {[
          { num: 1, label: "Care & Country" },
          { num: 2, label: "Budget & Currency" },
          { num: 3, label: "Travel & Schedule" },
          { num: 4, label: "Review & Confirm" },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                step >= s.num
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {s.num}
            </div>
            <span className="text-[10px] font-medium text-slate-600 mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FORM STEPS CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-subtle shadow-sm">
        {/* STEP 1: CARE & DESTINATIONS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-navy-900 mb-1">Step 1: Care Need & Target Destinations</h2>
              <p className="text-xs text-slate-500">
                Specify your country of residence and the treatment you are exploring.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country of Residence
                </label>
                <select
                  value={formData.residence_country}
                  onChange={(e) => setFormData({ ...formData, residence_country: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20 bg-white"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Treatment Category
                </label>
                <select
                  value={formData.treatment_category}
                  onChange={(e) => setFormData({ ...formData, treatment_category: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20 bg-white"
                >
                  <option value="Cardiology">Cardiology & Heart Surgery</option>
                  <option value="Orthopedics">Orthopedics & Joint Replacement</option>
                  <option value="Oncology">Oncology & Proton Therapy</option>
                  <option value="Dental">Comprehensive Dental Rehabilitation</option>
                  <option value="Neurology">Neurology & Spine Surgery</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Preferred Destination Countries (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Thailand", flag: "🇹🇭", detail: "JCI Medical Hub" },
                  { name: "India", flag: "🇮🇳", detail: "High Cost Advantage" },
                  { name: "Turkey", flag: "🇹🇷", detail: "Eurasian Care Bridge" },
                  { name: "Singapore", flag: "🇸🇬", detail: "Advanced Technology" },
                ].map((country) => {
                  const selected = formData.preferred_destinations.includes(country.name);
                  return (
                    <button
                      type="button"
                      key={country.name}
                      onClick={() => handleDestinationToggle(country.name)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        selected
                          ? "bg-blue-50 border-health-blue text-navy-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-base">{country.flag}</span>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-health-blue" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{country.name}</span>
                        <span className="text-[10px] text-slate-500">{country.detail}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <span>Continue to Budget</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET & CURRENCY */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-navy-900 mb-1">Step 2: Budget Expectation & Language</h2>
              <p className="text-xs text-slate-500">
                Helps filter treatment package quotes and coordinate appropriate translation liaisons.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20 bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget Min</label>
                <input
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget Max</label>
                <input
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Spoken Language</label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20 bg-white max-w-sm"
              >
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
                <option value="Russian">Russian</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <span>Continue to Travel Timing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRAVEL TIMING & ACCESSIBILITY */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-navy-900 mb-1">Step 3: Travel Timing & Assistance</h2>
              <p className="text-xs text-slate-500">
                Logistical details help build your timeline stages without requiring confidential medical histories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Date Flexibility</label>
                <select
                  value={formData.travel_flexibility}
                  onChange={(e) => setFormData({ ...formData, travel_flexibility: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20 bg-white"
                >
                  <option value="flexible">Fully Flexible Dates</option>
                  <option value="within_month">Targeting within 30-60 days</option>
                  <option value="fixed_dates">Specific Travel Window Required</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Approximate Window</label>
                <input
                  type="text"
                  value={formData.approximate_travel_date}
                  onChange={(e) => setFormData({ ...formData, approximate_travel_date: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Accessibility & Lodging Preferences
              </label>
              <textarea
                rows={2}
                value={formData.accessibility_needs}
                onChange={(e) => setFormData({ ...formData, accessibility_needs: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
                placeholder="e.g. Wheelchair assistance at airport, ground-floor hotel room, companion suite..."
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <input
                type="checkbox"
                id="help_with_docs"
                checked={formData.help_with_docs}
                onChange={(e) => setFormData({ ...formData, help_with_docs: e.target.checked })}
                className="w-4 h-4 text-health-blue rounded border-slate-300"
              />
              <label htmlFor="help_with_docs" className="text-xs text-slate-700">
                Help me organize medical visas, flight itineraries, and hospital documentation securely.
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI Engine Generating Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Structured Journey Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && generatedPlan && (
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
                  AI Plan Generated
                </span>
                <h2 className="text-lg font-bold text-navy-900">{generatedPlan.title}</h2>
                <p className="text-xs text-slate-500">
                  Treatment: {generatedPlan.treatment_category} • Initial Readiness Score: {generatedPlan.readiness_score}%
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                Draft Saved
              </span>
            </div>

            {/* Stages overview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generated 7-Stage Itinerary Outline:
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {generatedPlan.stages &&
                  generatedPlan.stages.map((st: any) => (
                    <div key={st.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="font-bold text-navy-900">
                          Stage {st.stage_order}: {st.stage_name}
                        </span>
                        <p className="text-[11px] text-slate-500">{st.tasks?.length || 0} scheduled action items</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold uppercase">
                        {st.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
              <span className="font-semibold block">Administrative Note:</span>
              <p className="text-[11px] leading-relaxed text-blue-800">
                You can now view your interactive timeline, modify task assignments, inspect treatment costs, and run conflict checks in the Journey Intelligence Centre.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
              >
                Modify Preferences
              </button>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => router.push("/timeline")}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-navy-900 font-semibold text-xs transition"
                >
                  View Visual Timeline
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
