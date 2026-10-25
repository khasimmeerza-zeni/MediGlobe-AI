"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  GitCompare,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Calendar,
  Globe2,
  DollarSign,
  Info,
  Check,
  X
} from "lucide-react";

function HospitalComparisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get("ids");

  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        let ids: string[] = [];
        if (idsParam) {
          ids = idsParam.split(",").filter(Boolean);
        } else {
          // If no IDs in query param, fetch top 3 hospitals by default
          const allHospitals = await api.getHospitals();
          if (allHospitals && allHospitals.length > 0) {
            ids = allHospitals.slice(0, 3).map((h: any) => h.id);
          }
        }

        if (ids.length === 0) {
          setError("No hospitals available for comparison.");
          return;
        }

        const res = await api.compareHospitals(ids);
        setComparisonData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load hospital comparison matrix.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [idsParam]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Synthesizing side-by-side hospital matrix...</p>
      </div>
    );
  }

  if (error || !comparisonData || comparisonData.hospitals?.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">Hospital Comparison Matrix</h2>
        <p className="text-xs text-slate-500">{error || "Please select hospitals to compare."}</p>
        <Link
          href="/hospitals"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Hospital Explorer</span>
        </Link>
      </div>
    );
  }

  const items = comparisonData.hospitals;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link
            href="/hospitals"
            className="text-xs text-health-blue font-semibold hover:underline inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hospital Explorer</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Side-by-Side Hospital Comparison
          </h1>
          <p className="text-xs text-slate-500">
            Comparing {items.length} international medical centres across verified credentials, package estimates, and services.
          </p>
        </div>

        <Link
          href="/planner"
          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition"
        >
          Plan Journey with Selected Provider
        </Link>
      </div>

      {/* COMPARISON MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 card-subtle overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 sm:p-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">
                Comparison Dimension
              </th>
              {items.map((item: any) => {
                const h = item.hospital;
                return (
                  <th key={h.id} className="p-4 sm:p-5 text-left w-1/4 align-top">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {h.city}, {h.country}
                    </span>
                    <h3 className="text-sm font-bold text-navy-900">{h.name}</h3>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        h.is_verified
                          ? "bg-teal-50 text-teal-700 border border-teal-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.verification_status}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {/* AI Match Explanation */}
            <tr className="bg-blue-50/30">
              <td className="p-4 sm:p-5 font-bold text-navy-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-health-blue shrink-0" />
                <span>AI Profile Fit Analysis</span>
              </td>
              {items.map((item: any) => (
                <td key={item.hospital.id} className="p-4 sm:p-5 leading-relaxed text-slate-600 italic">
                  "{item.match_explanation}"
                </td>
              ))}
            </tr>

            {/* Accreditations */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-navy-900">Institutional Accreditations</td>
              {items.map((item: any) => {
                const creds = item.hospital.credentials || [];
                return (
                  <td key={item.hospital.id} className="p-4 sm:p-5 space-y-1">
                    {creds.length > 0 ? (
                      creds.map((c: any) => (
                        <div key={c.id} className="flex items-center gap-1.5 font-medium text-slate-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{c.title}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400">Institutional review pending</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Base Estimate */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-navy-900">Treatment Estimate (Base)</td>
              {items.map((item: any) => {
                const est = item.hospital.estimates?.[0];
                return (
                  <td key={item.hospital.id} className="p-4 sm:p-5">
                    {est ? (
                      <div>
                        <span className="text-base font-extrabold text-navy-900 block">
                          {formatCurrency(est.base_cost, est.currency)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Range: {formatCurrency(est.min_cost)} - {formatCurrency(est.max_cost)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Quote on inquiry</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Inclusions */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-navy-900">Package Inclusions</td>
              {items.map((item: any) => {
                const est = item.hospital.estimates?.[0];
                return (
                  <td key={item.hospital.id} className="p-4 sm:p-5 space-y-1">
                    {est?.inclusions?.map((inc: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-emerald-800 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    )) || <span className="text-slate-400">Standard surgeon & inpatient bundle</span>}
                  </td>
                );
              })}
            </tr>

            {/* Exclusions */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-navy-900">Excluded Line Items</td>
              {items.map((item: any) => {
                const est = item.hospital.estimates?.[0];
                return (
                  <td key={item.hospital.id} className="p-4 sm:p-5 space-y-1">
                    {est?.exclusions?.map((exc: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-rose-800 text-[11px]">
                        <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </div>
                    )) || <span className="text-slate-400">Contingency ICU days, air travel</span>}
                  </td>
                );
              })}
            </tr>

            {/* Language Support */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-navy-900">Language Support</td>
              {items.map((item: any) => (
                <td key={item.hospital.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap gap-1">
                    {item.hospital.languages?.map((lang: string) => (
                      <span key={lang} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* International Patient Coordination */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-navy-900">Concierge & Visa Support</td>
              {items.map((item: any) => (
                <td key={item.hospital.id} className="p-4 sm:p-5 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Medical visa invitation issuance</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Airport liaison desk at arrivals</span>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Compliance Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {comparisonData.disclaimer ||
            "Hospital comparisons represent administrative credentials and provider-supplied estimates. They do not rank or endorse clinical surgical efficacy. Always consult a licensed physician for clinical decisions."}
        </p>
      </div>
    </div>
  );
}

export default function HospitalComparisonPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <HospitalComparisonContent />
    </Suspense>
  );
}
