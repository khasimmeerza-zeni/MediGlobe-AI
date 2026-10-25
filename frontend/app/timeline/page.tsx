"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  ShieldCheck,
  User,
  Sparkles,
  ArrowRight,
  Filter
} from "lucide-react";

export default function TimelinePage() {
  const [journey, setJourney] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const journeys = await api.getJourneys();
      if (journeys && journeys.length > 0) {
        const active = journeys[0];
        setJourney(active);
        setStages(active.stages || []);
        
        // Expand all stages by default
        const initialExpanded: Record<string, boolean> = {};
        (active.stages || []).forEach((st: any) => {
          initialExpanded[st.id] = true;
        });
        setExpandedStages(initialExpanded);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTaskStatus(taskId, { status: newStatus });
      fetchTimeline();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-health-blue border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading 7-stage medical travel timeline...</p>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">No active journey found</h2>
        <p className="text-xs text-slate-500">Please generate a journey in the AI Planner first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 card-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-health-blue border border-blue-200 uppercase">
              7-Stage Timeline
            </span>
            <span className="text-xs text-slate-400">• Readiness: {journey.readiness_score}%</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">{journey.title}</h1>
          <p className="text-xs text-slate-500">
            Care Category: <span className="font-semibold text-slate-700">{journey.treatment_category}</span> • Departure:{" "}
            <span className="font-semibold text-slate-700">{formatDate(journey.departure_date)}</span>
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Filter:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Only</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>
        </div>
      </div>

      {/* 7 STAGES TIMELINE LIST */}
      <div className="space-y-6">
        {stages.map((stage: any) => {
          const isExpanded = expandedStages[stage.id] !== false;
          let stageTasks = stage.tasks || [];
          if (filterPriority !== "all") {
            stageTasks = stageTasks.filter((t: any) => t.priority === filterPriority);
          }

          const stageCompleted = stageTasks.length > 0 && stageTasks.every((t: any) => t.status === "completed");

          return (
            <div
              key={stage.id}
              className="rounded-2xl bg-white border border-slate-200 card-subtle overflow-hidden transition-shadow"
            >
              {/* Stage Header */}
              <div
                onClick={() => toggleStage(stage.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition border-b border-slate-100"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      stageCompleted
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-navy-900 text-white"
                    }`}
                  >
                    {stageCompleted ? <CheckCircle2 className="w-5 h-5" /> : `0${stage.stage_order}`}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                      <span>{stage.stage_name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({stageTasks.length} tasks)
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Status: <span className="uppercase text-slate-700">{stage.status.replace("_", " ")}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Stage Tasks List */}
              {isExpanded && (
                <div className="p-5 space-y-3 bg-slate-50/40">
                  {stageTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No tasks matching the selected filter.</p>
                  ) : (
                    stageTasks.map((task: any) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition bg-white ${
                          task.status === "completed"
                            ? "border-emerald-200/80 bg-emerald-50/20"
                            : task.status === "blocked"
                            ? "border-red-200 bg-red-50/20"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {/* Status Badge */}
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                                task.status === "completed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : task.status === "in_progress"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : task.status === "awaiting_confirmation"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : task.status === "blocked"
                                  ? "bg-red-50 text-red-800 border-red-300"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              <option value="not_started">Not Started</option>
                              <option value="in_progress">In Progress</option>
                              <option value="awaiting_confirmation">Awaiting Confirmation</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                task.priority === "urgent"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : task.priority === "high"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {task.priority.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <User className="w-3 h-3 text-slate-400" />
                              {task.responsible_party}
                            </span>
                            {task.due_date && <span>• Due: {formatDate(task.due_date)}</span>}
                          </div>
                        </div>

                        {/* Title and Description */}
                        <h4
                          className={`text-xs sm:text-sm font-bold text-navy-900 mb-1 ${
                            task.status === "completed" ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
                        )}

                        {/* Warning notes or source references */}
                        {(task.warning_notes || (task.source_references && task.source_references.length > 0)) && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] gap-2">
                            {task.warning_notes && (
                              <span className="text-amber-800 flex items-center gap-1 font-medium">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                {task.warning_notes}
                              </span>
                            )}
                            {task.source_references && task.source_references.length > 0 && (
                              <span className="text-slate-400 font-mono text-[10px]">
                                Source: {task.source_references.join(", ")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
