"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  Compass,
  LayoutDashboard,
  Building2,
  GitCompare,
  DollarSign,
  AlertTriangle,
  FileText,
  Plane,
  HeartHandshake,
  ShieldCheck,
  UserCheck,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, loginAsDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/planner", label: "AI Planner", icon: Sparkles },
    { href: "/timeline", label: "Timeline", icon: Compass },
    { href: "/hospitals", label: "Hospitals", icon: Building2 },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/costs", label: "Cost Intel", icon: DollarSign },
    { href: "/intelligence", label: "Intelligence", icon: AlertTriangle },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/travel", label: "Travel", icon: Plane },
    { href: "/follow-up", label: "Follow-up", icon: HeartHandshake },
    { href: "/admin", label: "Admin Portal", icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-health-blue flex items-center justify-center text-white shadow-md shadow-health-blue/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-navy-900 flex items-center gap-1.5">
                MediGlobe <span className="text-xs px-2 py-0.5 rounded-full bg-health-blue/10 text-health-blue font-semibold">AI</span>
              </span>
              <span className="block text-[10px] text-slate-500 font-medium tracking-wide">GLOBAL JOURNEY INTELLIGENCE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-navy-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Demo Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
                className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition"
                title="Quick Role Switcher for Hackathon Demo"
              >
                <UserCheck className="w-3.5 h-3.5 text-health-blue" />
                <span>Role:</span>
                <span className="font-semibold text-navy-900 uppercase tracking-wider text-[11px]">
                  {user ? user.role.replace("_", " ") : "Demo Switcher"}
                </span>
              </button>

              {roleSwitchOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Persona Demo
                  </div>
                  <button
                    onClick={() => {
                      loginAsDemoRole("patient");
                      setRoleSwitchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-slate-700 flex flex-col"
                  >
                    <span className="font-semibold text-navy-900">Patient (Sarah Jenkins)</span>
                    <span className="text-[10px] text-slate-500">View journeys, timeline, documents</span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoRole("hospital_admin");
                      setRoleSwitchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-slate-700 flex flex-col"
                  >
                    <span className="font-semibold text-navy-900">Hospital Admin (Bangkok)</span>
                    <span className="text-[10px] text-slate-500">Manage hospital profile & shared docs</span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoRole("platform_admin");
                      setRoleSwitchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-slate-700 flex flex-col"
                  >
                    <span className="font-semibold text-navy-900">Platform Admin (Eleanor)</span>
                    <span className="text-[10px] text-slate-500">Verify credentials, audits, reset demo</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="text-xs text-slate-600 hidden lg:inline max-w-[120px] truncate font-medium">
                  {user.full_name}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-navy-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1">
          <div className="grid grid-cols-2 gap-1.5 pb-3 border-b border-slate-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    pathname === link.href ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Demo Switcher */}
          <div className="pt-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Switch Persona Demo
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  loginAsDemoRole("patient");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 text-[11px] bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg font-medium text-slate-800"
              >
                Patient
              </button>
              <button
                onClick={() => {
                  loginAsDemoRole("hospital_admin");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 text-[11px] bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg font-medium text-slate-800"
              >
                Hospital
              </button>
              <button
                onClick={() => {
                  loginAsDemoRole("platform_admin");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 text-[11px] bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg font-medium text-slate-800"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
