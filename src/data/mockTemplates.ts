export interface DocumentTemplate {
  id: string;
  type: 'certificate' | 'offer-letter' | 'internship-letter';
  title: string;
  description: string;
  category: string;
  difficulty?: string;
  presetData: Record<string, any>;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'cert-exec-01',
    type: 'certificate',
    title: 'Executive AI Engineering Certificate',
    category: 'Engineering',
    description: 'An elite academic-style layout designed for elite computer science and artificial intelligence completions.',
    presetData: {
      docTitle: 'Certificate of Excellence',
      recipientName: 'Sarah Jenkins',
      organization: 'DocuAI Advanced Labs',
      issueDate: '2026-10-15',
      body: 'For outstanding completion of the Advanced Large Language Model Optimization and Distributed Training curriculum. Sarah demonstrated exceptional mastery in prompt mechanics, parameter-efficient fine-tuning, and low-latency system deployments.',
      signatoryName: 'Dr. Arthur Vance',
      signatoryTitle: 'Head of AI Research',
      theme: 'emerald'
    }
  },
  {
    id: 'cert-modern-02',
    type: 'certificate',
    title: 'Modern Product Design Mastery',
    category: 'Design',
    description: 'A striking minimalist certificate format with clean contemporary borders and typographic hierarchy.',
    presetData: {
      docTitle: 'Certificate of Mastery',
      recipientName: 'Marcus Thorne',
      organization: 'Interactive Design Guild',
      issueDate: '2026-09-28',
      body: 'Having successfully mastered human-centric UX frameworks, high-fidelity responsive layout systems, and advanced interaction latency mitigation protocols through intensive laboratory workshops.',
      signatoryName: 'Elena Rostova',
      signatoryTitle: 'Lead Experience Architect',
      theme: 'gold'
    }
  },
  {
    id: 'offer-corp-01',
    type: 'offer-letter',
    title: 'Senior Solutions Architect Offer',
    category: 'Corporate',
    description: 'A formal B2B letterhead optimized for senior technical, product, and leadership hire commitments.',
    presetData: {
      recipientName: 'David Vance',
      jobTitle: 'Senior Solutions Architect',
      organization: 'Prism Technologies Inc.',
      salary: '$185,000 USD',
      startDate: '2026-11-01',
      expirationDate: '2026-10-10',
      signingBonus: '$15,000 USD',
      workLocation: 'Remote (Hybrid NYC)',
      body: 'We are thrilled to offer you the position of Senior Solutions Architect at Prism Technologies. In this role, you will lead our cloud orchestration strategy and coordinate the migration of our high-volume real-time transactional database systems. Your expertise represents an invaluable addition to our scaling engineering division.',
      signatoryName: 'Katherine Pierce',
      signatoryTitle: 'VP of People Operations',
      theme: 'corporate'
    }
  },
  {
    id: 'offer-start-02',
    type: 'offer-letter',
    title: 'Lead Growth Hacker Offer',
    category: 'Marketing',
    description: 'A sleek, forward-thinking layout for fast-paced growth marketing and startup team extensions.',
    presetData: {
      recipientName: 'Chloe Bennett',
      jobTitle: 'Lead Growth Marketer',
      organization: 'Vortex Labs',
      salary: '$135,000 USD',
      startDate: '2026-10-20',
      expirationDate: '2026-10-08',
      signingBonus: 'N/A',
      workLocation: 'San Francisco, CA',
      body: 'Vortex Labs is extending this formal offer for you to lead our customer acquisition efforts. You will design, build, and optimize our performance marketing budgets and viral acquisition loops. We are incredibly impressed by your track record in scaling early stage customer metrics by 400% in six months.',
      signatoryName: 'Julian Rivers',
      signatoryTitle: 'Co-Founder & CEO',
      theme: 'creative'
    }
  },
  {
    id: 'intern-dev-01',
    type: 'internship-letter',
    title: 'Frontend Engineering Internship',
    category: 'Engineering',
    description: 'A legitimate academic-grade internship letter celebrating active contributions to React ecosystems.',
    presetData: {
      recipientName: 'Alexander Wu',
      internRole: 'Frontend Engineering Intern',
      organization: 'DocuAI Advanced Labs',
      startDate: '2026-06-01',
      endDate: '2026-09-01',
      body: 'During Alexander\'s tenure, he made substantial contributions to our core UI/UX responsive dashboard assemblies. He successfully constructed three production-grade components, eliminated nine severe latency bottlenecks, and exhibited superb technical collaboration skills within our Agile squad.',
      signatoryName: 'Nadia Petrova',
      signatoryTitle: 'Director of Frontend Engineering',
      theme: 'corporate'
    }
  },
  {
    id: 'intern-pm-02',
    type: 'internship-letter',
    title: 'Associate Product Management Letter',
    category: 'Management',
    description: 'An elegant letter layout focused on roadmap delivery, cohort analysis, and product launch help.',
    presetData: {
      recipientName: 'Sophia Patel',
      internRole: 'Associate Product Intern',
      organization: 'Apex Industrial',
      startDate: '2026-05-15',
      endDate: '2026-08-15',
      body: 'Sophia served as an invaluable associate in our primary SaaS scheduling division. She conducted extensive cohort retention analysis across 1,400 active client streams, authored product requirement documents for two high-priority telemetry trackers, and effectively coordinated sprint routines.',
      signatoryName: 'Marcus Vance',
      signatoryTitle: 'Head of Global Products',
      theme: 'classic'
    }
  }
];

export const THEMES = {
  certificate: [
    { id: 'gold', name: 'Royal Gold', primary: 'border-amber-500 text-amber-600', bg: 'bg-[#FAF8F5]', border: 'border-4 border-double border-amber-600/40' },
    { id: 'emerald', name: 'Modern Emerald', primary: 'border-emerald-700 text-emerald-800', bg: 'bg-[#F4F8F6]', border: 'border-4 border-double border-emerald-800/40' },
    { id: 'onyx', name: 'Classic Onyx', primary: 'border-slate-800 text-slate-900', bg: 'bg-[#F9F9FB]', border: 'border-4 border-double border-slate-900/40' }
  ],
  letter: [
    { id: 'corporate', name: 'Executive Corporate', primary: 'text-indigo-900', bg: 'bg-white', headerBorder: 'border-t-4 border-indigo-900' },
    { id: 'creative', name: 'Creative Tech', primary: 'text-rose-950', bg: 'bg-stone-50', headerBorder: 'border-t-4 border-rose-600' },
    { id: 'classic', name: 'Legal Ivory', primary: 'text-stone-900', bg: 'bg-[#FAF9F5]', headerBorder: 'border-t-4 border-stone-800' }
  ]
};
