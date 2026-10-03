import React, { useState } from 'react';
import { Sparkles, Shield, Cpu, Printer, Check, Terminal, FileCheck } from 'lucide-react';

export default function HowItWorksView() {
  const [activeTab, setActiveTab] = useState<'ai' | 'security' | 'layout'>('ai');

  // Interactive Hash Calculator playground state
  const [testName, setTestName] = useState('Alexander Vance');
  const [testOrg, setTestOrg] = useState('Acme Logistics');
  const [testDate, setTestDate] = useState('2026-10-03');
  
  // Fast visual mock hashing generator
  const getCalculatedHash = () => {
    const textToHash = `${testName}-${testOrg}-${testDate}`;
    let hash = 0;
    for (let i = 0; i < textToHash.length; i++) {
      hash = (hash << 5) - hash + textToHash.charCodeAt(i);
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `DOC-CRT-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Header section */}
      <div className="space-y-4 max-w-3xl">
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">Technical Architecture</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How DocuAI Works
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Our platform integrates executive formatting rules with context-guided language models and client-side cryptography to deliver verified professional documents.
        </p>
      </div>

      {/* 3 Interactive Tab Buttons */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 -mb-px">
          {(['ai', 'security', 'layout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab === 'ai' ? '1. AI Enrichment' : tab === 'security' ? '2. Cryptographic Security' : '3. Print Engine Compilation'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-6 sm:p-10 shadow-sm">
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <Cpu className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">1. Contextual Prose Expansion</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Traditional document builders require you to manually write paragraphs or copy-paste from obsolete drafts, resulting in repetitive, flat structures. 
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                DocuAI bypasses this friction by parsing simple, short raw parameters—like task deliverables, key achievements, or compensation numbers—and mapping them into robust, executive-grade sentences.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-2.5 text-xs text-slate-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Executive Tone Alignment (Corporate Navy, Modern, or Classic Serif)</span>
                </div>
                <div className="flex gap-2.5 text-xs text-slate-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Grammar Normalization & Compliance Covenants</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-950 text-slate-300 p-5 rounded-lg font-mono text-[11px] leading-relaxed border border-slate-900 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-indigo-400">
                <span>RAW KEYWORDS INPUT</span>
                <span>STATE: MAP</span>
              </div>
              <div className="py-2 space-y-1">
                <div className="text-emerald-400">&gt; Name: Sarah Jenkins</div>
                <div className="text-emerald-400">&gt; Achievements: resolved UI latencies, delivered five screens</div>
              </div>
              <div className="pt-3 border-t border-slate-850 text-slate-450 text-[10px]">
                <div className="text-indigo-300 uppercase font-bold">SYNTHESIZED OUTLINE:</div>
                "For extraordinary technical leadership and exceptional mastery... Having successfully integrated advanced parameters around UI latency optimization and modern screens, she has demonstrated a profound commitment..."
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">2. Platform Verification Ledger</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                To guarantee organizational validity and protect credentials from unauthorized edits, every document produced is assigned a self-verifying platform ID.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                This verification signature mathematically locks the relationship between the Recipient, the Issuing Organization, and the Issue Timestamp. Changing even a single character in the document makes the hash check fail.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-2.5 text-xs text-slate-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tamper-Proof Verification Lookup Matrix</span>
                </div>
                <div className="flex gap-2.5 text-xs text-slate-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Single-source Truth ledger (no external database lockup required)</span>
                </div>
              </div>
            </div>

            {/* Interactive Hash Calculator Playground */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-lg space-y-4">
              <h3 className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5 uppercase">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Live Cryptographic Simulator
              </h3>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-0.5 uppercase">Recipient Name</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-0.5 uppercase">Organization</label>
                  <input
                    type="text"
                    value={testOrg}
                    onChange={(e) => setTestOrg(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-900 text-white rounded border border-indigo-950 text-center space-y-1">
                <span className="text-[9px] uppercase tracking-widest font-mono text-indigo-300">CALCULATED SECURE HASH</span>
                <div className="font-mono text-sm font-bold tracking-wider select-all">{getCalculatedHash()}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex p-3 rounded-lg bg-amber-50 text-amber-600">
                <Printer className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">3. Physical Layout Framework</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Most web-based builders do not translate accurately to printed physical paper, causing arbitrary pagination page overflows, ugly margins, and clipped watermarks.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                DocuAI utilizes standardized aspect-ratio calculations matching standard ISO A4 paper (1:1.41) alongside clean, print-targeted media queries. This guarantees what you see on the canvas screen is exactly what aligns on the paper feed.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-2.5 text-xs text-slate-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Precise 1:1.41 aspect ratios</span>
                </div>
                <div className="flex gap-2.5 text-xs text-slate-600 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>CSS Printing Boundaries (disabling menus, headers, and UI panels during print actions)</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center items-center p-4">
              <div className="border border-slate-200 shadow-md p-6 bg-white max-w-[200px] aspect-[1/1.41] w-full text-center relative flex flex-col justify-between">
                <div className="absolute inset-2 border border-dashed border-indigo-400/40"></div>
                <div className="text-[7px] text-slate-400 font-mono">PRINT BOUNDS AREA (A4)</div>
                <div className="w-8 h-8 rounded-full border-2 border-indigo-600 mx-auto opacity-30 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-[6px] text-slate-400 font-mono">0.5in PADDING SCALE</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
