"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Building2,
  ShieldCheck,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  Lock,
  Globe2,
  Calendar,
  Layers,
  ChevronRight,
  Plane,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-health-blue/10 border border-health-blue/20 text-health-blue text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-health-blue" />
                <span>AI-Powered Medical Travel Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.12]">
                Your Global Medical Journey,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-health-blue via-sky-600 to-teal-600">
                  Intelligently Planned.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Discover care options, understand estimated costs, and coordinate your international medical journey with AI-powered planning.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/planner"
                  className="px-6 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm shadow-md shadow-navy-900/20 hover:shadow-lg transition-all flex items-center gap-2 group"
                >
                  <span>Plan My Medical Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/hospitals"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 hover:border-slate-400 shadow-sm transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-health-blue" />
                  <span>Explore Hospitals</span>
                </Link>
              </div>

              {/* Trust Micro-Badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Verified Hospital Accreditations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Rule-Based Conflict Detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Zero Hallucination Financials</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/70 border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-navy-900">Journey Readiness Engine</h4>
                      <p className="text-[10px] text-slate-500">Live Logistics Synchronization</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Inspection
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  {/* Readiness Score Progress */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-slate-700">Journey Readiness Score</span>
                      <span className="text-xs font-bold text-navy-900">75 / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-health-blue to-teal-500 w-[75%]" />
                    </div>
                    <span className="block text-[10px] text-slate-500 mt-1">
                      Checklist complete for visas & consultations; lodging gap pending.
                    </span>
                  </div>

                  {/* Detected Conflict Demo Alert */}
                  <div className="rounded-xl p-3 bg-amber-50 border border-amber-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Logistical Overlap Detected</span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-tight">
                      Airport transfer overlaps with In-Person Consultation on Day 13.
                    </p>
                    <span className="text-[10px] text-amber-700 font-medium block">
                      Suggested: Reschedule transfer 90 mins earlier.
                    </span>
                  </div>

                  {/* Scheduled Items Preview */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">Surgeon Consult</span>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        Confirmed
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Plane className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">Flight TG 917</span>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Ticket Issued
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Deterministic Rule Engine v2.4</span>
                  <Link href="/intelligence" className="text-xs text-health-blue font-semibold hover:underline flex items-center gap-1">
                    View Intelligence Centre <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold text-health-blue uppercase tracking-wider">Streamlined Logistics</span>
          <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            How MediGlobe AI Coordinates Your Medical Travel
          </h2>
          <p className="text-slate-600 text-sm">
            From preliminary hospital comparison to post-treatment follow-up back home, every milestone is structured, verified, and continuously monitored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: "01",
              title: "Profile & Care Needs",
              desc: "Provide procedure preferences, country targets, flexibility, and budget expectations.",
              icon: Compass,
            },
            {
              step: "02",
              title: "Verified Discovery",
              desc: "Explore international providers with verified JCI accreditations and transparent inclusions.",
              icon: Building2,
            },
            {
              step: "03",
              title: "AI Journey Generation",
              desc: "The Intelligence Engine constructs a 7-stage personalized timeline with actionable tasks.",
              icon: Sparkles,
            },
            {
              step: "04",
              title: "Logistical Validation",
              desc: "Deterministic rules identify transport collisions, lodging cutoffs, and cost quotation gaps.",
              icon: AlertTriangle,
            },
            {
              step: "05",
              title: "Continuity of Care",
              desc: "Discharge packets are formatted for your home primary care physician upon return.",
              icon: ShieldCheck,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative rounded-2xl bg-white p-5 border border-slate-200 card-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-200 font-mono">{item.step}</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-health-blue flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="bg-slate-100/60 py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-health-blue uppercase tracking-wider">Engineered for Reliability</span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              Beyond Static Directories: A Living Journey Engine
            </h2>
            <p className="text-slate-600 text-sm">
              MediGlobe AI eliminates the uncertainty, unexpected hidden charges, and logistical chaos often encountered in medical travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-health-blue flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Treatment Cost Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated itemization distinguishes hospital surgical packages from excluded post-op medications, diagnostic suites, and lodging. Programmatic calculations eliminate math hallucinations.
              </p>
              <div className="pt-2">
                <Link href="/costs" className="text-xs font-semibold text-health-blue hover:underline flex items-center gap-1">
                  Explore Cost Breakdown <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Journey Intelligence Centre</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic conflict detection catches overlaps between transfer schedules and clinical visits, or premature lodging checkouts before follow-up consultations are completed.
              </p>
              <div className="pt-2">
                <Link href="/intelligence" className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-1">
                  View Intelligence Checks <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Secure Document Centre</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Store diagnostic imaging, lab work, passports, and medical visas in private encrypted storage. Share documents with hospital teams through revocable, time-bound consent grants.
              </p>
              <div className="pt-2">
                <Link href="/documents" className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
                  Inspect Document Security <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOSPITAL COMPARISON PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-health-blue uppercase tracking-wider">Transparent Benchmarks</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Side-by-Side Hospital Comparison
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Examine accreditations, provider quotation inclusions, and multilingual coordination capabilities.
            </p>
          </div>
          <Link
            href="/compare"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <span>Full 3-Way Comparison Matrix</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Bangkok, Thailand</span>
                  <h3 className="text-base font-bold text-navy-900">Bangkok Global Health Center</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  JCI Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">
                Premier international tertiary hospital with dedicated international pavilions and translation services in 5 languages.
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Cardiac Bypass Est:</span>
                <span className="font-bold text-navy-900">$15,500 USD</span>
              </div>
            </div>
            <Link href="/compare" className="mt-4 w-full py-2 text-center text-xs font-semibold text-health-blue bg-blue-50/60 hover:bg-blue-50 rounded-lg transition">
              Compare with Others
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">New Delhi, India</span>
                  <h3 className="text-base font-bold text-navy-900">Apollo Apex Heart Institute</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  NABH & JCI
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">
                Quaternary referral centre with over 25,000 successful cardiac interventions and robotic surgical suites.
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Off-Pump Bypass Est:</span>
                <span className="font-bold text-navy-900">$9,800 USD</span>
              </div>
            </div>
            <Link href="/compare" className="mt-4 w-full py-2 text-center text-xs font-semibold text-health-blue bg-blue-50/60 hover:bg-blue-50 rounded-lg transition">
              Compare with Others
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Istanbul, Turkey</span>
                  <h3 className="text-base font-bold text-navy-900">Anatolia Euro-Care Center</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Audit
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">
                Eurasian medical facility delivering cardiovascular surgery and advanced oncology overlooking the Bosphorus.
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Valve Repair Est:</span>
                <span className="font-bold text-navy-900">$13,200 USD</span>
              </div>
            </div>
            <Link href="/compare" className="mt-4 w-full py-2 text-center text-xs font-semibold text-health-blue bg-blue-50/60 hover:bg-blue-50 rounded-lg transition">
              Compare with Others
            </Link>
          </div>
        </div>
      </section>

      {/* PRIVACY & TRUST SECTION */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Security & Data Ethics</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Designed Around Patient Privacy and Explicit Consent
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Cross-border medical travel requires rigorous data governance. MediGlobe AI isolates sensitive medical dossiers in private storage, grants hospital coordinators access only upon your explicit authorization, and retains complete audit logs of every access event.
              </p>
              <div className="space-y-3 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>No public URLs: Documents are accessible only via signed backend authorization.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Time-limited, revocable hospital sharing permissions that you control.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Structured AI pipeline with zero prompt injection or unauthorized data exposure.</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-navy-800 border border-slate-700 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400" />
                <span>Active Data Governance Controls</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span className="font-semibold block text-slate-200">Data Processing Consent</span>
                    <span className="text-[10px] text-slate-400">Granted by patient on registration</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-400">ACTIVE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span className="font-semibold block text-slate-200">Hospital Coordinator Access</span>
                    <span className="text-[10px] text-slate-400">Bangkok Global Health (Cardiology)</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-400">REVOCABLE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <span className="font-semibold block text-slate-200">AI Medical Grounding</span>
                    <span className="text-[10px] text-slate-400">Restricted to approved KnowledgeSources</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-400">ISOLATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-navy-900 via-health-blue to-teal-800 p-10 sm:p-14 text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Coordinate Your Medical Travel Journey?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Generate your personalized medical travel plan in minutes. Compare verified providers, identify hidden costs, and detect logistical conflicts before departure.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/planner"
              className="px-8 py-3.5 rounded-xl bg-white text-navy-900 font-bold text-sm hover:bg-slate-100 transition shadow-lg"
            >
              Plan My Journey Now
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-navy-800/80 hover:bg-navy-800 text-white font-bold text-sm border border-white/20 transition"
            >
              Open Live Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
