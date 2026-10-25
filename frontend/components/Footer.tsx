import React from "react";
import Link from "next/link";
import { Compass, ShieldAlert, Heart, Lock, Globe2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Disclaimer Box */}
        <div className="bg-navy-800/80 border border-slate-700/80 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white block text-sm">
                Clinical Boundary & Medical Logistics Notice
              </span>
              <p>
                MediGlobe AI is an administrative medical travel coordination and logistics decision-support platform.
                The application does not independently diagnose diseases, prescribe surgical procedures, determine clinical eligibility, or guarantee treatment outcomes.
                All provider estimates and accreditations are retrieved from participating hospital records and verified registries.
              </p>
              <p className="text-amber-300 font-medium pt-1">
                Emergency Alert: If you or your companion experience acute or life-threatening symptoms, immediately dial your local emergency services (e.g., 911, 999, 1669) rather than relying on automated software.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-health-blue flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">MediGlobe AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforming global medical journeys with transparent hospital comparisons, intelligent scheduling coordination, and deterministic conflict detection.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Encryption & Consent-Driven Sharing</span>
            </div>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/dashboard" className="hover:text-white transition">Patient Dashboard</Link></li>
              <li><Link href="/planner" className="hover:text-white transition">AI Journey Planner</Link></li>
              <li><Link href="/timeline" className="hover:text-white transition">7-Stage Timeline</Link></li>
              <li><Link href="/hospitals" className="hover:text-white transition">Global Hospital Explorer</Link></li>
              <li><Link href="/compare" className="hover:text-white transition">Side-by-Side Hospital Compare</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Intelligence & Safety</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/intelligence" className="hover:text-white transition">Conflict Detection Engine</Link></li>
              <li><Link href="/costs" className="hover:text-white transition">Cost Transparency & Gaps</Link></li>
              <li><Link href="/documents" className="hover:text-white transition">Secure Document Centre</Link></li>
              <li><Link href="/travel" className="hover:text-white transition">Travel & Airport Transfers</Link></li>
              <li><Link href="/follow-up" className="hover:text-white transition">Post-Treatment Care Continuity</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Administration & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/admin" className="hover:text-white transition">Credential Verification Portal</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Compliance Audit Logging</Link></li>
              <li><span className="text-slate-500 text-[11px]">Hackathon Edition: Fictional Data Clearly Marked</span></li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                  <Globe2 className="w-3 h-3 text-health-blue" />
                  <span>Multilingual Support Grounded</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 MediGlobe AI Inc. All rights reserved. Built for Global Medical Tourism Innovation.</p>
          <div className="flex items-center gap-6">
            <span>Deterministic Conflict Detection</span>
            <span>•</span>
            <span>Zero Hallucination Arithmetic</span>
            <span>•</span>
            <span>Cross-Border Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
