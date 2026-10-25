"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Building2,
  Search,
  Filter,
  ShieldCheck,
  Globe2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GitCompare,
  Plus,
  Check
} from "lucide-react";

export default function HospitalExplorerPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [treatmentFilter, setTreatmentFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Comparison Dock (up to 3 hospitals)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [consultModalHospital, setConsultModalHospital] = useState<any | null>(null);
  const [consultSuccess, setConsultSuccess] = useState<string | null>(null);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (countryFilter) params.country = countryFilter;
      if (treatmentFilter) params.treatment = treatmentFilter;
      if (verifiedOnly) params.verified_only = "true";

      const data = await api.getHospitals(params);
      setHospitals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [countryFilter, treatmentFilter, verifiedOnly]);

  const toggleCompare = (hospitalId: string) => {
    if (selectedForCompare.includes(hospitalId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== hospitalId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert("You can compare up to 3 hospitals at a time.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, hospitalId]);
    }
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultModalHospital) return;
    try {
      const res = await api.requestConsultation(consultModalHospital.id, "Pre-screening medical inquiry");
      setConsultSuccess(res.message);
      setTimeout(() => {
        setConsultModalHospital(null);
        setConsultSuccess(null);
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHospitals = hospitals.filter((h) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      h.name.toLowerCase().includes(term) ||
      h.city.toLowerCase().includes(term) ||
      h.country.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-32">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-health-blue/10 text-health-blue text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Global Hospital Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Explore Participating International Hospitals
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Search accredited medical centres worldwide. Compare official accreditations, verified surgical package estimates, and multilingual patient coordination.
        </p>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 card-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by hospital name or city..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
          />
        </div>

        {/* Country Filter */}
        <div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-health-blue/20"
          >
            <option value="">All Countries</option>
            <option value="Thailand">Thailand</option>
            <option value="India">India</option>
            <option value="Turkey">Turkey</option>
          </select>
        </div>

        {/* Treatment Filter */}
        <div>
          <select
            value={treatmentFilter}
            onChange={(e) => setTreatmentFilter(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-health-blue/20"
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Oncology">Oncology</option>
          </select>
        </div>

        {/* Verified Only Checkbox */}
        <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            id="verified_only"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 text-health-blue rounded border-slate-300"
          />
          <label htmlFor="verified_only" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Verified Only
          </label>
        </div>
      </div>

      {/* HOSPITAL CARDS GRID */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Querying hospital registry...</p>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-navy-900">No hospitals matched your search criteria</h3>
          <p className="text-xs text-slate-500">Try clearing the filters or searching for another destination.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => {
            const isCompared = selectedForCompare.includes(hospital.id);
            const verifiedCred = hospital.credentials?.find((c: any) => c.verification_status === "verified");
            const estimate = hospital.estimates?.[0];

            return (
              <div
                key={hospital.id}
                className="rounded-2xl bg-white border border-slate-200 card-subtle flex flex-col justify-between overflow-hidden shadow-sm"
              >
                <div className="p-6 space-y-4">
                  {/* Top Header & Verification Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {hospital.city}, {hospital.country}
                      </span>
                      <h3 className="text-base font-bold text-navy-900 leading-snug">{hospital.name}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        hospital.is_verified
                          ? "bg-teal-50 text-teal-700 border border-teal-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {hospital.is_verified ? "Verified Partner" : "Pending Audit"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {hospital.description}
                  </p>

                  {/* Accreditations */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Accreditation Status
                    </span>
                    {verifiedCred ? (
                      <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{verifiedCred.title}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Awaiting institutional document verification</span>
                      </div>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {hospital.languages?.map((lang: string) => (
                      <span
                        key={lang}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Estimate Box */}
                  {estimate && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] text-slate-500 block">Typical {estimate.treatment_category} Package:</span>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[170px]">
                          {estimate.treatment_name}
                        </span>
                        <span className="text-xs font-bold text-navy-900">
                          {formatCurrency(estimate.base_cost, estimate.currency)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => toggleCompare(hospital.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border ${
                      isCompared
                        ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
                    }`}
                  >
                    {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isCompared ? "Added" : "Compare"}</span>
                  </button>

                  <button
                    onClick={() => setConsultModalHospital(hospital)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-health-blue hover:bg-blue-600 text-white transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Request Consult</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING COMPARISON DOCK */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-navy-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-center gap-6 max-w-xl w-[92%] sm:w-auto">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-teal-400" />
            <div>
              <span className="text-xs font-bold block">{selectedForCompare.length} Hospitals Selected</span>
              <span className="text-[10px] text-slate-400">Ready for side-by-side comparison</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>

            <button
              onClick={() => router.push(`/compare?ids=${selectedForCompare.join(",")}`)}
              className="px-4 py-2 bg-health-blue hover:bg-blue-600 rounded-xl text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5"
            >
              <span>Compare Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CONSULTATION REQUEST MODAL */}
      {consultModalHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-health-blue uppercase tracking-wider block">
                  International Patient Liaison
                </span>
                <h3 className="text-base font-bold text-navy-900">
                  Request Pre-Consultation Inquiry
                </h3>
              </div>
              <button
                onClick={() => setConsultModalHospital(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Transmit an authorized inquiry to the International Patient Department at{" "}
              <strong className="text-navy-900 font-semibold">{consultModalHospital.name}</strong>.
            </p>

            {consultSuccess ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold block">{consultSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inquiry Notes (Non-Confidential Administrative Message)
                  </label>
                  <textarea
                    rows={3}
                    required
                    defaultValue="Requesting preliminary appointment schedule availability and verified treatment estimate for planned medical travel."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
                  />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>No medical records sent without your explicit Document Centre consent.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConsultModalHospital(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-xs font-semibold text-white shadow-sm"
                  >
                    Send Authorized Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
