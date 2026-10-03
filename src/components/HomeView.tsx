import React, { useState, useEffect } from 'react';
import { FileText, Award, FileSpreadsheet, CheckCircle, Search, Shield, Zap, Printer, ArrowRight } from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../data/mockTemplates';

interface HomeViewProps {
  onNavigate: (path: string, state?: any) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'certificate' | 'offer-letter' | 'internship-letter'>('certificate');
  const [typedText, setTypedText] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');

  // Auto-typing text simulator in the hero preview to show "AI-Assistance"
  const getSimulatedBody = () => {
    if (activePreviewTab === 'certificate') {
      return "successfully completed the Advanced AI Systems Deployment curriculum and demonstrated deep competence in low-latency fine-tuning.";
    } else if (activePreviewTab === 'offer-letter') {
      return "thrilled to extend this formal offer for the Senior Software Architect position. In this capacity, you will spearhead cloud orchestration.";
    } else {
      return "completed their Full-Stack Engineering Internship at DocuAI Labs. They built six modular UI states and eliminated latency bottlenecks.";
    }
  };

  useEffect(() => {
    let index = 0;
    const fullText = getSimulatedBody();
    setTypedText('');
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [activePreviewTab]);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      setSearchError('Please enter a valid document hash or ID.');
      return;
    }
    setSearchError('');
    onNavigate('/verify', { code: searchCode });
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-10 md:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-semibold text-indigo-700">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Legitimate Enterprise Credentials</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Create Professional <br />
              <span className="text-indigo-600">Documents in Minutes</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-wrap-balance">
              Generate beautifully designed certificates, offer letters and internship letters with AI-assisted content. Perfect for scaling software projects, organizations, and professional teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => onNavigate('/create')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
              >
                Create Document
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('/templates')}
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all"
              >
                Explore Templates
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 border-t border-slate-100 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Print-Ready PDFs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Verified Cryptographic Hash</span>
              </div>
            </div>
          </div>

          {/* Hero Live Document Preview Mockup */}
          <div className="lg:col-span-6 w-full max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
              {/* Tab Selector Buttons */}
              <div className="flex border-b border-slate-100 p-2 bg-slate-50/50 gap-1">
                {(['certificate', 'offer-letter', 'internship-letter'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePreviewTab(tab)}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all whitespace-nowrap capitalize ${
                      activePreviewTab === tab
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {/* Render Selected Animated Preview */}
              <div className="p-8 aspect-[4/3] flex flex-col justify-between bg-white relative overflow-hidden select-none">
                {activePreviewTab === 'certificate' && (
                  <div className="h-full border-[10px] border-amber-500/20 p-4 flex flex-col justify-between text-center relative bg-[#FCFAF7]">
                    {/* Inner double border */}
                    <div className="absolute inset-2 border border-amber-500/30"></div>
                    
                    <div className="relative space-y-2">
                      <div className="text-[10px] tracking-widest font-mono text-amber-700 uppercase font-bold">Honorary Award</div>
                      <h3 className="font-serif-display text-2xl text-slate-800 italic">Certificate of Completion</h3>
                    </div>

                    <div className="relative space-y-1">
                      <div className="text-xs text-slate-500">This is proudly presented to</div>
                      <div className="font-serif-display text-xl font-bold text-indigo-950 border-b border-slate-200 pb-1 max-w-[200px] mx-auto">Sarah Jenkins</div>
                    </div>

                    <div className="relative px-6 text-center">
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans min-h-[44px]">
                        {typedText}
                        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-indigo-600 animate-pulse">|</span>
                      </p>
                    </div>

                    <div className="relative grid grid-cols-2 gap-4 items-end pt-2 text-[10px] text-slate-500">
                      <div className="text-left pl-4">
                        <div className="font-serif-display text-slate-800 italic border-b border-slate-200 pb-0.5">Arthur Vance</div>
                        <div className="text-[8px]">Dr. Arthur Vance · DocuAI</div>
                      </div>
                      <div className="text-right pr-4">
                        <div className="font-mono text-indigo-600 font-semibold border-b border-slate-200 pb-0.5">VERIFIED HASH</div>
                        <div className="text-[7px] truncate font-mono">SHA-256: e8f12a3d...</div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'offer-letter' && (
                  <div className="h-full flex flex-col justify-between text-left p-2 bg-white text-slate-800">
                    <div className="border-t-4 border-indigo-900 pt-2 flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-indigo-900 uppercase tracking-tight">Prism Technologies Inc.</div>
                        <div className="text-[9px] text-slate-400">100 Pine St, San Francisco, CA</div>
                      </div>
                      <div className="text-[8px] font-mono text-slate-400">Date: Oct 10, 2026</div>
                    </div>

                    <div className="space-y-1.5 my-3">
                      <div className="text-[9px] font-bold text-slate-500">CONFIDENTIAL OFFER LETTER</div>
                      <div className="text-[10px] text-slate-600 font-medium">To: David Vance</div>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-sans min-h-[66px]">
                        {typedText}
                        <span className="inline-block w-1.5 h-3 bg-indigo-600 animate-pulse">|</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex justify-between items-end text-[9px] text-slate-500">
                      <div>
                        <div className="font-medium text-slate-800">Katherine Pierce</div>
                        <div className="text-[8px]">VP of People Operations</div>
                      </div>
                      <div className="font-mono text-[7px] text-right">
                        <div>Doc ID: DOC-OFFR-928A</div>
                        <div className="text-indigo-600">Verification Hash Secured</div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'internship-letter' && (
                  <div className="h-full flex flex-col justify-between text-left p-2 bg-[#FAFBFD] text-slate-800">
                    <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                      <div className="text-xs font-extrabold text-slate-900 tracking-tight">DocuAI Advanced Labs</div>
                      <div className="text-[8px] font-mono text-slate-500">Ref: LA-920-2026</div>
                    </div>

                    <div className="space-y-2 my-2">
                      <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">TO WHOM IT MAY CONCERN</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans min-h-[55px]">
                        {typedText}
                        <span className="inline-block w-1.5 h-3 bg-indigo-600 animate-pulse">|</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[8px] text-slate-500">
                      <div>
                        <div className="font-medium text-slate-800">Nadia Petrova</div>
                        <div className="text-[7px]">Director of Frontend Engineering</div>
                      </div>
                      <div className="text-right">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold uppercase tracking-widest text-[7px] border border-emerald-100">
                          Verified Legit
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Engineered for Authenticity and Speed
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every document generated is compliant, visually striking, and completely secure. No templates with broken fields—only premium-grade organizational output.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI-Guided Composition</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Generate cohesive, context-appropriate paragraphs instantly based on your bullet points. No generic prose—tailored strictly to human capital accomplishments.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Secure SHA-256 Hashing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every document is cataloged with a unique, self-verifying hash code. Recipients can paste this code on your portal to immediately check the valid issuer.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Print-Perfect Layouts</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Engineered with physical dimensions and standard letterheads in mind. Standardize fonts, line heights, and padding ratios to download print-ready structures.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white rounded-2xl max-w-7xl mx-auto mx-4 sm:mx-6 lg:mx-8 px-6 py-16 md:px-12 relative overflow-hidden">
        {/* Abstract design backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl font-extrabold text-white">
            The Three-Step Creation Protocol
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            DocuAI operates on structured inputs coupled with context engines to guarantee professional alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 relative z-10">
          {/* Step 1 */}
          <div className="space-y-3 relative">
            <div className="text-5xl font-extrabold text-indigo-500 font-mono tracking-tight">01</div>
            <h3 className="text-lg font-semibold text-white">Define Schema & Role</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Select your base document type (Certificate, Offer, or Internship) and insert core recipient parameters, salary tiers, and validation names.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative">
            <div className="text-5xl font-extrabold text-indigo-500 font-mono tracking-tight">02</div>
            <h3 className="text-lg font-semibold text-white">AI-Assisted Writing</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Provide short bullet points about the achievements. The system dynamically expands these details into polished, executive sentences.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative">
            <div className="text-5xl font-extrabold text-indigo-500 font-mono tracking-tight">03</div>
            <h3 className="text-lg font-semibold text-white">Securing & Publishing</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Compute the secure verification code, lock the style palette, and instantly print your high-resolution layout or save the PDF locally.
            </p>
          </div>
        </div>

        <div className="pt-12 text-center relative z-10">
          <button
            onClick={() => onNavigate('/how-it-works')}
            className="inline-flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Read Technical Mechanism Details
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Supported Document Types Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Supported Formats</h2>
          <p className="text-slate-600 text-sm">
            We support three primary legal and administrative document categories, tuned meticulously for visual harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Certificate Spotlight */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Professional Certificates</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Award certifications of completion, merit, or course excellence. Choose from multiple royal serif border designs and premium gold-stamped emblems.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">2 Themes Available</span>
              <button
                onClick={() => onNavigate('/create', { type: 'certificate' })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Draft Certificate →
              </button>
            </div>
          </div>

          {/* Offer Letter Spotlight */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Employment Offer Letters</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Legitimate hiring letterheads. Includes structured segments for title, salary, benefits, expiry covenants, and clear terms and conditions.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">3 Letterheads Available</span>
              <button
                onClick={() => onNavigate('/create', { type: 'offer-letter' })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Draft Offer Letter →
              </button>
            </div>
          </div>

          {/* Internship Letter Spotlight */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Internship Letters</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Acknowledge program completion, list targeted achievements, and draft professional remarks reflecting intern performance.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">2 Presets Available</span>
              <button
                onClick={() => onNavigate('/create', { type: 'internship-letter' })}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Draft Internship Letter →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Templates Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Template Showcase</h2>
            <p className="text-slate-600 text-sm">Select a pre-designed layout optimized for high-impact content.</p>
          </div>
          <button
            onClick={() => onNavigate('/templates')}
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View All Templates
            <ArrowRight className="ml-1.5 w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DOCUMENT_TEMPLATES.slice(0, 3).map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onNavigate('/create', { presetId: tpl.id })}
              className="group bg-white rounded-xl border border-slate-200/60 p-6 space-y-4 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span className="font-semibold text-indigo-600 capitalize">{tpl.type.replace('-', ' ')}</span>
                <span>{tpl.category}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{tpl.title}</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{tpl.description}</p>
              <div className="pt-2 text-xs font-semibold text-indigo-600 group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
                Customize Template <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Widget Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
          {/* Decorative mesh */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-200/20 rounded-full blur-2xl"></div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Verify a Document</h2>
            <p className="text-slate-600 text-sm leading-relaxed text-wrap-balance">
              Are you a background check coordinator or hiring manager? Check the status of a DocuAI-secured certificate or contract below.
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="max-w-lg mx-auto relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Document ID (e.g., cert-exec-01)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg active:scale-95 transition-all shadow-sm"
              >
                Verify Now
              </button>
            </div>
            {searchError && (
              <p className="text-rose-600 text-xs text-left mt-2 pl-1 font-medium">{searchError}</p>
            )}
          </form>

          <p className="text-xs text-slate-400">
            Hint: Use <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-indigo-600">cert-exec-01</code> or <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-indigo-600 font-bold">offer-corp-01</code> for a quick live trial.
          </p>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}
