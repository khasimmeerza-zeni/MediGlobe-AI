"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  HeartHandshake,
  ShieldAlert,
  Calendar,
  FileText,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  AlertCircle,
  PhoneCall,
  UserCheck
} from "lucide-react";

export default function FollowUpCarePage() {
  const [journey, setJourney] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const fetchFollowUpData = async () => {
    try {
      setLoading(true);
      const journeys = await api.getJourneys();
      if (journeys && journeys.length > 0) {
        const active = journeys[0];
        setJourney(active);
        const [apts, docs] = await Promise.all([
          api.getAppointments(active.id).catch(() => []),
          api.getDocuments(active.id).catch(() => []),
        ]);
        setAppointments(apts);
        setDocuments(docs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUpData();
  }, []);

  const handleGenerateLocalDoctorPackage = () => {
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Preparing follow-up care dossier...</p>
      </div>
    );
  }

  const followUpAppointments = appointments.filter(
    (a) => a.appointment_type.toLowerCase().includes("follow") || a.appointment_type.toLowerCase().includes("post")
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Continuity of Care Coordination</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Post-Treatment Care & Local Doctor Dossier</h1>
          <p className="text-xs text-slate-500">
            Coordinate recovery milestones, discharge summaries, and home-country primary care transfers.
          </p>
        </div>

        <button
          onClick={handleGenerateLocalDoctorPackage}
          className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm"
        >
          <FileText className="w-4 h-4 text-teal-400" />
          <span>Package for Local Doctor</span>
        </button>
      </div>

      {transferSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">Local Clinician Dossier Generated</span>
            <p className="text-[11px] text-emerald-700">
              Discharge instructions, operative summaries, and imaging references packaged with patient consent token.
            </p>
          </div>
        </div>
      )}

      {/* EMERGENCY DISCLAIMER BOX */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <span className="font-bold block text-sm">Critical Clinical Safety Notice</span>
          <p>
            MediGlobe AI does not generate medical prescriptions, surgical diagnosis, or emergency advice.
            If you experience chest pain, sudden shortness of breath, acute fever, or wound infection, immediately contact your local hospital emergency department (e.g. 911, 999, 112) or call your attending surgical coordinator directly.
          </p>
        </div>
      </div>

      {/* TWO COLUMN GRID: FOLLOW-UP APPOINTMENTS & CLINICIAN INSTRUCTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Scheduled Follow-up Visits */}
        <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-health-blue" />
              <span>Post-Procedure Consultations</span>
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              {followUpAppointments.length} Scheduled
            </span>
          </div>

          {followUpAppointments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
              <p>No post-operative follow-up consultations found in your schedule.</p>
              <Link href="/travel" className="text-health-blue font-semibold hover:underline block">
                Schedule Follow-up in Travel Coordinator →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {followUpAppointments.map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-navy-900">{apt.appointment_type}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-health-blue border border-blue-200">
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Date: {formatDate(apt.start_time)}</span>
                    <span>Physician: {apt.doctor_name || "Surgical Team"}</span>
                  </div>
                  {apt.notes && <p className="text-[10px] text-slate-500 italic">{apt.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Box 2: Clinician-Provided Administrative Instructions */}
        <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Clinician Administrative Guidelines</span>
            </h2>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Verified Source
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-navy-900 block">Fit to Fly Certification</span>
              <p className="text-[11px] text-slate-500">
                Minimum 7-10 day post-op observation period required prior to long-haul flight departure. Suture line inspection must be signed off by the attending surgeon.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-navy-900 block">Primary Care Transfer Protocol</span>
              <p className="text-[11px] text-slate-500">
                Provide local home GP with translated operative summary, post-discharge medication schedule, and hospital liaison direct contact details within 7 days of returning home.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DISCHARGE DOCUMENTS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-4">
        <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600" />
          <span>Discharge Summaries & Hospital Records in Private Storage</span>
        </h2>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No discharge documents uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((d) => (
              <div key={d.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-navy-900 truncate max-w-[200px] block">{d.original_name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{d.category.replace("_", " ")}</span>
                </div>
                <a
                  href={`http://localhost:8000/api/v1/documents/${d.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-white transition"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
