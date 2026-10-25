"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  UserCheck,
  AlertTriangle,
  History,
  ArrowRight
} from "lucide-react";

export default function AdminPortalPage() {
  const { user, loginAsDemoRole } = useAuth();
  const [pendingHospitals, setPendingHospitals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [hosp, logs] = await Promise.all([
        api.getPendingHospitals().catch(() => []),
        api.getAuditLogs().catch(() => []),
      ]);
      setPendingHospitals(hosp);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleVerifyHospital = async (hospitalId: string, verify: boolean) => {
    try {
      await api.updateHospitalVerification(hospitalId, {
        is_verified: verify,
        verification_notes: verify
          ? "Accreditation dossier verified by Platform Compliance Director."
          : "Verification rejected pending re-submission of current survey evidence.",
      });
      setActionMsg(verify ? "Hospital accredited partner status approved." : "Hospital verification revoked.");
      fetchAdminData();
      setTimeout(() => setActionMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm("Reset database to standard demonstration dataset?")) return;
    try {
      await api.resetDemoData();
      setActionMsg("Demonstration database reset successfully.");
      fetchAdminData();
      setTimeout(() => setActionMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = user && (user.role === "platform_admin" || user.role === "hospital_admin");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-health-blue" />
            <span>Compliance & Administration Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Hospital & Governance Dashboard</h1>
          <p className="text-xs text-slate-500">
            Current Persona: <strong className="text-navy-900 uppercase font-semibold">{user ? user.role.replace("_", " ") : "Not Signed In"}</strong> •{" "}
            <span className="text-slate-600">{user?.email}</span>
          </p>
        </div>

        {/* Quick Persona Switchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loginAsDemoRole("platform_admin")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            Switch to Platform Admin
          </button>
          <button
            onClick={handleResetDemoData}
            className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold block text-sm">Role-Based Access Notice</span>
            <p>
              You are currently browsing as a patient. Administrative workflows are restricted on the backend. Use the "Switch to Platform Admin" button above to evaluate the admin verification workflow!
            </p>
          </div>
          <button
            onClick={() => loginAsDemoRole("platform_admin")}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs shrink-0"
          >
            Switch Now
          </button>
        </div>
      )}

      {/* SECTION 1: PENDING HOSPITAL VERIFICATIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-health-blue" />
            <h2 className="text-sm font-bold text-navy-900">Hospital Credential Verification Queue</h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {pendingHospitals.length} Pending Review
          </span>
        </div>

        {pendingHospitals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p>All participating hospital credentials are fully audited and verified.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingHospitals.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 text-sm">{h.name}</span>
                    <span className="text-[10px] text-slate-500">
                      ({h.city}, {h.country})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{h.description}</p>
                  <div className="text-[10px] text-amber-800 font-medium">
                    Evidence Note: {h.verification_notes || "Submitted accreditation dossier awaiting review."}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerifyHospital(h.id, false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerifyHospital(h.id, true)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 font-semibold text-white shadow-sm flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Credentials</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: PLATFORM AUDIT LOGS */}
      <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-navy-900">Platform Security & Audit Trail</h2>
          </div>
          <span className="text-xs text-slate-400">Recent {auditLogs.length} Events</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No audit records available.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="py-2.5 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 uppercase font-mono text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {log.resource_type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    User: {log.user_id ? log.user_id.slice(0, 8) : "System"} • IP: {log.ip_address || "Internal"}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400">{formatDate(log.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
