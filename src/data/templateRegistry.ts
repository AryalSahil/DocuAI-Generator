export interface TemplateDefinition {
  id: string;
  type: 'certificate' | 'offer-letter' | 'internship-letter';
  name: string;
  description: string;
  category: string;
  thumbnailClass: string; // CSS style or color preview
  htmlStructure: string;  // HTML/Tailwind template containing variable placeholders
}

// Global substitution engine to parse string templates
export function renderTemplate(templateString: string, variables: Record<string, string>): string {
  let rendered = templateString;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, value || '');
  });
  return rendered;
}

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  // ================= CERTIFICATES =================
  {
    id: 'cert-classic',
    type: 'certificate',
    name: 'Classic Heritage',
    category: 'Traditional',
    description: 'A formal serif credential with double amber borders, an ornate brand crest, and elegant central alignment.',
    thumbnailClass: 'border-amber-600 bg-[#FAF8F5]',
    htmlStructure: `
      <div class="h-full border-[10px] border-amber-600/35 p-6 flex flex-col justify-between text-center bg-[#FAF8F5] relative font-serif select-none" style="box-sizing: border-box;">
        <div class="absolute inset-2 border-2 border-amber-600/25 pointer-events-none"></div>
        
        <div class="relative space-y-4">
          <div class="flex justify-center mb-1">
            {{logoHtml}}
          </div>
          <div class="text-[9px] tracking-[0.25em] font-mono text-amber-800 uppercase font-bold">Formal Credential of Excellence</div>
          <h1 class="font-serif-display text-3xl sm:text-4xl text-slate-800 tracking-wide font-extrabold italic">{{documentTitle}}</h1>
          <div class="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Issued by {{organizationName}}</div>
        </div>

        <div class="relative space-y-2 my-4">
          <div class="text-xs text-slate-500 italic font-serif">This certificate is proudly conferred upon</div>
          <div class="font-serif-display text-2xl sm:text-3xl font-extrabold text-indigo-950 border-b border-amber-600/30 pb-2 max-w-[320px] mx-auto tracking-tight">
            {{recipientName}}
          </div>
          <div class="text-[9px] text-slate-400 font-mono">{{orgAddress}}</div>
        </div>

        <div class="relative px-6 md:px-12 text-center my-3 max-w-prose mx-auto">
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans min-h-[60px]">
            {{description}}
          </p>
        </div>

        <div class="relative grid grid-cols-2 gap-8 items-end text-xs text-slate-500 pt-5 border-t border-slate-200/60 max-w-[480px] mx-auto w-full">
          <div class="text-left space-y-1">
            <div class="h-10 flex items-end pl-2">
              {{sigHtml}}
            </div>
            <div class="border-t border-slate-200 pt-1">
              <div class="font-serif font-bold text-slate-800 italic text-xs leading-none">{{issuerName}}</div>
              <div class="text-[8px] text-slate-400 uppercase tracking-wider font-sans mt-0.5">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right space-y-1 font-mono text-[9px] mb-1">
            <div><span class="text-slate-400">CREDENTIAL ID:</span> <span class="text-slate-700 font-semibold">{{documentId}}</span></div>
            <div><span class="text-slate-400">ISSUE DATE:</span> <span class="text-slate-700 font-semibold">{{issueDate}}</span></div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'cert-modern',
    type: 'certificate',
    name: 'Modern Edge',
    category: 'Minimalist',
    description: 'An asymmetrical contemporary layout featuring left-aligned text, modern sans typography, and bold geometric dividers.',
    thumbnailClass: 'border-slate-800 bg-[#FAFBFD]',
    htmlStructure: `
      <div class="h-full p-8 flex flex-col justify-between text-left bg-[#FAFBFD] relative font-sans select-none" style="box-sizing: border-box;">
        <div class="absolute left-0 top-0 bottom-0 w-3 bg-indigo-600"></div>
        <div class="absolute right-0 top-0 bottom-0 w-3 bg-slate-200"></div>
        
        <div class="flex justify-between items-start">
          <div class="space-y-1 pl-4">
            <div class="text-[9px] tracking-[0.25em] font-mono text-indigo-600 uppercase font-bold">VERIFIED COMPLETION</div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{{documentTitle}}</h1>
            <p class="text-[10px] text-slate-500 font-mono">PUBLISHER: {{organizationName}}</p>
          </div>
          <div class="pr-4">{{logoHtml}}</div>
        </div>

        <div class="pl-4 space-y-4 my-6">
          <div class="space-y-1">
            <div class="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Recipient Practitioner</div>
            <div class="text-2xl font-black text-slate-900">{{recipientName}}</div>
          </div>
          <div class="max-w-xl text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {{description}}
          </div>
        </div>

        <div class="pl-4 grid grid-cols-2 gap-6 items-end pt-5 border-t border-slate-100 max-w-[500px] w-full">
          <div class="space-y-1">
            <div class="h-8 flex items-end">{{sigHtml}}</div>
            <div class="pt-1">
              <div class="font-bold text-slate-900 text-xs leading-none">{{issuerName}}</div>
              <div class="text-[8px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right space-y-1 font-mono text-[9px] pr-2">
            <div><span class="text-slate-400">LEDGER ID:</span> <span class="text-indigo-600 font-bold">{{documentId}}</span></div>
            <div><span class="text-slate-400">DATE:</span> <span class="text-slate-700 font-semibold">{{issueDate}}</span></div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'cert-elegant',
    type: 'certificate',
    name: 'Elegant Emerald',
    category: 'High-end',
    description: 'A striking luxury layout designed with delicate double borders, deep emerald accents, and serif headings.',
    thumbnailClass: 'border-emerald-800 bg-[#F4F8F6]',
    htmlStructure: `
      <div class="h-full border-8 border-emerald-800/20 p-6 flex flex-col justify-between text-center bg-[#F4F8F6] relative font-serif select-none" style="box-sizing: border-box;">
        <div class="absolute inset-2 border border-emerald-800/40 pointer-events-none"></div>
        
        <div class="relative space-y-4">
          <div class="flex justify-center">
            {{logoHtml}}
          </div>
          <div class="text-[9px] tracking-[0.3em] font-mono text-emerald-800 uppercase font-bold">Credential of Distinction</div>
          <h1 class="font-serif-display text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wider uppercase font-extrabold italic">{{documentTitle}}</h1>
        </div>

        <div class="relative space-y-2 my-4">
          <div class="text-[10px] text-slate-400 uppercase tracking-widest font-sans">Awarded To</div>
          <div class="font-serif-display text-2xl sm:text-3xl font-extrabold text-emerald-900 border-b border-emerald-800/20 pb-2 max-w-[280px] mx-auto">
            {{recipientName}}
          </div>
          <div class="text-[8px] text-slate-400 font-mono tracking-widest">{{orgAddress}}</div>
        </div>

        <div class="relative px-6 md:px-12 text-center my-3 max-w-prose mx-auto">
          <p class="text-xs text-slate-600 italic leading-relaxed min-h-[60px] font-sans">
            {{description}}
          </p>
        </div>

        <div class="relative grid grid-cols-2 gap-8 items-end text-xs text-slate-500 pt-5 border-t border-emerald-800/10 max-w-[480px] mx-auto w-full">
          <div class="text-left space-y-1.5">
            <div class="h-10 flex items-end pl-2">
              {{sigHtml}}
            </div>
            <div class="border-t border-emerald-800/15 pt-0.5">
              <div class="font-serif font-bold text-emerald-900 italic text-xs leading-none">{{issuerName}}</div>
              <div class="text-[8px] text-slate-400 uppercase tracking-wider font-sans mt-0.5">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right space-y-1 font-mono text-[8px] mb-1">
            <div><span class="text-slate-400">VERIFIED CODE:</span> <span class="text-emerald-800 font-semibold">{{documentId}}</span></div>
            <div><span class="text-slate-400">DATED:</span> <span class="text-slate-700 font-semibold">{{issueDate}}</span></div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'cert-corporate',
    type: 'certificate',
    name: 'Corporate Shield',
    category: 'Enterprise',
    description: 'A clean executive layout structured with deep indigo banners, sleek geometric borders, and high corporate styling.',
    thumbnailClass: 'border-indigo-900 bg-white',
    htmlStructure: `
      <div class="h-full border-[12px] border-indigo-950 p-6 flex flex-col justify-between text-center bg-white relative font-sans select-none" style="box-sizing: border-box;">
        <div class="absolute inset-1.5 border border-indigo-900/30 pointer-events-none"></div>
        
        <div class="relative space-y-3 pt-2">
          <div class="flex justify-center mb-1">
            {{logoHtml}}
          </div>
          <div class="text-[9px] tracking-[0.2em] font-mono text-indigo-900 uppercase font-extrabold">Enterprise Certification System</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">{{documentTitle}}</h1>
          <div class="text-[10px] text-slate-500 font-mono tracking-wider font-bold">BY DIRECTIVE OF THE BOARD OF {{organizationName}}</div>
        </div>

        <div class="relative space-y-2 my-4">
          <div class="text-[11px] text-slate-400 font-medium">This document certifies the valid accomplishment of</div>
          <div class="text-2xl font-black text-indigo-950 border-b-2 border-indigo-900/10 pb-1 max-w-[340px] mx-auto">
            {{recipientName}}
          </div>
          <div class="text-[9px] text-slate-400 font-mono uppercase tracking-wide">{{orgAddress}}</div>
        </div>

        <div class="relative px-6 md:px-12 text-center my-2 max-w-prose mx-auto">
          <p class="text-xs text-slate-600 leading-relaxed font-sans min-h-[50px]">
            {{description}}
          </p>
        </div>

        <div class="relative grid grid-cols-2 gap-8 items-end text-xs text-slate-500 pt-5 border-t border-slate-100 max-w-[480px] mx-auto w-full">
          <div class="text-left space-y-1">
            <div class="h-10 flex items-end pl-2">
              {{sigHtml}}
            </div>
            <div class="border-t border-slate-200 pt-1">
              <div class="font-extrabold text-slate-900 text-xs leading-none">{{issuerName}}</div>
              <div class="text-[8px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right space-y-1 font-mono text-[9px] mb-1">
            <div><span class="text-slate-400">CREDENTIAL ID:</span> <span class="text-slate-800 font-bold">{{documentId}}</span></div>
            <div><span class="text-slate-400">SIGNED DATE:</span> <span class="text-slate-700 font-semibold">{{issueDate}}</span></div>
          </div>
        </div>
      </div>
    `
  },

  // ================= OFFER LETTERS =================
  {
    id: 'offer-professional',
    type: 'offer-letter',
    name: 'Professional Accent',
    category: 'Corporate',
    description: 'A sleek executive letterhead layout with elegant left-bordered content modules and structured tables.',
    thumbnailClass: 'border-indigo-900 bg-white',
    htmlStructure: `
      <div class="h-full flex flex-col justify-between p-6 sm:p-8 text-left bg-white text-slate-800 leading-relaxed font-sans" style="box-sizing: border-box;">
        <div class="pt-2 pb-4 flex justify-between items-start border-t-4 border-indigo-900">
          <div class="flex gap-3 items-center">
            {{logoHtml}}
            <div>
              <div class="text-xs font-extrabold uppercase tracking-tight text-indigo-900">{{organizationName}}</div>
              <div class="text-[8px] text-slate-400 max-w-[180px] truncate">{{orgAddress}}</div>
            </div>
          </div>
          <div class="text-right text-[8px] font-mono text-slate-500">
            <div>Date: {{issueDate}}</div>
            <div class="text-slate-400">HASH: {{documentId}}</div>
          </div>
        </div>

        <div class="my-2 space-y-1.5 bg-indigo-50/20 p-3 rounded-lg border border-indigo-100/30">
          <div class="text-[8px] font-mono text-indigo-600 tracking-widest font-bold">STRICTLY CONFIDENTIAL · EMPLOYMENT CONTRACT</div>
          <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
            <div><span class="text-slate-400">Candidate Name:</span> <span class="font-bold text-slate-900">{{recipientName}}</span></div>
            <div><span class="text-slate-400">Email:</span> <span class="font-semibold text-slate-800">{{candidateEmail}}</span></div>
            <div><span class="text-slate-400">Phone:</span> <span class="font-semibold text-slate-800">{{candidatePhone}}</span></div>
            <div><span class="text-slate-400">Address:</span> <span class="font-semibold text-slate-800 truncate block max-w-[150px]">{{candidateAddress}}</span></div>
          </div>
        </div>

        <div class="text-[10.5px] text-slate-600 space-y-2 max-w-prose min-h-[140px] leading-relaxed">
          <p>Dear {{recipientName}},</p>
          <p>{{description}}</p>

          <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-100 font-mono text-[9px] text-slate-600">
            <div><span class="text-slate-400">Proposed Title:</span> <span class="font-bold text-slate-800">{{jobTitle}} ({{department}})</span></div>
            <div><span class="text-slate-400">Employment Type:</span> <span class="font-bold text-slate-800">{{employmentType}}</span></div>
            <div><span class="text-slate-400">Base Salary:</span> <span class="font-bold text-slate-800">{{salary}}</span></div>
            <div><span class="text-slate-400">Start Date:</span> <span class="font-bold text-slate-800">{{startDate}}</span></div>
            <div><span class="text-slate-400">Probation Period:</span> <span class="font-bold text-slate-800">{{probationPeriod}}</span></div>
            <div><span class="text-slate-400">Work Location:</span> <span class="font-bold text-slate-800">{{workLocation}}</span></div>
          </div>

          <p class="text-[9px] italic text-slate-500 bg-stone-50/50 p-1.5 border-l-2 border-indigo-500 rounded-r">
            <span class="font-semibold not-italic text-slate-700 block text-[8px] uppercase font-mono">Custom terms:</span> {{customTerms}}
          </p>
        </div>

        <div class="border-t border-slate-100 pt-3 flex justify-between items-end text-xs text-slate-500">
          <div class="space-y-1 text-left">
            <div class="h-8 flex items-end pl-1">{{sigHtml}}</div>
            <div class="border-t border-slate-200 pt-0.5">
              <div class="font-bold text-slate-800 text-[10px]">{{issuerName}}</div>
              <div class="text-[8px] uppercase tracking-wider">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right text-[8px] font-mono text-slate-400">
            <div>Reference Verification Hash</div>
            <div class="font-bold text-indigo-600">{{documentId}}</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'offer-corporate',
    type: 'offer-letter',
    name: 'Corporate Signature',
    category: 'Enterprise',
    description: 'A highly structured corporate grid layout featuring full company watermarks, bold titles, and legal footer covenents.',
    thumbnailClass: 'border-slate-800 bg-white',
    htmlStructure: `
      <div class="h-full flex flex-col justify-between p-6 sm:p-8 text-left bg-white text-slate-800 leading-relaxed font-sans" style="box-sizing: border-box;">
        <div class="pt-2 pb-4 flex justify-between items-end border-b-2 border-slate-200">
          <div>
            <div class="text-sm font-black uppercase tracking-tight text-slate-900">{{organizationName}}</div>
            <div class="text-[8px] text-slate-400 max-w-[200px] truncate font-mono">{{orgAddress}}</div>
          </div>
          <div class="pr-2">{{logoHtml}}</div>
        </div>

        <div class="my-2 space-y-1">
          <div class="text-[8px] font-mono text-slate-400 tracking-wider font-bold">OFFICIAL MEMORANDUM OF INTENT</div>
          <div class="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1">EMPLOYMENT OFFER DECREE</div>
          <div class="grid grid-cols-2 gap-2 text-[9px] text-slate-500 pt-1">
            <div>Candidate: <span class="font-bold text-slate-800">{{recipientName}}</span></div>
            <div>Contract Ref: <span class="font-bold text-slate-800">{{documentId}}</span></div>
            <div>Published On: <span class="font-semibold text-slate-800">{{issueDate}}</span></div>
            <div>Joining On: <span class="font-semibold text-slate-800">{{startDate}}</span></div>
          </div>
        </div>

        <div class="text-[10px] text-slate-600 space-y-2.5 my-2 max-w-prose min-h-[140px] leading-relaxed">
          <p>Dear {{recipientName}},</p>
          <p>{{description}}</p>

          <table class="w-full text-left text-[9px] border-collapse bg-slate-50 rounded overflow-hidden border border-slate-200/50">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th class="px-2 py-1">Position / Office</th>
                <th class="px-2 py-1">Type / Location</th>
                <th class="px-2 py-1">Base salary</th>
              </tr>
            </thead>
            <tbody>
              <tr class="text-slate-800">
                <td class="px-2 py-1 font-bold">{{jobTitle}} ({{department}})</td>
                <td class="px-2 py-1">{{employmentType}} / {{workLocation}}</td>
                <td class="px-2 py-1 font-mono font-bold text-indigo-700">{{salary}}</td>
              </tr>
            </tbody>
          </table>

          <p class="text-[9px] text-slate-500 border-l border-indigo-600 pl-2">
            <span class="font-bold text-slate-700 block text-[8px] uppercase tracking-wider font-mono">Special clauses:</span> {{customTerms}}
          </p>
        </div>

        <div class="border-t border-slate-100 pt-3 flex justify-between items-end text-xs text-slate-500">
          <div class="space-y-1 text-left">
            <div class="h-8 flex items-end pl-1">{{sigHtml}}</div>
            <div class="border-t border-slate-150 pt-0.5">
              <div class="font-extrabold text-slate-900 text-[10px]">{{issuerName}}</div>
              <div class="text-[8px] uppercase tracking-wider font-mono">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono text-[8px] text-indigo-600 font-bold">{{documentId}}</div>
            <div class="text-[7px] text-slate-400 font-mono uppercase">Verified SECURED COVENANT</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'offer-minimal',
    type: 'offer-letter',
    name: 'Minimalist Monologue',
    category: 'Minimal',
    description: 'An ultra-clean modern corporate layout focused on pure, elegant typography and generous, comfortable margins.',
    thumbnailClass: 'border-slate-300 bg-stone-50',
    htmlStructure: `
      <div class="h-full flex flex-col justify-between p-8 text-left bg-stone-50 text-slate-800 leading-relaxed font-mono select-none" style="box-sizing: border-box;">
        
        <div class="flex justify-between items-start border-b border-slate-200 pb-3">
          <div class="space-y-0.5">
            <div class="text-[11px] font-black uppercase text-slate-900">{{organizationName}}</div>
            <div class="text-[8px] text-slate-500">{{orgAddress}}</div>
          </div>
          <div class="text-[8px] text-right text-slate-400">
            <div>DATE: {{issueDate}}</div>
            <div>VERIFY_HASH: {{documentId}}</div>
          </div>
        </div>

        <div class="my-4 text-[10px] space-y-3 font-mono leading-relaxed max-w-prose">
          <p>TO: {{recipientName}} ({{candidateEmail}})</p>
          <p>RE: OFFER LETTER FOR {{jobTitle}}</p>
          
          <p class="text-slate-600 leading-relaxed">
            {{description}}
          </p>

          <div class="space-y-1 p-2.5 bg-white border border-slate-200 rounded text-[9px] text-slate-600 font-mono">
            <div>* DIVISION: {{department}}</div>
            <div>* STATUS: {{employmentType}}</div>
            <div>* START: {{startDate}}</div>
            <div>* COMP: {{salary}}</div>
            <div>* COVENANTS: {{customTerms}}</div>
          </div>
        </div>

        <div class="flex justify-between items-end text-[9px] pt-4 border-t border-slate-200">
          <div>
            <div class="font-bold text-slate-900 text-xs">{{issuerName}}</div>
            <div class="text-[8px] uppercase tracking-wider text-slate-400">{{issuerDesignation}}</div>
          </div>
          <div class="h-8 flex items-end">
            {{sigHtml}}
          </div>
        </div>
      </div>
    `
  },

  // ================= INTERNSHIPS =================
  {
    id: 'intern-modern',
    type: 'internship-letter',
    name: 'Modern Cohort',
    category: 'Minimalist',
    description: 'A light-slate contemporary layout featuring clean metadata lists, soft rounded styles, and emerald highlights.',
    thumbnailClass: 'border-teal-700 bg-slate-50/50',
    htmlStructure: `
      <div class="h-full flex flex-col justify-between p-6 sm:p-8 text-left bg-slate-50 text-slate-800 leading-relaxed font-sans select-none" style="box-sizing: border-box;">
        <div class="pt-2 pb-4 flex justify-between items-start border-b border-slate-200">
          <div class="flex gap-2.5 items-center">
            {{logoHtml}}
            <div>
              <div class="text-xs font-extrabold text-slate-900 tracking-tight">{{organizationName}}</div>
              <div class="text-[8px] text-slate-400 max-w-[180px] truncate">{{orgAddress}}</div>
            </div>
          </div>
          <div class="text-right text-[8px] font-mono text-slate-400">
            <div>Doc ID: {{documentId}}</div>
            <div>Date: {{issueDate}}</div>
          </div>
        </div>

        <div class="my-2 text-center">
          <h3 class="text-[9px] font-mono font-bold text-teal-700 border-b border-teal-200/50 pb-1 max-w-[200px] mx-auto tracking-widest uppercase">
            COHORT COMPLETION REPORT
          </h3>
        </div>

        <div class="text-[10.5px] text-slate-600 space-y-3 my-2 max-w-prose min-h-[140px] leading-relaxed">
          <p>
            This official report confirms that student <strong>{{recipientName}}</strong>, attending <strong>{{collegeInstitution}}</strong>, successfully concluded their technical internship.
          </p>
          <p>{{description}}</p>

          <div class="bg-white p-3 rounded-lg border border-slate-200/60 font-mono text-[9px] space-y-1">
            <div class="grid grid-cols-2 gap-2 text-slate-600">
              <div><span class="text-slate-400">Role Name:</span> <span class="font-bold text-slate-800">{{internRole}} ({{department}})</span></div>
              <div><span class="text-slate-400">Compensation:</span> <span class="font-bold text-slate-800">{{internshipType}} Program</span></div>
              <div><span class="text-slate-400">Start Date:</span> <span class="font-semibold text-slate-800">{{startDate}}</span></div>
              <div><span class="text-slate-400">Completion:</span> <span class="font-semibold text-slate-800">{{endDate}}</span></div>
              <div><span class="text-slate-400">Supervisor:</span> <span class="font-semibold text-slate-800">{{issuerName}} ({{issuerDesignation}})</span></div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200/60 pt-3 flex justify-between items-end text-xs text-slate-500">
          <div class="space-y-1 text-left">
            <div class="h-8 flex items-end pl-1">{{sigHtml}}</div>
            <div class="border-t border-slate-200 pt-0.5">
              <div class="font-semibold text-slate-800 text-[10px]">{{issuerName}}</div>
              <div class="text-[8px] uppercase tracking-wider">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono text-[8px] text-teal-600 font-bold">{{documentId}}</div>
            <div class="text-[8px] text-slate-400 font-mono">Secured Platform Ledger</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'intern-academic',
    type: 'internship-letter',
    name: 'Academic Seal',
    category: 'Academic',
    description: 'Designed as a formal classic university-grade credential with elaborate letterhead borders and cursive headings.',
    thumbnailClass: 'border-stone-800 bg-[#FCFAF5]',
    htmlStructure: `
      <div class="h-full flex flex-col justify-between p-8 text-left bg-[#FCFAF5] text-stone-900 leading-relaxed font-serif select-none" style="box-sizing: border-box;">
        <div class="pt-2 pb-4 flex justify-between items-center border-b border-stone-800/20">
          <div>
            <div class="text-xs font-bold uppercase tracking-widest text-stone-800 italic">{{organizationName}}</div>
            <div class="text-[7.5px] font-mono text-stone-500 mt-0.5">{{orgAddress}}</div>
          </div>
          <div>{{logoHtml}}</div>
        </div>

        <div class="my-4 text-center">
          <div class="text-xs uppercase tracking-[0.25em] text-stone-500 font-bold">LETTER OF ACADEMIC RECOMMENDATION</div>
        </div>

        <div class="text-[10px] text-stone-700 space-y-3 font-serif max-w-prose min-h-[150px] leading-relaxed">
          <p>To Whom It May Concern,</p>
          <p>
            We formally attest that student scholar <strong>{{recipientName}}</strong> of <strong>{{collegeInstitution}}</strong> completed their rigorous operational apprenticeship.
          </p>
          <p class="italic">"{{description}}"</p>
          
          <p class="text-[9px] text-stone-500">
            During this term (from {{startDate}} to {{endDate}}), she demonstrated notable research and production contributions in the role of <strong>{{internRole}}</strong>.
          </p>
        </div>

        <div class="pt-4 border-t border-stone-800/10 flex justify-between items-end text-xs text-stone-600">
          <div class="space-y-1">
            <div class="h-8 flex items-end pl-1">{{sigHtml}}</div>
            <div class="border-t border-stone-800/20 pt-0.5">
              <div class="font-bold text-stone-900 italic text-[10px]">{{issuerName}}</div>
              <div class="text-[8px] uppercase tracking-wider font-sans">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right text-[8px] font-mono text-stone-400">
            <div>DATED: {{issueDate}}</div>
            <div>VERIFICATION: {{documentId}}</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'intern-corporate',
    type: 'internship-letter',
    name: 'Corporate Compliance',
    category: 'Corporate',
    description: 'An official executive letter layout carrying solid corporate bands, bold banners, and structured metadata cells.',
    thumbnailClass: 'border-indigo-900 bg-white',
    htmlStructure: `
      <div class="h-full flex flex-col justify-between p-6 sm:p-8 text-left bg-white text-slate-800 leading-relaxed font-sans select-none" style="box-sizing: border-box;">
        <div class="pt-2 pb-3 flex justify-between items-start border-b-2 border-indigo-900">
          <div class="flex gap-2.5 items-center">
            {{logoHtml}}
            <div>
              <div class="text-xs font-black uppercase text-indigo-950">{{organizationName}}</div>
              <div class="text-[8px] text-slate-400 max-w-[180px] truncate font-mono">{{orgAddress}}</div>
            </div>
          </div>
          <div class="text-right text-[8px] font-mono text-slate-400">
            <div>REF CODE: {{documentId}}</div>
            <div>DATE: {{issueDate}}</div>
          </div>
        </div>

        <div class="my-2 text-center">
          <h3 class="text-[9px] font-mono font-bold text-slate-700 bg-slate-100 py-1 px-3 rounded tracking-widest uppercase inline-block">
            OFFICIAL SERVICE COMPLETION REPORT
          </h3>
        </div>

        <div class="text-[10px] text-slate-600 space-y-3 my-2 max-w-prose min-h-[140px] leading-relaxed">
          <p>
            This official document confirms that student <strong>{{recipientName}}</strong> from <strong>{{collegeInstitution}}</strong> has successfully completed their prescribed internship.
          </p>
          <p>{{description}}</p>

          <table class="w-full text-left text-[9px] border-collapse bg-slate-50 border border-slate-100 rounded">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-100/50 text-slate-700 font-bold uppercase font-mono">
                <th class="px-2 py-1">Intern Role / division</th>
                <th class="px-2 py-1">Timeframe Scope</th>
                <th class="px-2 py-1">Assigned supervisor</th>
              </tr>
            </thead>
            <tbody>
              <tr class="text-slate-800">
                <td class="px-2 py-1 font-bold">{{internRole}} ({{department}})</td>
                <td class="px-2 py-1 font-mono">{{startDate}} to {{endDate}}</td>
                <td class="px-2 py-1 font-semibold">{{issuerName}} ({{issuerDesignation}})</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-slate-200 pt-3 flex justify-between items-end text-xs text-slate-500">
          <div class="space-y-1 text-left">
            <div class="h-8 flex items-end pl-1">{{sigHtml}}</div>
            <div class="border-t border-slate-200 pt-0.5">
              <div class="font-extrabold text-indigo-950 text-[10px] leading-none">{{issuerName}}</div>
              <div class="text-[8px] uppercase tracking-wider font-mono mt-0.5">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right font-mono text-[8px]">
            <div class="font-bold text-indigo-600">{{documentId}}</div>
            <div class="text-slate-400">AUTHENTICATED LEDGER STATUS</div>
          </div>
        </div>
      </div>
    `
  },

  // ================= BIRTH CERTIFICATES =================
  {
    id: 'birth-classic',
    type: 'birth-certificate' as any,
    name: 'Standard Birth Certificate Layout',
    category: 'Draft Template',
    description: 'A structured blueprint for drafting birth registration forms under legitimate, authorized corporate, legal, or reference use.',
    thumbnailClass: 'border-slate-800 bg-white',
    htmlStructure: `
      <div class="h-full border-[14px] border-slate-900 p-8 flex flex-col justify-between text-left bg-white relative font-serif select-none" style="box-sizing: border-box; background-image: radial-gradient(circle, #fcfcfc 10%, transparent 11%); background-size: 14px 14px;">
        <div class="absolute inset-1.5 border-2 border-slate-300 pointer-events-none"></div>
        
        {/* Strict legal labeling watermark */}
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-center rotate-[-30deg]">
          <div class="text-[54px] font-black tracking-widest text-slate-900 font-sans">TEMPLATE / DRAFT</div>
          <div class="text-lg font-bold text-slate-800 font-sans mt-2">NOT A GOVERNMENT-ISSUED CERTIFICATE</div>
        </div>

        {/* Top heading */}
        <div class="pt-2 pb-4 border-b-2 border-slate-900 flex justify-between items-start relative z-10">
          <div class="space-y-1">
            <div class="text-[14px] font-black uppercase text-slate-900 tracking-wider">CERTIFICATE OF BIRTH REGISTRATION</div>
            <div class="text-[8px] font-mono tracking-widest text-slate-400">ISSUING AUTHORITY: {{issuingAuthority}} ({{issuingOffice}})</div>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 border border-red-400 text-red-700 text-[8px] font-sans font-bold rounded uppercase">
              TEMPLATE / DRAFT
            </span>
          </div>
        </div>

        {/* Dynamic Parameter Grid */}
        <div class="my-4 space-y-4 relative z-10 text-xs text-slate-800">
          
          {/* Child Segment */}
          <div class="space-y-1 pb-2 border-b border-slate-200">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">I. Child Information</h3>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              <div><span class="text-slate-400 font-sans text-[10px]">Full Name:</span> <strong class="text-slate-900 text-sm italic">{{childFullName}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Gender:</span> <strong class="text-slate-800">{{childGender}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Date of Birth:</span> <strong class="text-slate-800 font-mono">{{childDob}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Time of Birth:</span> <strong class="text-slate-800 font-mono">{{childTob}}</strong></div>
              <div class="col-span-2"><span class="text-slate-400 font-sans text-[10px]">Place of Birth:</span> <strong class="text-slate-800">{{childPob}}</strong></div>
            </div>
          </div>

          {/* Parents Segment */}
          <div class="space-y-1 pb-2 border-b border-slate-200">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">II. Parental Information</h3>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              <div><span class="text-slate-400 font-sans text-[10px]">Father's Full Name:</span> <strong class="text-slate-800">{{fatherFullName}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Mother's Full Name:</span> <strong class="text-slate-800">{{motherFullName}}</strong></div>
              <div class="col-span-2"><span class="text-slate-400 font-sans text-[10px]">Parent Address:</span> <strong class="text-slate-700 text-[11px] block">{{parentAddress}}</strong></div>
            </div>
          </div>

          {/* Registration Segment */}
          <div class="space-y-1 pb-2 border-b border-slate-200">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">III. Registration Ledger Coordinates</h3>
            <div class="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div><span class="text-slate-400 font-sans block text-[8px] uppercase">Reg No. (Ref)</span> <strong class="text-indigo-900 select-all">{{documentId}}</strong></div>
              <div><span class="text-slate-400 font-sans block text-[8px] uppercase">Reg Date</span> <strong class="text-slate-800">{{registrationDate}}</strong></div>
              <div><span class="text-slate-400 font-sans block text-[8px] uppercase">Jurisdiction</span> <strong class="text-slate-800">{{district}}, {{state}}</strong></div>
            </div>
          </div>

          {/* Notes */}
          <div class="space-y-0.5">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">IV. Administrative Notes</h3>
            <p class="text-[10px] italic text-slate-500 leading-normal bg-slate-50 p-2 rounded border border-slate-100">{{notes}}</p>
          </div>
        </div>

        {/* Signatures */}
        <div class="border-t border-slate-900 pt-4 flex justify-between items-end text-xs text-slate-500 relative z-10">
          <div class="space-y-1 text-left">
            <div class="h-8 flex items-end pl-1">{{sigHtml}}</div>
            <div class="border-t border-slate-200 pt-0.5">
              <div class="font-bold text-slate-800 text-[10px]">{{issuerName}}</div>
              <div class="text-[8px] uppercase tracking-wider font-sans">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right text-[8px] font-mono text-slate-400 space-y-0.5">
            <div class="text-red-600 font-bold uppercase tracking-wide">NOT A GOVERNMENT-ISSUED DOCUMENT</div>
            <div>VERIFIABLE LEDGER HASH: <span class="font-bold text-slate-800 select-all">{{documentId}}</span></div>
          </div>
        </div>
      </div>
    `,
  },

  // ================= DEATH CERTIFICATES =================
  {
    id: 'death-classic',
    type: 'death-certificate' as any,
    name: 'Standard Death Certificate Layout',
    category: 'Draft Template',
    description: 'A structured blueprint for drafting death registration forms under legitimate, authorized corporate, legal, or reference use.',
    thumbnailClass: 'border-slate-800 bg-white',
    htmlStructure: `
      <div class="h-full border-[14px] border-slate-900 p-8 flex flex-col justify-between text-left bg-white relative font-serif select-none" style="box-sizing: border-box; background-image: radial-gradient(circle, #fcfcfc 10%, transparent 11%); background-size: 14px 14px;">
        <div class="absolute inset-1.5 border-2 border-slate-300 pointer-events-none"></div>
        
        {/* Strict legal labeling watermark */}
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-center rotate-[-30deg]">
          <div class="text-[54px] font-black tracking-widest text-slate-900 font-sans">TEMPLATE / DRAFT</div>
          <div class="text-lg font-bold text-slate-800 font-sans mt-2">NOT A GOVERNMENT-ISSUED CERTIFICATE</div>
        </div>

        {/* Top heading */}
        <div class="pt-2 pb-4 border-b-2 border-slate-900 flex justify-between items-start relative z-10">
          <div class="space-y-1">
            <div class="text-[14px] font-black uppercase text-slate-900 tracking-wider">CERTIFICATE OF DEATH REGISTRATION</div>
            <div class="text-[8px] font-mono tracking-widest text-slate-400">ISSUING AUTHORITY: {{issuingAuthority}} ({{issuingOffice}})</div>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 border border-red-400 text-red-700 text-[8px] font-sans font-bold rounded uppercase">
              TEMPLATE / DRAFT
            </span>
          </div>
        </div>

        {/* Dynamic Parameter Grid */}
        <div class="my-4 space-y-4 relative z-10 text-xs text-slate-800">
          
          {/* Deceased Segment */}
          <div class="space-y-1 pb-2 border-b border-slate-200">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">I. Deceased Person Information</h3>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              <div><span class="text-slate-400 font-sans text-[10px]">Full Name:</span> <strong class="text-slate-900 text-sm italic">{{deceasedFullName}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Gender / Age:</span> <strong class="text-slate-800">{{deceasedGender}} / {{deceasedAge}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Date of Death:</span> <strong class="text-slate-800 font-mono">{{deceasedDod}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Time of Death:</span> <strong class="text-slate-800 font-mono">{{deceasedTod}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Date of Birth:</span> <strong class="text-slate-800 font-mono">{{deceasedDob}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Place of Death:</span> <strong class="text-slate-800">{{deceasedPod}}</strong></div>
            </div>
          </div>

          {/* Family Segment */}
          <div class="space-y-1 pb-2 border-b border-slate-200">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">II. Immediate Family Contact</h3>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              <div><span class="text-slate-400 font-sans text-[10px]">Father's Name:</span> <strong class="text-slate-800">{{fatherName}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Mother's Name:</span> <strong class="text-slate-800">{{motherName}}</strong></div>
              <div><span class="text-slate-400 font-sans text-[10px]">Spouse Name:</span> <strong class="text-slate-800">{{spouseName}}</strong></div>
              <div class="col-span-2"><span class="text-slate-400 font-sans text-[10px]">Address:</span> <strong class="text-slate-700 text-[11px] block">{{familyAddress}}</strong></div>
            </div>
          </div>

          {/* Registration Segment */}
          <div class="space-y-1 pb-2 border-b border-slate-200">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">III. Registration Ledger Coordinates</h3>
            <div class="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div><span class="text-slate-400 font-sans block text-[8px] uppercase">Reg No. (Ref)</span> <strong class="text-indigo-900 select-all">{{documentId}}</strong></div>
              <div><span class="text-slate-400 font-sans block text-[8px] uppercase">Reg Date</span> <strong class="text-slate-800">{{registrationDate}}</strong></div>
              <div><span class="text-slate-400 font-sans block text-[8px] uppercase">Jurisdiction</span> <strong class="text-slate-800">{{district}}, {{state}}</strong></div>
            </div>
          </div>

          {/* Cause of Death */}
          <div class="space-y-0.5">
            <h3 class="text-[9px] font-sans font-bold text-slate-400 tracking-wider uppercase">IV. Cause of Death (If supplied)</h3>
            <p class="text-[10px] font-bold text-slate-800 leading-normal bg-slate-50 p-2 rounded border border-slate-100">{{causeOfDeath}}</p>
          </div>
        </div>

        {/* Signatures */}
        <div class="border-t border-slate-900 pt-4 flex justify-between items-end text-xs text-slate-500 relative z-10">
          <div class="space-y-1 text-left">
            <div class="h-8 flex items-end pl-1">{{sigHtml}}</div>
            <div class="border-t border-slate-200 pt-0.5">
              <div class="font-bold text-slate-800 text-[10px]">{{issuerName}}</div>
              <div class="text-[8px] uppercase tracking-wider font-sans">{{issuerDesignation}}</div>
            </div>
          </div>
          <div class="text-right text-[8px] font-mono text-slate-400 space-y-0.5">
            <div class="text-red-600 font-bold uppercase tracking-wide">NOT A GOVERNMENT-ISSUED DOCUMENT</div>
            <div>VERIFIABLE LEDGER HASH: <span class="font-bold text-slate-800 select-all">{{documentId}}</span></div>
          </div>
        </div>
      </div>
    `,
  }
];
