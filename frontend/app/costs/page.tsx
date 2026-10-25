"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  TrendingDown,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";

export default function CostIntelligencePage() {
  const [journey, setJourney] = useState<any>(null);
  const [costs, setCosts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [newItem, setNewItem] = useState({
    category: "transport",
    item_name: "Airport & Hospital Medical Transfers",
    estimated_amount: "150",
    currency: "USD",
    confirmation_status: "quoted_by_hospital",
    is_included_in_base: false,
    notes: "Roundtrip airport and clinical transfer service",
  });

  const fetchCostData = async () => {
    try {
      setLoading(true);
      const journeys = await api.getJourneys();
      if (journeys && journeys.length > 0) {
        const active = journeys[0];
        setJourney(active);
        const costData = await api.getCosts(active.id);
        setCosts(costData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, []);

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journey) return;
    try {
      await api.addCostItem(journey.id, {
        category: newItem.category,
        item_name: newItem.item_name,
        estimated_amount: parseFloat(newItem.estimated_amount) || 0,
        currency: newItem.currency,
        confirmation_status: newItem.confirmation_status,
        is_included_in_base: newItem.is_included_in_base,
        notes: newItem.notes,
      });
      setShowAddModal(false);
      fetchCostData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Calculating cost ledger & checking budget categories...</p>
      </div>
    );
  }

  if (!costs || !journey) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">No Cost Ledger Found</h2>
        <p className="text-xs text-slate-500">Please generate a journey first to establish cost intelligence.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-health-blue text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Programmatic Cost Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Treatment & Travel Cost Intelligence</h1>
          <p className="text-xs text-slate-500">
            Transparent line-item audit for <span className="font-semibold text-slate-700">{journey.title}</span>.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 card-subtle space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Grand Total</span>
          <div className="text-2xl font-black text-navy-900">
            {formatCurrency(costs.grand_total, costs.currency)}
          </div>
          <span className="text-[10px] text-slate-500">All planned journey categories</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 card-subtle space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Confirmed Subtotal</span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(costs.confirmed_total, costs.currency)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Provider quotation locked</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 card-subtle space-y-1">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Confirmation</span>
          <div className="text-2xl font-black text-amber-700">
            {formatCurrency(costs.unconfirmed_total, costs.currency)}
          </div>
          <span className="text-[10px] text-amber-600 font-medium">{costs.unconfirmed_items_count} items awaiting lock</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 card-subtle space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ledger Completeness</span>
          <div className="text-2xl font-black text-navy-900">
            {costs.completeness_percentage}%
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-teal-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confidence: {costs.confidence_level.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* MISSING EXPENSE CATEGORY WARNING BANNER */}
      {costs.missing_categories && costs.missing_categories.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900">
            <span className="font-bold block text-sm">Essential Budget Category Missing</span>
            <p>
              Your cost ledger is currently missing estimates for:{" "}
              <strong className="underline font-semibold">{costs.missing_categories.join(", ")}</strong>.
              Hospital quotes frequently exclude local ground transfers and post-discharge pharmaceuticals.
            </p>
          </div>
        </div>
      )}

      {/* LINE ITEM CATEGORIES BREAKDOWN */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-navy-900">Categorized Expense Ledger</h2>

        <div className="space-y-4">
          {costs.categories?.map((cat: any) => (
            <div key={cat.category} className="bg-white rounded-2xl border border-slate-200 card-subtle overflow-hidden">
              <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-navy-900">{cat.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                    {cat.item_count} items
                  </span>
                </div>
                <span className="text-sm font-bold text-navy-900">
                  {formatCurrency(cat.subtotal, costs.currency)}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {cat.items?.map((item: any) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-navy-900">{item.item_name}</span>
                      {item.notes && <p className="text-[11px] text-slate-500">{item.notes}</p>}
                      {item.source_reference && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Ref: {item.source_reference}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.confirmation_status === "confirmed" || item.confirmation_status === "quoted_by_hospital"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.confirmation_status.replace("_", " ")}
                      </span>
                      <span className="font-bold text-navy-900 text-sm">
                        {formatCurrency(item.estimated_amount, item.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{costs.disclaimer}</p>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-health-blue uppercase tracking-wider block">
                  Budget Ledger
                </span>
                <h3 className="text-base font-bold text-navy-900">Add Cost Line Item</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="provider_procedure">Hospital & Surgical Procedure</option>
                  <option value="diagnostics">Diagnostics & Lab Work</option>
                  <option value="consultation">Consultation Fees</option>
                  <option value="accommodation">Medical Recovery Lodging</option>
                  <option value="transport">Airport & Medical Transfers</option>
                  <option value="visa_admin">Visa & Administration</option>
                  <option value="translation">Medical Interpretation</option>
                  <option value="other">Other / Contingency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    value={newItem.estimated_amount}
                    onChange={(e) => setNewItem({ ...newItem, estimated_amount: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmation Status</label>
                  <select
                    value={newItem.confirmation_status}
                    onChange={(e) => setNewItem({ ...newItem, confirmation_status: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="quoted_by_hospital">Quoted by Hospital</option>
                    <option value="estimated">Estimated</option>
                    <option value="tentative">Tentative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Inclusions</label>
                <input
                  type="text"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="e.g. Includes driver waiting time"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
