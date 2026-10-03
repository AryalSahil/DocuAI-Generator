import React, { useState } from 'react';
import { Award, ShieldCheck, Printer, ArrowRight } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (path: string, state?: any) => void;
}

export default function AboutView({ onNavigate }: AboutViewProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Editorial Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">Our Mission</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Bringing Design Integrity and Cryptographic Validity to Corporate Operations
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          DocuAI was conceived to eliminate the friction, generic formats, and lack of accountability inherent in traditional organizational documentation. We believe that professional credentials should represent both spectacular design standards and bulletproof validation.
        </p>
      </div>

      {/* Marquee High-Fidelity Visual Asset with Zero-Broken-Image Policy */}
      <div className="relative rounded-2xl overflow-hidden aspect-[21/9] border border-slate-200/60 shadow-md bg-slate-150">
        {!imageError ? (
          <img
            src="/src/assets/images/docuai_hq_showcase_1791037443453.jpg"
            alt="DocuAI Luxury Administrative Folder and Credentials Showcase"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-Fidelity Styled CSS Fallback Grid Box */
          <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center text-center p-6 space-y-3">
            <Award className="w-10 h-10 text-amber-500 animate-bounce" />
            <h3 className="text-lg font-bold text-white">DocuAI Secure Credentials Archive</h3>
            <p className="text-slate-400 text-xs max-w-md">
              Securely indexing certificates, job contracts, and internship completions under rigorous cryptographic and design frameworks.
            </p>
          </div>
        )}
        {/* Visual Overlay Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6 md:p-10">
          <p className="text-xs sm:text-sm font-semibold text-slate-300 font-mono tracking-widest uppercase">
            EST. 2026 · SECURED PROTOCOLS ONLY
          </p>
        </div>
      </div>

      {/* Core Values / Architectural Anchors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Aesthetic Precision</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We bypass ugly text templates. Every margin ratio, typography size scale, and border double-stroke is balanced for high-fidelity rendering.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Cryptographic Accountability</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Fake credentials threaten organizational trust. Our SHA-like platform signatures mathematically bind document details to prevent alterations.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">True Paper Correspondence</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Our output is built for the real world. Every letterhead and certificate compiles directly to A4 specifications without alignment shift.
          </p>
        </div>
      </div>

      {/* Social Proof & Attributable Testimonials */}
      <section className="bg-slate-50 rounded-xl p-8 border border-slate-250/60 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">Trusted by Scaling Operations</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Fast-growing agencies, decentralized networks, and engineering cohorts deploy DocuAI to legitimize their professional recognitions.
          </p>
          <div className="space-y-1 font-mono text-xs text-indigo-600">
            <div>+34,000 Certified Completions</div>
            <div>99.98% Verification Ledger Integrity</div>
          </div>
        </div>

        <div className="md:col-span-8 border-l border-slate-250/80 pl-0 md:pl-8 space-y-6">
          <blockquote className="space-y-4">
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
              "We migrated all software certificate processing and standard hire letters to the DocuAI structure. It solved layout errors completely and background checkers love using the reference hashes."
            </p>
            <cite className="block not-italic">
              <span className="block font-bold text-slate-900 text-xs sm:text-sm">Reginald Vance</span>
              <span className="block text-slate-400 text-xs font-medium font-mono uppercase tracking-wider">VP of Engineering · Hyperlink Systems</span>
            </cite>
          </blockquote>
        </div>
      </section>

      {/* Direct Action Footer */}
      <div className="pt-8 text-center border-t border-slate-100 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Ready to draft your first verified credential?</h3>
        <button
          onClick={() => onNavigate('/create')}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md hover:scale-[1.01] transition-all"
        >
          Open Document Creator Dashboard
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
