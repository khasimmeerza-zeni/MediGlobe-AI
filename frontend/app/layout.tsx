import type { Metadata } from "next";
import { AuthProvider } from "@/lib/authContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediGlobe AI | Global Medical Journey Intelligence & Coordination",
  description: "AI-powered medical travel planning, transparent hospital comparisons, cost intelligence, and deterministic logistical conflict detection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-health-blue selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
