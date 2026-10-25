"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Upload,
  Lock,
  ShieldCheck,
  Trash2,
  Share2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Info
} from "lucide-react";

export default function DocumentCentrePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("medical_record");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"documents" | "consent">("documents");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDocsAndConsents = async () => {
    try {
      setLoading(true);
      const [docs, cons] = await Promise.all([
        api.getDocuments().catch(() => []),
        api.getConsents().catch(() => []),
      ]);
      setDocuments(docs);
      setConsents(cons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocsAndConsents();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", uploadCategory);
      formData.append("is_sensitive", "true");

      await api.uploadDocument(formData);
      setSelectedFile(null);
      setMsg({ type: "success", text: "Document uploaded and encrypted in private repository." });
      fetchDocsAndConsents();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to upload document." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to permanently delete this document from private storage?")) return;
    try {
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setMsg({ type: "success", text: "Document permanently deleted." });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsentToggle = async (type: string, currentVal: boolean) => {
    try {
      await api.recordConsent({
        consent_type: type,
        is_granted: !currentVal,
      });
      fetchDocsAndConsents();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Accessing encrypted document repository...</p>
      </div>
    );
  }

  const consentMap = consents.reduce((acc, c) => {
    acc[c.consent_type] = c.is_granted;
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>Private Storage & Access Control</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Secure Medical Document Centre</h1>
          <p className="text-xs text-slate-500">
            Encrypted storage for passports, medical records, visa authorizations, and hospital quotations.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "documents" ? "bg-white text-navy-900 shadow-sm" : "text-slate-600 hover:text-navy-900"
            }`}
          >
            My Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("consent")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "consent" ? "bg-white text-navy-900 shadow-sm" : "text-slate-600 hover:text-navy-900"
            }`}
          >
            Consent & Permissions
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* TAB 1: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="space-y-8">
          {/* UPLOAD BOX */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 card-subtle space-y-4">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-health-blue" />
              <span>Upload Health or Administrative Document</span>
            </h2>

            <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select File</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="medical_record">Clinical Medical Record / Scan</option>
                  <option value="passport">Passport Copy</option>
                  <option value="visa">Medical Visa Document</option>
                  <option value="lab_result">Diagnostic Blood/Echo Lab Result</option>
                  <option value="hospital_quote">Hospital Official Quote</option>
                  <option value="discharge_summary">Discharge Summary</option>
                  <option value="other">Other Administrative Document</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Encrypting...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Privately</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="text-[10px] text-slate-400">
              Allowed extensions: PDF, JPG, PNG, DOCX, TXT (Max 25 MB). Files are never accessible via public URLs.
            </p>
          </div>

          {/* DOCUMENTS LIST */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-navy-900">Stored Patient Dossier ({documents.length})</h2>

            {documents.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No documents in your private repository yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 card-subtle flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-health-blue shrink-0" />
                          <span className="text-xs font-bold text-navy-900 truncate max-w-[200px]">
                            {doc.original_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                          {doc.category.replace("_", " ")}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 space-x-2">
                        <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                        <span>•</span>
                        <span>Uploaded {formatDate(doc.created_at)}</span>
                      </div>

                      {/* AI Summary Extract */}
                      {doc.ai_summary && (
                        <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                          <div className="flex items-center gap-1 font-bold text-[10px] text-health-blue">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Administrative Summary:</span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-tight">{doc.ai_summary}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-teal-700 font-semibold">
                        <Lock className="w-3 h-3 text-teal-600" />
                        <span>Private Access Only</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:8000/api/v1/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONSENT & PERMISSIONS */}
      {activeTab === "consent" && (
        <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-navy-900 mb-1">Patient Consent & Sharing Management</h2>
            <p className="text-xs text-slate-500">
              Control which participating entities have access to your health travel data. Revoke permissions at any time.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                type: "data_processing",
                title: "Core Journey Processing Consent",
                desc: "Allows MediGlobe AI to index scheduling milestones, verify passport compliance, and calculate readiness scores.",
              },
              {
                type: "ai_analysis",
                title: "AI Grounding & Plain-Language Assistance",
                desc: "Authorizes the AI Engine to extract basic administrative metadata from uploaded documents and explain conflict alerts.",
              },
              {
                type: "hospital_sharing",
                title: "Participating Hospital Coordination Sharing",
                desc: "Allows authorized coordinators at your selected hospital (Bangkok Global Health) to review your submitted medical quotation documents.",
              },
            ].map((item) => {
              const isGranted = consentMap[item.type] !== false;
              return (
                <div
                  key={item.type}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <span className="text-xs font-bold text-navy-900">{item.title}</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => handleConsentToggle(item.type, isGranted)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                      isGranted
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {isGranted ? "Consent Granted" : "Consent Revoked"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Hospital coordinators are restricted by platform role-based access controls and cannot view unshared patient documents. All sharing and revocation actions are recorded in immutable audit logs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
