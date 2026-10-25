"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Calendar
} from "lucide-react";

export default function JourneyIntelligencePage() {
  const [journey, setJourney] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  const fetchIntelligenceData = async () => {
    try {
      setLoading(true);
      const journeys = await api.getJourneys();
      if (journeys && journeys.length > 0) {
        const active = journeys[0];
        setJourney(active);
        const res = await api.validateJourney(active.id);
        setValidationResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const handleRunScan = async () => {
    if (!journey) return;
    setValidating(true);
    try {
      const res = await api.validateJourney(journey.id);
      setValidationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setValidating(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      handleRunScan();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Running deterministic logistical conflict scan...</p>
      </div>
    );
  }

  if (!journey || !validationResult) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">Journey Intelligence Centre</h2>
        <p className="text-xs text-slate-500">No active journey found to validate.</p>
        <Link href="/planner" className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold">
          Create Plan
        </Link>
      </div>
    );
  }

  const alerts = validationResult.alerts || [];
  const metrics = validationResult.metrics_breakdown || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Journey Intelligence Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Journey Intelligence Centre</h1>
          <p className="text-xs text-slate-500">
            Deterministic conflict audit & transparent readiness scoring for <span className="font-semibold text-slate-700">{journey.title}</span>.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={validating}
          className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${validating ? "animate-spin" : ""}`} />
          <span>Re-Scan Journey Rules</span>
        </button>
      </div>

      {/* READINESS SCORE BANNER */}
      <div className="rounded-2xl bg-white border border-slate-200 card-subtle p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Transparent Scoring Breakdown
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-navy-900">{validationResult.readiness_score}</span>
              <span className="text-base text-slate-400 font-bold">/ 100</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-health-blue border border-blue-200">
                {validationResult.score_grade}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Calculated exclusively from defined logistical checkpoints: document presence, hospital confirmation, cost quotes, flight/hotel synchronization, and follow-up care continuity.
            </p>
          </div>

          <div className="flex items-center gap-4 text-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
            <div className="space-y-1">
              <span className="text-2xl font-black text-rose-600 block">{validationResult.critical_count}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-amber-600 block">{validationResult.warning_count}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Warnings</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-blue-600 block">{validationResult.info_count}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Info</span>
            </div>
          </div>
        </div>

        {/* 5-Metric Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
          {metrics.map((m: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-500 truncate max-w-[100px]">{m.category.split(" ")[0]}</span>
                <span className="text-navy-900">{m.score} / {m.max_score}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-health-blue rounded-full"
                  style={{ width: `${(m.score / m.max_score) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 pt-1">{m.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI PLAIN-LANGUAGE EXECUTIVE SUMMARY */}
      {validationResult.ai_executive_summary && (
        <div className="rounded-2xl bg-blue-50/60 border border-blue-200/80 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
            <Sparkles className="w-4 h-4 text-health-blue" />
            <span>AI Plain-Language Logistical Analysis</span>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed whitespace-pre-line">
            {validationResult.ai_executive_summary}
          </p>
        </div>
      )}

      {/* DETECTED ISSUES & ACTIONS LIST */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-navy-900 flex items-center justify-between">
          <span>Detected Logistical Discrepancies ({alerts.length})</span>
          <span className="text-xs text-slate-400 font-normal">Deterministic Application Rules</span>
        </h2>

        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">Zero Logistical Conflicts Detected</h3>
            <p className="text-xs text-slate-500">
              Your appointments, transfers, lodging dates, and cost quotes align cleanly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition ${
                  alert.is_resolved
                    ? "bg-slate-50 border-slate-200 opacity-60"
                    : alert.severity === "critical"
                    ? "bg-rose-50/40 border-rose-200/80"
                    : "bg-amber-50/40 border-amber-200/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        alert.severity === "critical"
                          ? "bg-rose-100 text-rose-800"
                          : alert.severity === "warning"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <h3 className="text-sm font-bold text-navy-900">{alert.description}</h3>
                  </div>

                  {!alert.is_resolved && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="text-xs px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 shadow-sm flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark Acknowledged</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-600">
                    <strong className="text-slate-700 font-semibold">Why Detected:</strong>{" "}
                    {alert.detected_reason}
                  </div>
                  <div className="text-slate-800 font-medium">
                    <strong className="text-health-blue font-semibold">Suggested Next Step:</strong>{" "}
                    {alert.suggested_action}
                  </div>
                </div>

                {alert.requires_human_action && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Requires patient / coordinator confirmation before departure lock.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regulatory & Suitability Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {validationResult.disclaimer ||
            "Journey Readiness Score is an administrative logistical checklist indicator. It does NOT evaluate clinical suitability or treatment outcomes."}
        </p>
      </div>
    </div>
  );
}
