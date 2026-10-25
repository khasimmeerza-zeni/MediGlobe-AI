"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { api, setToken } from "@/lib/api";
import {
  Compass,
  LogIn,
  UserCheck,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemoRole, refreshUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          role,
        });
        setToken(res.access_token);
        await refreshUser();
        router.push("/dashboard");
      } else {
        await login(email, password);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: "patient" | "hospital_admin" | "platform_admin") => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemoRole(demoRole);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in as demo user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-900 to-health-blue flex items-center justify-center text-white mx-auto shadow-md">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900">
          {isRegister ? "Create MediGlobe Account" : "Sign In to MediGlobe AI"}
        </h1>
        <p className="text-xs text-slate-500">
          Global medical travel intelligence, scheduling coordination, and verified hospital records.
        </p>
      </div>

      {/* 1-CLICK DEMO PERSONA SWITCHERS */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-3">
        <span className="text-[11px] font-bold text-health-blue uppercase tracking-wider block">
          Hackathon Quick Switch (1-Click Login)
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("patient")}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition flex flex-col items-center gap-1"
          >
            <UserCheck className="w-4 h-4 text-health-blue" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("hospital_admin")}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition flex flex-col items-center gap-1"
          >
            <Building2 className="w-4 h-4 text-health-blue" />
            <span>Hospital</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("platform_admin")}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition flex flex-col items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LOGIN / REGISTER FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 card-subtle p-6 space-y-4 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jane Doe or Patient Name"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-health-blue/20"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="patient">Patient (Journey Organizer)</option>
                <option value="hospital_admin">Hospital Administrator</option>
                <option value="platform_admin">Platform Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>{isRegister ? "Create Account" : "Sign In"}</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-health-blue hover:underline font-semibold"
          >
            {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
