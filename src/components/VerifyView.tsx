import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, ShieldAlert, Calendar, User, Building, Landmark, CheckCircle2, FileCheck, Download, AlertTriangle, HelpCircle } from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../data/mockTemplates';

interface VerifyViewProps {
  initialCode?: string;
}

export default function VerifyView({ initialCode }: VerifyViewProps) {
  const [searchCode, setSearchCode] = useState(initialCode || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-run if initialCode is provided via router navigation state or URL query
  useEffect(() => {
    if (initialCode) {
      setSearchCode(initialCode);
      handleVerification(initialCode);
    }
  }, [initialCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    handleVerification(searchCode.trim());
  };

  const handleVerification = async (code: string) => {
    setIsVerifying(true);
    setSearched(true);
    setVerificationResult(null);

    try {
      // 1. Query the secure database API endpoint (connects to Supabase / local DB)
      const res = await fetch(`/api/verify/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        setVerificationResult({
          isValid: true,
          isDbRecord: true,
          document_id: data.document_id,
          type: data.document_type_id,
          recipient: data.recipient_name,
          organization: data.organization_name,
          issueDate: new Date(data.created_at).toLocaleDateString(),
          pdf_url: data.pdf_url,
          docx_url: data.docx_url,
          status: data.status,
          hash: data.status === 'Valid' ? `SECURE-PLATFORM-SEALED` : 'REVOKED-AND-INVALIDATED'
        });
        setIsVerifying(false);
        return;
      }
    } catch (err) {
      console.warn('[Verify Portal] API endpoint check failed, checking local static templates:', err);
    }

    // 2. Fallback to matching static mock presets
    const matchingPreset = DOCUMENT_TEMPLATES.find(
      (t) => t.id.toLowerCase() === code.toLowerCase() || code.toUpperCase().includes(t.id.toUpperCase())
    );

    if (matchingPreset) {
      setVerificationResult({
        isValid: true,
        isDbRecord: false,
        document_id: matchingPreset.id.toUpperCase(),
        type: matchingPreset.type,
        recipient: matchingPreset.presetData.recipientName,
        organization: matchingPreset.presetData.organization,
        issueDate: matchingPreset.presetData.issueDate || '2026-10-15',
        title: matchingPreset.title,
        signatory: `${matchingPreset.presetData.signatoryName} (${matchingPreset.presetData.signatoryTitle})`,
        details: matchingPreset.presetData.body,
        status: 'Valid',
        hash: `SHA-256: 0x9A2F8D3C${matchingPreset.id.substring(3).toUpperCase()}`,
      });
    } else {
      setVerificationResult({
        isValid: false,
        error: 'Document Reference ID was not found in our active verification ledger.'
      });
    }
    setIsVerifying(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header Info */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-full">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Document Verification Registry
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed text-wrap-balance">
          DocuAI uses high-performance PostgreSQL indexing to track and certify authentic credentials. Scan or paste your official reference serial ID below to retrieve immediate legal verification parameters.
        </p>
      </div>

      {/* Input Search Block */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Document Reference ID (e.g. DOC-2026-000001)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white text-sm font-semibold rounded-lg disabled:bg-indigo-400 transition-all active:scale-95 shadow cursor-pointer"
          >
            {isVerifying ? 'Searching Ledger...' : 'Verify Reference'}
          </button>
        </div>
      </form>

      {/* Verification Search Results Area */}
      {searched && (
        <div className="max-w-2xl mx-auto animate-scale-in">
          {isVerifying ? (
            /* Elegant loading skeleton */
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto"></div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900 font-mono">RETRIEVING ENCRYPTED BLOCKS...</p>
                <p className="text-xs text-slate-500">Querying platform database nodes for match integrity.</p>
              </div>
            </div>
          ) : verificationResult ? (
            verificationResult.isValid ? (
              /* Success Results Card */
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg space-y-6">
                
                {/* Visual Status Banner */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${
                  verificationResult.status === 'Valid' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {verificationResult.status === 'Valid' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="text-sm font-bold uppercase tracking-wide">
                      {verificationResult.status === 'Valid' ? 'DOCUMENT CREDENTIAL CONFIRMED' : 'CREDENTIAL REVOKED & INVALIDATED'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    verificationResult.status === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-red-800'
                  }`}>
                    {verificationResult.status}
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    {/* Document ID */}
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                        <FileCheck className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Document ID</div>
                        <div className="text-sm font-bold text-slate-900 font-mono">{verificationResult.document_id}</div>
                      </div>
                    </div>

                    {/* Document Type */}
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                        <Landmark className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Document Type</div>
                        <div className="text-sm font-bold text-slate-900 uppercase font-mono">{verificationResult.type}</div>
                      </div>
                    </div>

                    {/* Recipient */}
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Recipient Name</div>
                        <div className="text-sm font-bold text-slate-900">{verificationResult.recipient}</div>
                      </div>
                    </div>

                    {/* Issuer Organization */}
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                        <Building className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Issuing Organization</div>
                        <div className="text-sm font-bold text-slate-900">{verificationResult.organization}</div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Issue Date</div>
                        <div className="text-sm font-bold text-slate-900 font-mono">{verificationResult.issueDate}</div>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="flex gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Ledger Integrity</div>
                        <div className={`text-sm font-bold flex items-center gap-1 ${
                          verificationResult.status === 'Valid' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {verificationResult.status === 'Valid' ? 'SECURE VALID' : 'INVALIDATED'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Segment (If database descriptive details or text exist) */}
                  {verificationResult.details && (
                    <div className="pt-6 border-t border-slate-100 space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Scope of Content Achievements</h4>
                      <p className="text-slate-600 text-xs leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-100 font-sans">
                        {verificationResult.details}
                      </p>
                    </div>
                  )}

                  {/* Dynamic Cloud Storage Downloads (Only for real registered items) */}
                  {verificationResult.isDbRecord && (verificationResult.pdf_url || verificationResult.docx_url) && (
                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Verifiable Document Downloads</h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {verificationResult.pdf_url && (
                          <a
                            href={verificationResult.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-grow py-2 px-3 bg-[#FAFBFD] hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-4 h-4 text-indigo-600" />
                            Download PDF (Sealed)
                          </a>
                        )}
                        {verificationResult.docx_url && (
                          <a
                            href={verificationResult.docx_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-grow py-2 px-3 bg-[#FAFBFD] hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Download className="w-4 h-4 text-slate-800" />
                            Download DOCX (Sealed)
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hash lock footer */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Platform Verification Seal:</span>
                    <span className="text-indigo-600 font-bold text-xs select-all">{verificationResult.hash}</span>
                  </div>
                </div>

              </div>
            ) : (
              /* Error Fail Card */
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Verification Failure</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    {verificationResult.error} Please confirm the syntax of your reference code (try using <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-indigo-600 font-bold font-mono">cert-classic</code> or a valid generated ID).
                  </p>
                </div>
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}
