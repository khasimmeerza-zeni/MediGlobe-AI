"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import {
  Plane,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Compass,
  ArrowRight
} from "lucide-react";

export default function TravelCoordinatorPage() {
  const [journey, setJourney] = useState<any>(null);
  const [travels, setTravels] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New arrangement form
  const [newArrangement, setNewArrangement] = useState({
    arrangement_type: "transfer",
    provider_name: "Bangkok Hospital Shuttle Service",
    confirmation_code: "BKK-TRF-091",
    start_time: "2026-11-02T10:00",
    end_time: "2026-11-02T12:00",
    departure_location: "Suvarnabhumi Airport (BKK)",
    arrival_location: "Sukhumvit Executive Suites",
    cost: "60",
    currency: "USD",
    notes: "Wheelchair assistance on vehicle boarding",
  });

  const fetchTravelData = async () => {
    try {
      setLoading(true);
      const journeys = await api.getJourneys();
      if (journeys && journeys.length > 0) {
        const active = journeys[0];
        setJourney(active);
        const [trv, apt, alt] = await Promise.all([
          api.getTravel(active.id).catch(() => []),
          api.getAppointments(active.id).catch(() => []),
          api.getAlerts(active.id).catch(() => []),
        ]);
        setTravels(trv);
        setAppointments(apt);
        setAlerts(alt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelData();
  }, []);

  const handleCreateArrangement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journey) return;
    try {
      await api.createTravel(journey.id, {
        arrangement_type: newArrangement.arrangement_type,
        provider_name: newArrangement.provider_name,
        confirmation_code: newArrangement.confirmation_code,
        start_time: new Date(newArrangement.start_time).toISOString(),
        end_time: new Date(newArrangement.end_time).toISOString(),
        departure_location: newArrangement.departure_location,
        arrival_location: newArrangement.arrival_location,
        cost: parseFloat(newArrangement.cost) || 0,
        currency: newArrangement.currency,
        notes: newArrangement.notes,
      });
      setShowAddModal(false);
      fetchTravelData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Synchronizing international travel arrangements...</p>
      </div>
    );
  }

  // Combine travels and appointments into unified timeline
  const timelineEvents = [
    ...travels.map((t) => ({
      id: t.id,
      type: "travel",
      title: `${t.arrangement_type.toUpperCase()}: ${t.provider_name}`,
      start: t.start_time,
      end: t.end_time,
      location: `${t.departure_location || ""} → ${t.arrival_location || ""}`,
      status: t.status,
      cost: t.cost,
      currency: t.currency,
      raw: t,
    })),
    ...appointments.map((a) => ({
      id: a.id,
      type: "appointment",
      title: a.appointment_type,
      start: a.start_time,
      end: a.end_time,
      location: a.location,
      status: a.status,
      cost: null,
      currency: "USD",
      raw: a,
    })),
  ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const hasOverlapAlert = alerts.some((a) => a.alert_type === "overlap" && !a.is_resolved);
  const hasLodgingAlert = alerts.some((a) => a.alert_type === "date_conflict" && !a.is_resolved);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-health-blue text-xs font-semibold border border-blue-200">
            <Plane className="w-3.5 h-3.5" />
            <span>Travel & Logistics Coordinator</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Synchronized Travel & Appointment Schedule</h1>
          <p className="text-xs text-slate-500">
            Unified logistics timeline linking flights, airport transfers, hotel lodging, and in-person hospital visits.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Travel Item</span>
        </button>
      </div>

      {/* CONFLICT HIGHLIGHT BANNERS */}
      {(hasOverlapAlert || hasLodgingAlert) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Active Logistical Discrepancy Flagged</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {hasOverlapAlert && "• Airport transfer window directly overlaps with an in-person hospital consultation. "}
            {hasLodgingAlert && "• Recovery hotel reservation check-out date occurs before your scheduled post-op follow-up visit."}
          </p>
          <Link
            href="/intelligence"
            className="text-xs font-semibold text-amber-900 underline inline-flex items-center gap-1"
          >
            <span>Review & Resolve in Journey Intelligence Centre</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* UNIFIED LOGISTICS TIMELINE */}
      <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-6">
        <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-health-blue" />
          <span>Chronological Schedule of Events</span>
        </h2>

        {timelineEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No travel arrangements or appointments recorded.</p>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {timelineEvents.map((event) => {
              const isApt = event.type === "appointment";
              return (
                <div key={event.id} className="relative pl-6">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      isApt ? "bg-health-blue" : "bg-teal-500"
                    }`}
                  />

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-1.5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isApt
                              ? "bg-blue-100 text-blue-800"
                              : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {event.type}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-navy-900">{event.title}</h3>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          event.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateTime(event.start)} - {formatDateTime(event.end)}
                      </span>
                      <span>Location: {event.location}</span>
                      {event.cost && (
                        <span className="font-semibold text-slate-700">
                          Cost: {formatCurrency(event.cost, event.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD TRAVEL ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-health-blue uppercase tracking-wider block">
                  Logistics Coordination
                </span>
                <h3 className="text-base font-bold text-navy-900">Add Travel Arrangement</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateArrangement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Arrangement Type</label>
                <select
                  value={newArrangement.arrangement_type}
                  onChange={(e) => setNewArrangement({ ...newArrangement, arrangement_type: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="flight">Flight</option>
                  <option value="transfer">Airport / Hospital Transfer</option>
                  <option value="hotel">Medical Lodging / Hotel</option>
                  <option value="visa">Visa Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Name</label>
                <input
                  type="text"
                  required
                  value={newArrangement.provider_name}
                  onChange={(e) => setNewArrangement({ ...newArrangement, provider_name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newArrangement.start_time}
                    onChange={(e) => setNewArrangement({ ...newArrangement, start_time: e.target.value })}
                    className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newArrangement.end_time}
                    onChange={(e) => setNewArrangement({ ...newArrangement, end_time: e.target.value })}
                    className="w-full text-xs px-2 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Location</label>
                  <input
                    type="text"
                    value={newArrangement.departure_location}
                    onChange={(e) => setNewArrangement({ ...newArrangement, departure_location: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival Location</label>
                  <input
                    type="text"
                    value={newArrangement.arrival_location}
                    onChange={(e) => setNewArrangement({ ...newArrangement, arrival_location: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
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
                  Save Travel Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
