"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Sparkles,
  Compass,
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Plane,
  RefreshCw,
  PlusCircle,
  HelpCircle
} from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [journey, setJourney] = useState<any>(null);
  const [costs, setCosts] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const journeys = await api.getJourneys();
      if (journeys && journeys.length > 0) {
        const active = journeys[0];
        setJourney(active);

        // Fetch dependent data in parallel
        const [costData, alertData, aptData] = await Promise.all([
          api.getCosts(active.id).catch(() => null),
          api.getAlerts(active.id).catch(() => []),
          api.getAppointments(active.id).catch(() => []),
        ]);

        setCosts(costData);
        setAlerts(alertData);
        setAppointments(aptData);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleValidateJourney = async () => {
    if (!journey) return;
    setValidating(true);
    try {
      const res = await api.validateJourney(journey.id);
      setAlerts(res.alerts);
      setJourney((prev: any) => ({
        ...prev,
        readiness_score: res.readiness_score,
        readiness_breakdown: {
          score: res.readiness_score,
          grade: res.score_grade,
          metrics: res.metrics_breakdown,
        },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setValidating(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_resolved: true } : a)));
      handleValidateJourney();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Synchronizing medical travel dossier...</p>
      </div>
    );
  }

  // If no active journey exists
  if (!journey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-health-blue rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-navy-900">No Active Medical Travel Journey Found</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Start your personalized medical journey. Explore top international hospitals and generate an AI-backed logistics itinerary.
        </p>
        <div className="pt-2">
          <Link
            href="/planner"
            className="px-6 py-3 rounded-xl bg-navy-900 text-white font-semibold text-sm hover:bg-navy-800 transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create New Medical Journey</span>
          </Link>
        </div>
      </div>
    );
  }

  const allTasks = journey.stages ? journey.stages.flatMap((s: any) => s.tasks || []) : [];
  const completedTasks = allTasks.filter((t: any) => t.status === "completed");
  const pendingTasks = allTasks.filter((t: any) => t.status !== "completed");
  const readiness = journey.readiness_breakdown || {
    score: journey.readiness_score || 0,
    grade: "Pending Evaluation",
    metrics: [],
  };

  const activeAlerts = alerts.filter((a) => !a.is_resolved);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
              Welcome back, {user ? user.full_name : "Sarah Jenkins"}
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-health-blue font-semibold border border-blue-200">
              Active Patient Dossier
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Current Focus: <span className="font-semibold text-slate-700">{journey.title}</span> • Destination:{" "}
            <span className="font-semibold text-slate-700">Bangkok, Thailand</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleValidateJourney}
            disabled={validating}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center gap-1.5 border border-slate-300"
            title="Re-run deterministic conflict rules and recalculate readiness score"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${validating ? "animate-spin text-health-blue" : ""}`} />
            <span>Validate Logistics</span>
          </button>

          <Link
            href="/planner"
            className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Regenerate Plan</span>
          </Link>
        </div>
      </div>

      {/* THREE MAIN KPI CARDS: READINESS, COST, AND ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: JOURNEY READINESS SCORE */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Logistical Check
                </span>
                <h3 className="text-base font-bold text-navy-900">Journey Readiness Score</h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-sm">
                {journey.readiness_score}%
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-health-blue to-teal-500 transition-all duration-700"
                  style={{ width: `${journey.readiness_score}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>{readiness.grade || "Logistics Evaluation"}</span>
                <span>{completedTasks.length} / {allTasks.length} Milestones</span>
              </div>
            </div>

            {/* Checklist summary */}
            <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <p className="font-semibold text-slate-800">Checklist Highlights:</p>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Identity & Passport documentation linked</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Accommodation & Transfer alignment pending</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[10px]">Administrative Score Only</span>
            <Link href="/intelligence" className="font-semibold text-health-blue hover:underline flex items-center gap-1">
              View Breakdown <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* CARD 2: COST ESTIMATE SUMMARY */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Budget & Ledger
                </span>
                <h3 className="text-base font-bold text-navy-900">Cost Intelligence Summary</h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-health-blue flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-extrabold text-navy-900 tracking-tight">
                {costs ? formatCurrency(costs.grand_total, costs.currency) : "$18,350"}
              </div>
              <p className="text-[11px] text-slate-500">
                Confirmed: <span className="font-semibold text-emerald-600">{costs ? formatCurrency(costs.confirmed_total) : "$16,550"}</span> • Pending:{" "}
                <span className="font-semibold text-amber-600">{costs ? formatCurrency(costs.unconfirmed_total) : "$1,800"}</span>
              </p>
            </div>

            {/* Completeness & Missing Indicator */}
            {costs && costs.missing_categories && costs.missing_categories.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Missing: <strong className="font-semibold">{costs.missing_categories[0]}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400">Non-binding provider estimate</span>
            <Link href="/costs" className="font-semibold text-health-blue hover:underline flex items-center gap-1">
              Full Breakdown <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* CARD 3: LOGISTICAL CONFLICTS / ALERTS */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 card-subtle flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Deterministic Rules
                </span>
                <h3 className="text-base font-bold text-navy-900">Logistical Alerts</h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                {activeAlerts.length}
              </div>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No logistical collisions or date conflicts detected.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {activeAlerts.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-semibold text-amber-900 text-[11px] leading-tight line-clamp-1">
                        {alert.description}
                      </span>
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold shrink-0 underline"
                      >
                        Resolve
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-800 line-clamp-1">{alert.suggested_action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400">Continuous background audit</span>
            <Link href="/intelligence" className="font-semibold text-amber-700 hover:underline flex items-center gap-1">
              Resolve Issues <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: UPCOMING APPOINTMENTS & PENDING TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upcoming Appointments (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-6 border border-slate-200 card-subtle space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-health-blue" />
              <h3 className="text-sm font-bold text-navy-900">Coordinated Appointments</h3>
            </div>
            <Link href="/travel" className="text-xs text-health-blue hover:underline font-semibold">
              Travel Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No scheduled hospital appointments yet.</p>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition space-y-1.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-navy-900">{apt.appointment_type}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        apt.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(apt.start_time)}
                    </span>
                    <span>{apt.doctor_name || "Specialist Team"}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{apt.location}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Key Journey Tasks (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 border border-slate-200 card-subtle space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-health-blue" />
              <h3 className="text-sm font-bold text-navy-900">Active Journey Milestones</h3>
            </div>
            <Link href="/timeline" className="text-xs text-health-blue hover:underline font-semibold flex items-center gap-1">
              <span>View 7-Stage Timeline</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.slice(0, 4).map((task: any) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        task.priority === "urgent"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : task.priority === "high"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-xs font-semibold text-navy-900">{task.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-medium text-slate-400 block mb-1">
                    Responsible: {task.responsible_party}
                  </span>
                  <button
                    onClick={async () => {
                      await api.updateTaskStatus(task.id, { status: "completed" });
                      fetchDashboardData();
                    }}
                    className="text-[10px] px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 shadow-sm"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
