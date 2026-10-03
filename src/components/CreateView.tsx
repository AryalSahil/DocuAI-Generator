import React, { useState, useEffect } from 'react';
import { Award, FileText, FileSpreadsheet, ArrowLeft, ArrowRight, Sparkles, Printer, Download, Check, RefreshCw, Share2, Upload, Trash2, AlertCircle, Layout, ShieldCheck, CheckCircle2, RotateCcw, ZoomIn, ZoomOut, AlignLeft, AlignCenter, AlignRight, FileDown } from 'lucide-react';
import { THEMES, DOCUMENT_TEMPLATES } from '../data/mockTemplates';
import { TEMPLATE_REGISTRY, renderTemplate } from '../data/templateRegistry';
import { generatePdf } from '../lib/pdf';
import { generateDocx } from '../lib/docx';

interface CreateViewProps {
  onNavigate: (path: string, state?: any) => void;
  initialPresetId?: string;
  initialType?: 'certificate' | 'offer-letter' | 'internship-letter';
}

export default function CreateView({ onNavigate, initialPresetId, initialType }: CreateViewProps) {
  // Document Type Selection State (Step 1)
  const [selectedType, setSelectedType] = useState<'certificate' | 'offer-letter' | 'internship-letter' | null>(
    initialType || null
  );

  // Workflow Steps:
  // 2: Parameter Form Configuration
  // 3: Template Layout Selection
  // 4: AI Content Engine
  // 5: Final Stylist Preview & Lock
  const [currentStep, setCurrentStep] = useState<2 | 3 | 4 | 5>(2);

  // Styling & Custom Sizing Settings (Fonts, Size, Spacing, Margins, Logo, Signature Alignments)
  const [styling, setStyling] = useState({
    fontFamily: 'Plus Jakarta Sans', // 'Plus Jakarta Sans' | 'Playfair Display' | 'Cinzel' | 'Montserrat' | 'EB Garamond'
    fontSize: 14,
    lineHeight: 1.6,
    paragraphSpacing: 12,
    margins: 32,
    logoSize: 40,
    logoAlign: 'center',
    sigSize: 40,
    sigAlign: 'center',
  });

  const [zoomLevel, setZoomLevel] = useState(100);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [originalBody, setOriginalBody] = useState('');

  // Selected Template layout ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Core Form Input States
  const [formData, setFormData] = useState({
    // Shared / Core
    organization: 'DocuAI Advanced Labs Inc.',
    recipientName: 'Sarah Jenkins',
    issueDate: new Date().toISOString().split('T')[0],
    body: 'For extraordinary mastery and dedication demonstrated during the distributed computing fine-tuning curriculum.',
    signatoryName: 'Dr. Arthur Vance',
    signatoryTitle: 'Head of Operations',
    orgAddress: '100 Silicon Boulevard, Suite 500, Tech City, TC 94025',
    theme: 'gold', // Certificates: gold, emerald, onyx. Letters: corporate, creative, classic.

    // Certificate Specific
    docTitle: 'Certificate of Excellence',
    certificateId: 'CERT-2026-9A82',
    additionalDesc: 'Recognizing stellar compliance to prompt engineering optimization rules.',

    // Offer Letter Specific - Candidate
    candidateEmail: 'jenkins.s@gmail.com',
    candidatePhone: '+1 (555) 902-1823',
    candidateAddress: '42 Broadway Street, Apartment 4B, New York, NY 10004',

    // Offer Letter Specific - Employment
    jobTitle: 'Senior Solutions Architect',
    department: 'Engineering Division',
    employmentType: 'Full-time', // Full-time, Part-time, Contract, Internship, Temporary
    joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    workLocation: 'Remote (US/Canada)',
    salary: '$185,000 USD Annual Base',
    probationPeriod: '3 Months',

    // Offer Letter Specific - Additional
    customTerms: 'This offer is subject to a standard background verification protocol.',
    additionalNotes: 'Standard healthcare, dental benefits, and equity options are provided as defined in company bylaws.',

    // Internship Letter Specific - Student
    collegeInstitution: 'Massachusetts Institute of Technology',
    internRole: 'Frontend Developer Intern',
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    internshipType: 'Paid', // Paid or Unpaid

    // Internship Letter Specific - Additional
    additionalNotesIntern: 'A certificate of excellence was also conferred upon completion.',

    // File Upload Base64 Data URL States
    logoFile: '', 
    sigFile: '',  
  });

  // Prompt helper for simulated AI generation
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiProgressText, setAiProgressText] = useState('');
  const [aiProgressValue, setAiProgressValue] = useState(0);

  // Validation Error States
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  // Export States
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  // Dynamic Cryptographic Verification Code Calculator
  const [verificationCode, setVerificationCode] = useState('');

  // Supabase Persistence Success State
  const [lastCreatedDoc, setLastCreatedDoc] = useState<any>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // Dynamic Database-Driven Templates & Doc Types
  const [dynamicTemplates, setDynamicTemplates] = useState<any[]>([]);
  const [dynamicDocTypes, setDynamicDocTypes] = useState<any[]>([]);

  useEffect(() => {
    // Fetch active document types
    fetch('/api/document-types')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setDynamicDocTypes(data.filter((dt: any) => dt.active));
        }
      })
      .catch(e => console.warn('Could not load dynamic document types, falling back to mock presets', e));

    // Fetch active layout templates
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const parsed = data.filter((t: any) => t.active).map((t: any) => ({
            id: t.id,
            type: t.document_type_id,
            name: t.name,
            description: t.description,
            thumbnailClass: t.preview_image || 'border-slate-200 bg-white',
            htmlStructure: t.template_config?.htmlStructure || '',
            category: t.template_config?.category || 'Standard'
          }));
          setDynamicTemplates(parsed);
        }
      })
      .catch(e => console.warn('Could not load dynamic layout templates, falling back to mock presets', e));
  }, []);

  // 1. Auto-save to LocalStorage to retain form data across refreshes / sessions
  useEffect(() => {
    const savedData = localStorage.getItem('docuai_form_inputs_v2');
    if (savedData) {
      try {
        setFormData(prev => ({
          ...prev,
          ...JSON.parse(savedData)
        }));
      } catch (e) {
        console.error('Failed to parse saved local storage credentials', e);
      }
    }
    const savedTemplateId = localStorage.getItem('docuai_selected_template');
    if (savedTemplateId) {
      setSelectedTemplateId(savedTemplateId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('docuai_form_inputs_v2', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (selectedTemplateId) {
      localStorage.setItem('docuai_selected_template', selectedTemplateId);
    }
  }, [selectedTemplateId]);

  // Set Default Template Layout based on chosen type
  useEffect(() => {
    if (selectedType) {
      if (selectedType === 'certificate') {
        setSelectedTemplateId('cert-classic');
      } else if (selectedType === 'offer-letter') {
        setSelectedTemplateId('offer-professional');
      } else {
        setSelectedTemplateId('intern-modern');
      }
    }
  }, [selectedType]);

  // 2. Sync SelectedType with initialPresetId or initialType from routing state
  useEffect(() => {
    if (initialPresetId) {
      const preset = DOCUMENT_TEMPLATES.find(t => t.id === initialPresetId);
      if (preset) {
        setSelectedType(preset.type);
        setFormData(prev => ({
          ...prev,
          ...preset.presetData,
          theme: preset.presetData.theme || (preset.type === 'certificate' ? 'gold' : 'corporate')
        }));
        // Pre-fill the AI writing prompts nicely
        if (preset.type === 'certificate') {
          setAiPrompt('high achievement in software orchestration, parameter fine-tuning, system safety');
        } else if (preset.type === 'offer-letter') {
          setAiPrompt('outstanding algorithmic skills, scaling performance marketing metrics');
        } else {
          setAiPrompt('outstanding visual design contribution, responsive app screens, high collaboration');
        }
        setCurrentStep(2);
      }
    } else if (initialType) {
      setSelectedType(initialType);
      setCurrentStep(2);
    }
  }, [initialPresetId, initialType]);

  // 3. Synchronize routing URL bar with the creation type state
  useEffect(() => {
    if (selectedType) {
      const targetPath = `/create/${selectedType}`;
      if (window.location.pathname !== targetPath) {
        onNavigate(targetPath);
      }
    } else {
      if (window.location.pathname !== '/create') {
        onNavigate('/create');
      }
    }
  }, [selectedType]);

  // 4. Real-time custom SHA calculation on recipient, org, date configuration change
  useEffect(() => {
    const textToHash = `${formData.recipientName}-${formData.organization}-${formData.issueDate}-${selectedType}`;
    let hash = 0;
    for (let i = 0; i < textToHash.length; i++) {
      hash = (hash << 5) - hash + textToHash.charCodeAt(i);
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const docPrefix = selectedType === 'certificate' ? 'CRT' : selectedType === 'offer-letter' ? 'OFR' : 'INT';
    setVerificationCode(`DOC-${docPrefix}-${hex.substring(0, 4)}-${hex.substring(4, 8)}`);
  }, [formData.recipientName, formData.organization, formData.issueDate, selectedType]);

  // Standard Form Input Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error as they type
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Base64 File Uploader with JPG/PNG type and 2MB size validations
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logoFile' | 'sigFile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileErrors(prev => ({ ...prev, [fieldName]: '' }));

    // File Type Validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setFileErrors(prev => ({
        ...prev,
        [fieldName]: 'Invalid format. Only PNG, JPG, and JPEG files are supported.'
      }));
      return;
    }

    // Size check (Max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setFileErrors(prev => ({
        ...prev,
        [fieldName]: 'File too large. Maximum size allowed is 2MB.'
      }));
      return;
    }

    // Convert file to Base64 to store in local state
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: reader.result as string
      }));
    };
    reader.onerror = () => {
      setFileErrors(prev => ({
        ...prev,
        [fieldName]: 'Failed to parse file. Please upload a clear image.'
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove File Upload state helper
  const handleRemoveFile = (fieldName: 'logoFile' | 'sigFile') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: ''
    }));
    setFileErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  // Real Server-Side AI Content Generator
  const handleAiGeneration = async (action: 'generate' | 'regenerate' | 'professional' | 'concise') => {
    if (isAiGenerating) return;

    setIsAiGenerating(true);
    setAiProgressValue(15);
    setAiProgressText('Preparing your content...');

    const progressTimer = setTimeout(() => {
      setAiProgressValue(55);
      setAiProgressText('AI is refining your document...');
    }, 1000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: selectedType,
          action,
          formData,
          currentText: formData.body,
          userPrompt: aiPrompt
        })
      });

      clearTimeout(progressTimer);

      if (!response.ok) {
        throw new Error('AI engine returned a synthesis error.');
      }

      const data = await response.json();
      
      setAiProgressValue(100);
      setAiProgressText('Content ready.');

      if (data.text) {
        setFormData(prev => ({
          ...prev,
          body: data.text
        }));
      }

      setTimeout(() => {
        setIsAiGenerating(false);
        setAiProgressValue(0);
      }, 1500);

    } catch (e: any) {
      clearTimeout(progressTimer);
      console.error(e);
      setAiProgressText('Synthesis error. Using local layout fallback...');
      setAiProgressValue(100);

      // Graceful local fallback simulation so that the client experience never breaks
      let mockProse = '';
      if (selectedType === 'certificate') {
        mockProse = `This certificate of excellence is proudly presented to ${formData.recipientName} in recognition of outstanding completion of the curriculum at ${formData.organization}. Having demonstrated exceptional capability and commitment to operations, they are formally awarded this credential on ${formData.issueDate}.`;
      } else if (selectedType === 'offer-letter') {
        mockProse = `We are delighted to extend this formal offer of employment to join our team at ${formData.organization} in the role of ${formData.jobTitle} starting on ${formData.joiningDate}. You will receive a base salary of ${formData.salary} and your focus on performance and quality makes you a tremendous addition to our team.`;
      } else {
        mockProse = `This letter attests that student ${formData.recipientName} of ${formData.collegeInstitution} successfully completed their technical internship role as ${formData.internRole} at ${formData.organization} under the supervision of ${formData.signatoryName}. During the program from ${formData.issueDate} to ${formData.endDate}, they exhibited superb capability.`;
      }

      setFormData(prev => ({ ...prev, body: mockProse }));
      
      setTimeout(() => {
        setIsAiGenerating(false);
        setAiProgressValue(0);
      }, 1500);
    }
  };

  // Form Submission Validation
  const validateAndContinue = () => {
    const errors: Record<string, string> = {};

    // 1. Common required fields
    if (!formData.organization.trim()) errors.organization = 'Organization Name is required';
    if (!formData.recipientName.trim()) errors.recipientName = 'Recipient Full Name is required';
    if (!formData.issueDate) errors.issueDate = 'Issue date is required';
    if (!formData.signatoryName.trim()) errors.signatoryName = 'Signer/Supervisor Name is required';
    if (!formData.signatoryTitle.trim()) errors.signatoryTitle = 'Signer Designation/Title is required';

    // 2. Certificate specific validation
    if (selectedType === 'certificate') {
      if (!formData.docTitle.trim()) errors.docTitle = 'Certificate Title is required';
      if (!formData.body.trim()) errors.body = 'Achievement/Purpose is required';
      if (!formData.orgAddress.trim()) errors.orgAddress = 'Organization Address is required';
      if (!formData.certificateId.trim()) errors.certificateId = 'Certificate ID is required';
    }

    // 3. Offer letter specific validation
    if (selectedType === 'offer-letter') {
      // Candidate
      if (!formData.candidateEmail.trim()) {
        errors.candidateEmail = 'Candidate Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.candidateEmail)) {
        errors.candidateEmail = 'Please provide a valid email format';
      }

      if (!formData.candidatePhone.trim()) {
        errors.candidatePhone = 'Candidate Phone is required';
      } else if (formData.candidatePhone.replace(/\D/g, '').length < 7) {
        errors.candidatePhone = 'Please enter a valid phone number (min 7 digits)';
      }

      if (!formData.candidateAddress.trim()) errors.candidateAddress = 'Candidate Address is required';

      // Employment
      if (!formData.jobTitle.trim()) errors.jobTitle = 'Job Title is required';
      if (!formData.department.trim()) errors.department = 'Department is required';
      if (!formData.employmentType.trim()) errors.employmentType = 'Employment Type is required';
      if (!formData.joiningDate) errors.joiningDate = 'Joining Date is required';
      if (!formData.workLocation.trim()) errors.workLocation = 'Work Location is required';
      if (!formData.salary.trim()) errors.salary = 'Compensation/Salary is required';
      if (!formData.probationPeriod.trim()) errors.probationPeriod = 'Probation Period description is required';
      if (!formData.orgAddress.trim()) errors.orgAddress = 'Company Address is required';
    }

    // 4. Internship letter specific validation
    if (selectedType === 'internship-letter') {
      // Student
      if (!formData.candidateEmail.trim()) {
        errors.candidateEmail = 'Student Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.candidateEmail)) {
        errors.candidateEmail = 'Please provide a valid email format';
      }

      if (!formData.candidatePhone.trim()) {
        errors.candidatePhone = 'Student Phone is required';
      } else if (formData.candidatePhone.replace(/\D/g, '').length < 7) {
        errors.candidatePhone = 'Please enter a valid phone number';
      }

      if (!formData.collegeInstitution.trim()) errors.collegeInstitution = 'College/Institution is required';

      // Internship
      if (!formData.internRole.trim()) errors.internRole = 'Internship Role is required';
      if (!formData.department.trim()) errors.department = 'Department is required';
      if (!formData.internshipType.trim()) errors.internshipType = 'Internship Type is required';
      if (!formData.issueDate) errors.issueDate = 'Start Date is required';
      if (!formData.endDate) {
        errors.endDate = 'End Date is required';
      } else if (new Date(formData.issueDate) >= new Date(formData.endDate)) {
        errors.endDate = 'Completion Date must be after Start Date';
      }

      if (!formData.workLocation.trim()) errors.workLocation = 'Work Location is required';
      if (!formData.orgAddress.trim()) errors.orgAddress = 'Organization Address is required';
      if (!formData.certificateId.trim()) errors.certificateId = 'Document/Letter ID is required';
      if (!formData.body.trim()) errors.body = 'Internship Description / Achievements are required';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setCurrentStep(3); // Form is Validated -> GO TO STEP 3 Template selection!
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    } else {
      const firstErrKey = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Securing / Export triggers
  const handlePrint = () => {
    window.print();
  };

  const handleSimulatedDownload = () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportComplete(false);

    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify({ ...formData, selectedTemplateId, verificationCode, docType: selectedType, timestamp: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `${selectedType || 'document'}-${formData.recipientName.toLowerCase().replace(/\s+/g, '-')}-secured.docuai`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setTimeout(() => setExportComplete(false), 4000);
    }, 2500);
  };

  const handleCopyLink = () => {
    const mockUrl = `${window.location.origin}/verify?id=${verificationCode}`;
    navigator.clipboard.writeText(mockUrl);
    setCopyLinkSuccess(true);
    setTimeout(() => setCopyLinkSuccess(false), 2000);
  };

  // --- Step 1: selection category list view ---
  if (!selectedType) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
        {/* Progress Tracker */}
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <span className="text-indigo-600 font-extrabold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">1</span>
              Selection
            </span>
            <span className="h-0.5 bg-slate-200 flex-grow mx-2"></span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">2</span>
              Form Parameters
            </span>
            <span className="h-0.5 bg-slate-200 flex-grow mx-2"></span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">3</span>
              Select Template
            </span>
            <span className="h-0.5 bg-slate-200 flex-grow mx-2"></span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">4</span>
              Preview & Lock
            </span>
          </div>
        </div>

        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight animate-fade-in">
            Document Category Selection
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-wrap-balance">
            Please choose the credential standard you wish to compile. This will load the custom, public validated param fields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          {/* Card 1: Certificate */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 flex flex-col justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Certificate</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Award certificates of merit, compliance, course completions, or honorariums with royal double borders, custom insignia, and formal alignment.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedType('certificate');
                setCurrentStep(2);
              }}
              className="mt-8 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Configure Parameters
            </button>
          </div>

          {/* Card 2: Offer Letter */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 flex flex-col justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Offer Letter</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Formulate robust corporate employment contracts and job offers. Set salary values, start dates, and let the AI compose detailed duties.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedType('offer-letter');
                setCurrentStep(2);
              }}
              className="mt-8 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Configure Parameters
            </button>
          </div>

          {/* Card 3: Internship Letter */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 flex flex-col justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Internship Letter</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Compose verified program completion certificates. Record internship duration, active contributions, project highlights, and manager remarks.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedType('internship-letter');
                setCurrentStep(2);
              }}
              className="mt-8 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
            >
              Configure Parameters
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 2: Form parameter configuration view ---
  if (currentStep === 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Navigation Step Tracker Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-6">
          <button
            onClick={() => setSelectedType(null)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="mr-1.5 w-4 h-4" />
            Change Document Category
          </button>

          <div className="w-full sm:w-auto">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400 gap-2">
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Select
              </span>
              <span className="h-0.5 bg-indigo-200 w-6"></span>
              <span className="text-indigo-600 font-extrabold flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px]">2</span>
                Form Details
              </span>
              <span className="h-0.5 bg-slate-200 w-6"></span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">3</span>
                Layout
              </span>
              <span className="h-0.5 bg-slate-200 w-6"></span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">4</span>
                Preview
              </span>
            </div>
          </div>
        </div>

        {/* Global validation error box */}
        {Object.keys(formErrors).length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider font-mono">Parameters Validation Incomplete</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Please review the highlighted input fields. Some required values are missing or have incorrect formats.
              </p>
            </div>
          </div>
        )}

        {/* Form panel */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">SECURE SYSTEM PARAMS</span>
              <h2 className="text-lg font-bold text-slate-900 capitalize">
                {selectedType.replace('-', ' ')} Configuration Blueprint
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-100">
              LEDGER LOCKED
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* === FORM 1: CERTIFICATE FORM === */}
            {selectedType === 'certificate' && (
              <div className="space-y-8">
                {/* Section A: Issuer & Org details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    A. Administrative Issuer Parameters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Organization Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.organization ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.organization && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.organization}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Organization Address <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="orgAddress"
                        value={formData.orgAddress}
                        onChange={handleInputChange}
                        placeholder="e.g. 100 Silicon Boulevard, Tech City, TC 94025"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.orgAddress ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.orgAddress && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.orgAddress}</p>}
                    </div>
                  </div>
                </div>

                {/* Section B: Recipient & Credential Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    B. Recipient Credential Parameters
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Recipient Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.recipientName ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.recipientName && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.recipientName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Certificate Title <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="docTitle"
                        value={formData.docTitle}
                        onChange={handleInputChange}
                        placeholder="e.g. Certificate of Achievement"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.docTitle ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.docTitle && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.docTitle}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Issue Date <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.issueDate ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.issueDate && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.issueDate}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Certificate Reference ID <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="certificateId"
                        value={formData.certificateId}
                        onChange={handleInputChange}
                        placeholder="e.g. CERT-2026-9A82"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.certificateId ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.certificateId && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.certificateId}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Additional Description <span className="text-slate-400">(Optional)</span></label>
                      <input
                        type="text"
                        name="additionalDesc"
                        value={formData.additionalDesc}
                        onChange={handleInputChange}
                        placeholder="e.g. Recognizing stellar prompt achievements"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Achievement / Purpose Text <span className="text-rose-500">*</span></label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      placeholder="Specify program curriculum, milestones, and mastery accomplishments details..."
                      rows={3}
                      className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                        formErrors.body ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.body && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.body}</p>}
                  </div>
                </div>

                {/* Section C: Signatory Authorized details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    C. Authorized Signatory Parameters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Signatory / Issuer Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="signatoryName"
                        value={formData.signatoryName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.signatoryName ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.signatoryName && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.signatoryName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Signatory Title / Designation <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="signatoryTitle"
                        value={formData.signatoryTitle}
                        onChange={handleInputChange}
                        placeholder="e.g. Managing Director / Founder & CEO"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.signatoryTitle ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.signatoryTitle && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.signatoryTitle}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* === FORM 2: OFFER LETTER FORM === */}
            {selectedType === 'offer-letter' && (
              <div className="space-y-8">
                
                {/* Section A: Candidate Parameters */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    A. Candidate Parameters
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Candidate Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.recipientName ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.recipientName && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.recipientName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Candidate Email Address <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        name="candidateEmail"
                        value={formData.candidateEmail}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.candidateEmail ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.candidateEmail && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.candidateEmail}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Candidate Phone Number <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="candidatePhone"
                        value={formData.candidatePhone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.candidatePhone ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.candidatePhone && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.candidatePhone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Candidate Residential Address <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      name="candidateAddress"
                      value={formData.candidateAddress}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                        formErrors.candidateAddress ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.candidateAddress && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.candidateAddress}</p>}
                  </div>
                </div>

                {/* Section B: Employment Terms */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    B. Employment Parameters
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Job Title <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.jobTitle ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.jobTitle && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.jobTitle}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Department / Team <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.department ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.department && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.department}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Employment Type <span className="text-rose-500">*</span></label>
                      <select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Joining Date <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.joiningDate ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.joiningDate && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.joiningDate}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Work Location <span className="text-rose-500">*</span></label>
                      <select
                        name="workLocation"
                        value={formData.workLocation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                      >
                        <option value="Remote (US/Canada)">Remote</option>
                        <option value="On-site Office">On-site</option>
                        <option value="Hybrid Office Layout">Hybrid</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Compensation / Salary <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="e.g. $145,000 USD Annual Base"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.salary ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.salary && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.salary}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Probation Period <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="probationPeriod"
                        value={formData.probationPeriod}
                        onChange={handleInputChange}
                        placeholder="e.g. 3 Months / None"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.probationPeriod ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.probationPeriod && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.probationPeriod}</p>}
                    </div>
                  </div>
                </div>

                {/* Section C: Issuer Parameters */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    C. Issuer & Company Parameters
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Company Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.organization ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.organization && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.organization}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Company Registered Address <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="orgAddress"
                        value={formData.orgAddress}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.orgAddress ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.orgAddress && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.orgAddress}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">HR/Issuer Signatory Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="signatoryName"
                        value={formData.signatoryName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.signatoryName ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.signatoryName && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.signatoryName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Issuer Title / Designation <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="signatoryTitle"
                        value={formData.signatoryTitle}
                        onChange={handleInputChange}
                        placeholder="e.g. VP of People Operations"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.signatoryTitle ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.signatoryTitle && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.signatoryTitle}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Offer Letter Issue Date <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.issueDate ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.issueDate && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.issueDate}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Hiring Background / Introduction Statement <span className="text-rose-500">*</span></label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      placeholder="e.g. We are thrilled to offer you employment at DocuAI Labs. In this role..."
                      rows={3}
                      className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                        formErrors.body ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.body && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.body}</p>}
                  </div>
                </div>

                {/* Section D: Additional Terms */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    D. Additional Terms & Notes
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Custom Offer Terms <span className="text-slate-400">(Optional)</span></label>
                      <textarea
                        name="customTerms"
                        value={formData.customTerms}
                        onChange={handleInputChange}
                        placeholder="e.g. This offer is contingent upon clear background review covenents..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Additional Notes / Perks <span className="text-slate-400">(Optional)</span></label>
                      <textarea
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                        placeholder="e.g. Medical coverage and remote computer budget matches are listed in Annex B..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* === FORM 3: INTERNSHIP LETTER FORM === */}
            {selectedType === 'internship-letter' && (
              <div className="space-y-8">
                
                {/* Section A: Student Parameters */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    A. Student Parameters
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Student Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.recipientName ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.recipientName && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.recipientName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Student Email <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        name="candidateEmail"
                        value={formData.candidateEmail}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.candidateEmail ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.candidateEmail && <p className="text-rose-500 text-[10px] font-semibold">{formData.candidateEmail}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Student Phone <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="candidatePhone"
                        value={formData.candidatePhone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.candidatePhone ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.candidatePhone && <p className="text-rose-500 text-[10px] font-semibold">{formData.candidatePhone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">College / Academic Institution <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      name="collegeInstitution"
                      value={formData.collegeInstitution}
                      onChange={handleInputChange}
                      placeholder="e.g. Massachusetts Institute of Technology"
                      className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                        formErrors.collegeInstitution ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.collegeInstitution && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.collegeInstitution}</p>}
                  </div>
                </div>

                {/* Section B: Internship Scope */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    B. Internship Parameters
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Organization Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.organization ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.organization && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.organization}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Internship Role / Title <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="internRole"
                        value={formData.internRole}
                        onChange={handleInputChange}
                        placeholder="e.g. Frontend Engineering Intern"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.internRole ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.internRole && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.internRole}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Department <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.department ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.department && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.department}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Internship Type <span className="text-rose-500">*</span></label>
                      <select
                        name="internshipType"
                        value={formData.internshipType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Start Date <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.issueDate ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.issueDate && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.issueDate}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">End Date <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.endDate ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.endDate && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.endDate}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Work Location <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="workLocation"
                        value={formData.workLocation}
                        onChange={handleInputChange}
                        placeholder="e.g. Remote / Chicago Hub"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.workLocation ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.workLocation && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.workLocation}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Supervisor Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="signatoryName"
                        value={formData.signatoryName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.signatoryName ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.signatoryName && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.signatoryName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Supervisor Title / Designation <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="signatoryTitle"
                        value={formData.signatoryTitle}
                        placeholder="e.g. Director of Engineering"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.signatoryTitle ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.signatoryTitle && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.signatoryTitle}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Organization Registered Address <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="orgAddress"
                        value={formData.orgAddress}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.orgAddress ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.orgAddress && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.orgAddress}</p>}
                    </div>
                  </div>
                </div>

                {/* Section C: Document parameters */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    C. Document Ledger parameters
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Letter/Certificate ID <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="certificateId"
                        value={formData.certificateId}
                        onChange={handleInputChange}
                        placeholder="e.g. INT-2026-9A82"
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.certificateId ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.certificateId && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.certificateId}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Issue Publication Date <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                          formErrors.issueDate ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                        }`}
                      />
                      {formErrors.issueDate && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.issueDate}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Internship Scope & Accomplishments <span className="text-rose-500">*</span></label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah made marvelous contributions toward deploying distributed models..."
                      rows={3}
                      className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all ${
                        formErrors.body ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                      }`}
                    />
                    {formErrors.body && <p className="text-rose-500 text-[10px] font-semibold">{formErrors.body}</p>}
                  </div>
                </div>

                {/* Section D: Additional */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest border-b border-slate-100 pb-2">
                    D. Additional References
                  </h3>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Additional Notes / Remarks <span className="text-slate-400">(Optional)</span></label>
                    <textarea
                      name="additionalNotesIntern"
                      value={formData.additionalNotesIntern}
                      onChange={handleInputChange}
                      placeholder="e.g. He completed the syllabus with top marks."
                      rows={2}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* === COMPREHENSIVE ASSETS & FILE UPLOADS === */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-indigo-600 font-mono uppercase tracking-widest">
                D. Secure Media Assets
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Logo Upload Zone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Brand Logo <span className="text-slate-400">(Optional)</span>
                  </label>
                  
                  {formData.logoFile ? (
                    <div className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={formData.logoFile} alt="Preview" className="w-10 h-10 object-contain rounded bg-white border border-slate-100" />
                        <div className="text-xs">
                          <p className="font-bold text-indigo-950">logo_uploaded.png</p>
                          <p className="text-slate-500 font-mono text-[10px]">Base64 Data Locked</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('logoFile')}
                        className="p-1.5 hover:bg-rose-550/20 text-rose-600 rounded"
                        aria-label="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 transition-all bg-slate-50/30 text-center">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, 'logoFile')}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Upload Organization Logo</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG (Max 2MB)</p>
                      {fileErrors.logoFile && <p className="text-rose-500 text-[10px] font-semibold mt-1">{fileErrors.logoFile}</p>}
                    </div>
                  )}
                </div>

                {/* Signature Upload Zone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Authorized Signature <span className="text-slate-400">(Optional)</span>
                  </label>

                  {formData.sigFile ? (
                    <div className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={formData.sigFile} alt="Preview" className="w-16 h-8 object-contain rounded bg-white border border-slate-100" />
                        <div className="text-xs">
                          <p className="font-bold text-indigo-950">signature_uploaded.png</p>
                          <p className="text-slate-500 font-mono text-[10px]">Base64 Data Locked</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('sigFile')}
                        className="p-1.5 hover:bg-rose-550/20 text-rose-600 rounded"
                        aria-label="Remove Signature"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 transition-all bg-slate-50/30 text-center">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, 'sigFile')}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Upload Authorizer Signature</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG (Max 2MB)</p>
                      {fileErrors.sigFile && <p className="text-rose-500 text-[10px] font-semibold mt-1">{fileErrors.sigFile}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setSelectedType(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              Cancel Selection
            </button>
            <button
              onClick={validateAndContinue}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              Select Document Template
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 3: TEMPLATE SELECTION SCREEN (BRAND NEW STAGE!) ---
  if (currentStep === 3) {
    const matchingTemplates = TEMPLATE_REGISTRY.filter((t) => t.type === selectedType);
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Navigation Tracker */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-6">
          <button
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="mr-1.5 w-4 h-4" />
            Go back to Edit Details
          </button>

          <div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400 gap-2">
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Select
              </span>
              <span className="h-0.5 bg-emerald-200 w-6"></span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Form Details
              </span>
              <span className="h-0.5 bg-indigo-200 w-6"></span>
              <span className="text-indigo-600 font-extrabold flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px]">3</span>
                Layout Selection
              </span>
              <span className="h-0.5 bg-slate-200 w-6"></span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">4</span>
                Preview
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest block">EXTENSIBLE TEMPLATE ENGINE</span>
          <h2 className="text-2xl font-extrabold text-slate-900">Choose Graphic Layout Standard</h2>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            Select a design blueprint to compile your parameters. All templates support custom base64 logos, handwriting signature graphs, and self-verifying hash signatures.
          </p>
        </div>

        {/* Grid List of Available Layout Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {matchingTemplates.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`group bg-white rounded-xl border overflow-hidden flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-indigo-600 ring-2 ring-indigo-500/10 shadow-md' 
                    : 'border-slate-200 hover:border-slate-350 hover:shadow-sm'
                }`}
              >
                <div className="p-6 space-y-4">
                  
                  {/* Miniature Geometric layout Preview */}
                  <div className={`aspect-[16/9] w-full rounded-lg border-2 border-dashed p-4 flex flex-col justify-between relative overflow-hidden bg-slate-50/50 ${tpl.thumbnailClass}`}>
                    
                    {/* Simulated watermark shield or lines inside thumbnails */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                      <Layout className="w-24 h-24" />
                    </div>

                    {/* Miniature visual geometry representations matching template styles */}
                    {tpl.id.includes('classic') && (
                      <div className="absolute inset-1.5 border border-amber-600/20 flex flex-col justify-between p-1.5 text-center">
                        <div className="w-4 h-4 rounded bg-amber-500/10 mx-auto"></div>
                        <div className="space-y-1">
                          <div className="w-12 h-1.5 bg-slate-800/15 mx-auto rounded"></div>
                          <div className="w-16 h-1 bg-slate-800/10 mx-auto rounded"></div>
                        </div>
                        <div className="w-20 h-2 bg-indigo-900/15 mx-auto rounded"></div>
                        <div className="flex justify-between items-center w-full px-2">
                          <div className="w-6 h-1 bg-slate-400/20 rounded"></div>
                          <div className="w-8 h-1 bg-slate-400/20 rounded"></div>
                        </div>
                      </div>
                    )}

                    {tpl.id.includes('modern') && (
                      <div className="h-full flex flex-col justify-between p-1.5 text-left relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                        <div className="flex justify-between items-start pl-2">
                          <div className="space-y-1">
                            <div className="w-10 h-2 bg-slate-900/15 rounded"></div>
                            <div className="w-14 h-1 bg-slate-500/10 rounded"></div>
                          </div>
                          <div className="w-4 h-4 rounded bg-slate-200"></div>
                        </div>
                        <div className="w-24 h-3 bg-slate-700/10 rounded pl-2 my-2"></div>
                        <div className="flex justify-between items-center w-full pl-2">
                          <div className="w-6 h-1.5 bg-slate-450/20 rounded"></div>
                          <div className="w-10 h-1 bg-indigo-600/20 rounded"></div>
                        </div>
                      </div>
                    )}

                    {tpl.id.includes('elegant') && (
                      <div className="absolute inset-1.5 border border-emerald-800/20 flex flex-col justify-between p-1.5 text-center bg-[#F4F8F6]">
                        <div className="w-3 h-3 rounded-full bg-emerald-700/15 mx-auto"></div>
                        <div className="w-14 h-2 bg-emerald-950/20 mx-auto rounded mt-1"></div>
                        <div className="w-24 h-2 bg-emerald-900/10 mx-auto rounded"></div>
                        <div className="flex justify-between items-center w-full px-2">
                          <div className="w-6 h-1 bg-slate-400/20 rounded"></div>
                          <div className="w-8 h-1 bg-slate-400/20 rounded"></div>
                        </div>
                      </div>
                    )}

                    {tpl.id.includes('corporate') && (
                      <div className="absolute inset-0 flex flex-col justify-between p-2">
                        <div className="flex justify-between items-center border-b border-indigo-900/15 pb-1">
                          <div className="w-12 h-1.5 bg-indigo-950/25 rounded"></div>
                          <div className="w-3 h-3 rounded bg-slate-300"></div>
                        </div>
                        <div className="w-28 h-3 bg-slate-800/10 rounded mx-auto my-1"></div>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-1">
                          <div className="w-8 h-1.5 bg-slate-400/20 rounded"></div>
                          <div className="w-10 h-1 bg-indigo-600/35 rounded"></div>
                        </div>
                      </div>
                    )}

                    {tpl.id.includes('professional') && (
                      <div className="absolute inset-0 flex flex-col justify-between p-2">
                        <div className="border-t-2 border-indigo-900 pt-1 flex justify-between items-center">
                          <div className="w-10 h-2 bg-indigo-950/20 rounded"></div>
                          <div className="w-8 h-1 bg-slate-400/10 rounded"></div>
                        </div>
                        <div className="w-full space-y-1.5 my-2">
                          <div className="w-20 h-1 bg-slate-450/20 rounded"></div>
                          <div className="w-28 h-2 bg-slate-400/10 rounded"></div>
                        </div>
                        <div className="border-t border-slate-100 pt-1 flex justify-between items-center">
                          <div className="w-8 h-2 bg-slate-450/25 rounded"></div>
                          <div className="w-10 h-1 bg-indigo-600/35 rounded"></div>
                        </div>
                      </div>
                    )}

                    {tpl.id.includes('minimal') && (
                      <div className="absolute inset-0 flex flex-col justify-between p-3">
                        <div className="flex justify-between items-start border-b border-slate-200 pb-1">
                          <div className="w-8 h-1.5 bg-slate-900/20 rounded"></div>
                          <div className="w-8 h-1 bg-slate-400/15 rounded"></div>
                        </div>
                        <div className="space-y-1 my-2">
                          <div className="w-24 h-1.5 bg-slate-500/15 rounded"></div>
                          <div className="w-16 h-1 bg-slate-400/10 rounded"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="w-6 h-1 bg-slate-450/20 rounded"></div>
                          <div className="w-6 h-2 bg-slate-400/20 rounded"></div>
                        </div>
                      </div>
                    )}

                    {tpl.id.includes('academic') && (
                      <div className="absolute inset-0 flex flex-col justify-between p-3">
                        <div className="text-center space-y-0.5 border-b border-stone-200/50 pb-1.5">
                          <div className="w-14 h-1.5 bg-stone-800/20 rounded mx-auto"></div>
                          <div className="w-8 h-1 bg-stone-400/10 rounded mx-auto"></div>
                        </div>
                        <div className="w-full h-4 bg-stone-500/5 rounded my-1"></div>
                        <div className="flex justify-between items-center pt-1 border-t border-stone-800/10">
                          <div className="w-6 h-1.5 bg-stone-450/25 rounded"></div>
                          <div className="w-8 h-1 bg-stone-400/15 rounded"></div>
                        </div>
                      </div>
                    )}

                    {/* Badge showing Category */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/95 text-[7px] font-bold font-mono border border-slate-200 text-slate-600 uppercase shadow-sm">
                      {tpl.category}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {tpl.name}
                      </h4>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold font-mono">
                          <Check className="w-3 h-3 stroke-[3]" /> SELECTED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Choose action bar */}
                <div className={`px-6 py-3 border-t flex justify-between items-center text-xs ${
                  isSelected ? 'bg-indigo-50/20 border-indigo-150' : 'bg-slate-50/30 border-slate-100'
                }`}>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Extensible standard</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplateId(tpl.id);
                      setCurrentStep(4); // Advance to Preview & Lock!
                      window.scrollTo({ top: 0, behavior: 'instant' as any });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-sm shadow-indigo-100' 
                        : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                    }`}
                  >
                    Select Design
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back and Continue Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
          >
            Back to Edit Details
          </button>
          <button
            onClick={() => {
              if (selectedTemplateId) {
                setCurrentStep(4);
                window.scrollTo({ top: 0, behavior: 'instant' as any });
              }
            }}
            disabled={!selectedTemplateId}
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-lg shadow-sm disabled:bg-indigo-300"
          >
            Continue to AI Writing Assistant
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- Brand Media Helper Generators ---
  const getLogoHtml = (size: number, align: string) => {
    const alignClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
    if (formData.logoFile) {
      return `<img src="${formData.logoFile}" style="height: ${size}px;" class="object-contain ${alignClass} block print:max-h-12" />`;
    } else {
      return `<svg style="height: ${size}px; width: ${size}px;" class="text-indigo-900/60 ${alignClass} block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    }
  };

  const getSigHtml = (size: number, align: string) => {
    const alignClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';
    if (formData.sigFile) {
      return `<img src="${formData.sigFile}" style="height: ${size}px;" class="object-contain ${alignClass} block print:max-h-12" />`;
    } else {
      return `<svg style="height: ${size}px; width: ${size * 2.5}px;" class="text-indigo-800/40 ${alignClass} block" viewBox="0 0 100 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 25 C30 12, 45 32, 60 14 C75 4, 80 28, 90 18" /></svg>`;
    }
  };

  // High-fidelity Simulated Vector Export Handler
  const [isSimulatedExporting, setIsSimulatedExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'docx' | null>(null);
  const [exportStep, setExportStep] = useState(0);
  const [exportStepText, setExportStepText] = useState('');

  const triggerSimulatedExport = (type: 'pdf' | 'docx') => {
    setIsSimulatedExporting(true);
    setExportType(type);
    setExportStep(0);
    setExportStepText('Initializing high-fidelity layout parser...');

    const steps = [
      'Deconstructing vector coordinate matrices...',
      'Embedding premium typography formats...',
      'Sizing brand logos and handwritten signature graphs...',
      'Computing cryptographic verification checksum SHA-256 ledger records...',
      'Stamping document ledger ID onto digital assets...',
      'Finalizing document boundaries & metadata tags...',
      'A4 asset assembly finalized. Exporting file...'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setExportStepText(steps[current]);
        setExportStep(Math.round(((current + 1) / steps.length) * 100));
        current++;
      } else {
        clearInterval(interval);
        setTimeout(async () => {
          try {
            const downloadFilename = `${selectedType || 'document'}-${formData.recipientName.toLowerCase().replace(/\s+/g, '-')}-secured.${type}`;
            
            let fileUri = '';
            if (type === 'pdf') {
              setExportStepText('Compiling high-resolution PDF canvas...');
              fileUri = await generatePdf('a4-preview-canvas', downloadFilename, verificationCode);
            } else {
              setExportStepText('Compiling XML document node layers...');
              fileUri = await generateDocx(selectedType as any, formData, verificationCode, downloadFilename);
            }

            // A. Sync with Supabase / Local storage buckets
            setExportStepText('Uploading document to secure cloud storage...');
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bucket: 'documents',
                filename: downloadFilename,
                fileData: fileUri,
                mimeType: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              })
            });

            if (!uploadRes.ok) {
              throw new Error('Cloud storage synchronization failed.');
            }

            const uploadData = await uploadRes.json();
            const cloudUrl = uploadData.url;

            // B. Register document schema metadata & generate sequential DOC-2026-XXXXXX serial ID
            setExportStepText('Registering unique serial key with verification ledger...');
            const registerRes = await fetch('/api/documents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                document_type_id: selectedType,
                template_id: selectedTemplateId,
                recipient_name: formData.recipientName,
                organization_name: formData.organization,
                document_data: formData,
                generated_content: formData.body,
                pdf_url: type === 'pdf' ? cloudUrl : '',
                docx_url: type === 'docx' ? cloudUrl : '',
                verification_code: verificationCode
              })
            });

            if (!registerRes.ok) {
              throw new Error('Ledger registration failed.');
            }

            const docResult = await registerRes.json();
            setLastCreatedDoc(docResult);
            setShowSuccessCard(true);
          } catch (err: any) {
            console.error('Document compilation failed:', err);
            alert(`Document compilation error: ${err.message || 'Generation timeout'}`);
          } finally {
            setIsSimulatedExporting(false);
            setExportType(null);
          }
        }, 800);
      }
    }, 450);
  };

  const handleResetChanges = () => {
    setStyling({
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 14,
      lineHeight: 1.6,
      paragraphSpacing: 12,
      margins: 32,
      logoSize: 40,
      logoAlign: 'center',
      sigSize: 40,
      sigAlign: 'center',
    });
    setFormData(prev => ({
      ...prev,
      body: originalBody || prev.body
    }));
    setZoomLevel(100);
    setPreviewMode('desktop');
  };

  const handleStartOver = () => {
    setSelectedType(null);
    setCurrentStep(2);
    setFormData({
      organization: 'DocuAI Advanced Labs Inc.',
      recipientName: 'Sarah Jenkins',
      issueDate: new Date().toISOString().split('T')[0],
      body: 'For extraordinary mastery and dedication demonstrated during the distributed computing fine-tuning curriculum.',
      signatoryName: 'Dr. Arthur Vance',
      signatoryTitle: 'Head of Operations',
      orgAddress: '100 Silicon Boulevard, Suite 500, Tech City, TC 94025',
      theme: 'gold',
      docTitle: 'Certificate of Excellence',
      certificateId: 'CERT-2026-9A82',
      additionalDesc: 'Recognizing stellar compliance to prompt engineering optimization rules.',
      candidateEmail: 'jenkins.s@gmail.com',
      candidatePhone: '+1 (555) 902-1823',
      candidateAddress: '42 Broadway Street, Apartment 4B, New York, NY 10004',
      jobTitle: 'Senior Solutions Architect',
      department: 'Engineering Division',
      employmentType: 'Full-time',
      joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workLocation: 'Remote (US/Canada)',
      salary: '$185,000 USD Annual Base',
      probationPeriod: '3 Months',
      customTerms: 'This offer is subject to a standard background verification protocol.',
      additionalNotes: 'Standard healthcare, dental benefits, and equity options are provided as defined in company bylaws.',
      collegeInstitution: 'Massachusetts Institute of Technology',
      internRole: 'Frontend Developer Intern',
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      internshipType: 'Paid',
      additionalNotesIntern: 'A certificate of excellence was also conferred upon completion.',
      logoFile: '',
      sigFile: '',
    });
    setStyling({
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 14,
      lineHeight: 1.6,
      paragraphSpacing: 12,
      margins: 32,
      logoSize: 40,
      logoAlign: 'center',
      sigSize: 40,
      sigAlign: 'center',
    });
    setZoomLevel(100);
    setPreviewMode('desktop');
    setOriginalBody('');
  };

  // --- Step 4: AI Content Engine Stage ---
  if (currentStep === 4) {
    const currentTemplate = TEMPLATE_REGISTRY.find(t => t.id === selectedTemplateId) || TEMPLATE_REGISTRY[0];

    const variables: Record<string, string> = {
      recipientName: formData.recipientName,
      organizationName: formData.organization,
      documentTitle: selectedType === 'certificate' ? formData.docTitle : selectedType === 'offer-letter' ? 'Employment Contract Offer' : 'Service Verification Letter',
      issueDate: formData.issueDate,
      documentId: verificationCode,
      issuerName: formData.signatoryName,
      issuerDesignation: formData.signatoryTitle,
      jobTitle: selectedType === 'offer-letter' ? formData.jobTitle : selectedType === 'internship-letter' ? formData.internRole : '',
      startDate: selectedType === 'offer-letter' ? formData.joiningDate : selectedType === 'internship-letter' ? formData.issueDate : '',
      endDate: selectedType === 'internship-letter' ? formData.endDate : '',
      description: formData.body,
      orgAddress: formData.orgAddress,
      candidateEmail: formData.candidateEmail || '',
      candidatePhone: formData.candidatePhone || '',
      candidateAddress: formData.candidateAddress || '',
      department: formData.department || '',
      employmentType: formData.employmentType || '',
      salary: formData.salary || '',
      probationPeriod: formData.probationPeriod || '',
      workLocation: formData.workLocation || '',
      customTerms: formData.customTerms || '',
      additionalNotes: formData.additionalNotes || '',
      collegeInstitution: formData.collegeInstitution || '',
      additionalNotesIntern: formData.additionalNotesIntern || '',
      logoHtml: getLogoHtml(40, 'center'),
      sigHtml: getSigHtml(40, 'center'),
    };

    const finalDocumentMarkup = renderTemplate(currentTemplate.htmlStructure, variables);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tracker */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-4 no-print">
          <button
            onClick={() => setCurrentStep(3)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="mr-1.5 w-4 h-4" />
            Change Layout Template
          </button>

          <div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400 gap-2">
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Select
              </span>
              <span className="h-0.5 bg-emerald-200 w-6"></span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Form Details
              </span>
              <span className="h-0.5 bg-emerald-200 w-6"></span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Layout Selection
              </span>
              <span className="h-0.5 bg-indigo-200 w-6"></span>
              <span className="text-indigo-600 font-extrabold flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px]">4</span>
                AI Writing Content
              </span>
              <span className="h-0.5 bg-slate-200 w-6"></span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">5</span>
                Design & Style
              </span>
            </div>
          </div>
        </div>

        {/* Main Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider block">PROSE DRAFTING COVENANT</span>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">AI Content Optimizer</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review and enrich the credentials description. You can draft with prompt guidance using the server-side Gemini system, or manually override the layout wording instantly.
              </p>
            </div>

            {/* AI Composer Module */}
            <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-lg space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">AI Assistant Control center</h3>
                </div>
              </div>

              <div className="space-y-4">
                {/* Manual Editing Section */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Edit Current Wording (Manual Override)
                  </label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    placeholder="The main paragraph text of your document..."
                    rows={6}
                    className="w-full p-3 text-xs rounded-lg border border-slate-800 bg-slate-950/90 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed"
                  />
                </div>

                {/* AI Guidance input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    AI Guidance / Key Accomplishments
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Example: developed five high-fidelity screens, optimized loading latency by 45%, managed stakeholder reviews..."
                    className="w-full min-h-[70px] p-3 text-xs rounded-lg border border-slate-800 bg-slate-950/80 placeholder-slate-500 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>

                {isAiGenerating ? (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-indigo-400 font-semibold font-mono">
                      <span>{aiProgressText}</span>
                      <span>{aiProgressValue}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${aiProgressValue}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">AI Action Center</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAiGeneration('generate')}
                        className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-550 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 inline-flex items-center justify-center gap-1.5 shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate with AI
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleAiGeneration('regenerate')}
                        className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold rounded-lg transition-all active:scale-95 inline-flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAiGeneration('professional')}
                        className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold rounded-lg transition-all active:scale-95 inline-flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Make Professional
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAiGeneration('concise')}
                        className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold rounded-lg transition-all active:scale-95 inline-flex items-center justify-center gap-1.5"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        Make Concise
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advance to step 5 button */}
            <button
              onClick={() => {
                setCurrentStep(5);
                window.scrollTo({ top: 0, behavior: 'instant' as any });
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans uppercase tracking-wider"
            >
              Continue to Stylist Design Studio
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </button>
          </div>

          {/* Simple preview column with high-fidelity paper effects */}
          <div className="lg:col-span-7 bg-slate-100 p-8 rounded-2xl border border-slate-200/80 shadow-inner flex flex-col items-center justify-center sticky top-6 print-container select-none">
            <div className="relative w-full aspect-[1/1.414] bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18),_0_15px_30px_-10px_rgba(15,23,42,0.12),_0_0_80px_rgba(15,23,42,0.04)] border border-slate-300/80 rounded-[3px] overflow-hidden transition-all duration-300">
              {/* Real-time Page Size Indicator */}
              <div className="absolute -top-7 left-0 bg-slate-900 text-slate-100 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-slate-800 z-10 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>A4 Sheet • 210 x 297 mm • Draft</span>
              </div>

              <div 
                className="w-full h-full relative"
                dangerouslySetInnerHTML={{ __html: finalDocumentMarkup }}
              />

              {/* Dynamic Live QR Code Overlay */}
              <div className="absolute bottom-4 right-4 z-40 bg-white p-1 rounded border border-slate-200 shadow-md flex flex-col items-center gap-0.5 select-none pointer-events-none scale-90 sm:scale-100 origin-bottom-right">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(verificationCode)}`}
                  alt="Secure QR Verification"
                  className="w-10 h-10 block"
                />
                <span className="text-[5px] font-mono font-bold text-indigo-600 tracking-wider">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 5 Success Card Receipt ---
  if (currentStep === 5 && showSuccessCard) {
    const verifyUrl = `${window.location.protocol}//${window.location.host}/verify/${lastCreatedDoc?.document_id}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

    const handleRevoke = async () => {
      if (confirm(`Are you absolutely sure you want to revoke and invalidate ${lastCreatedDoc?.document_id}? This action is irreversible.`)) {
        try {
          const res = await fetch(`/api/verify/${lastCreatedDoc?.document_id}/revoke`, { method: 'POST' });
          if (res.ok) {
            setLastCreatedDoc((prev: any) => ({ ...prev, status: 'Revoked' }));
            alert('Document revoked successfully in the verification ledger.');
          } else {
            alert('Revocation failed.');
          }
        } catch (err) {
          console.error(err);
          alert('Network error trying to revoke.');
        }
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-scale-in">
          {/* Green Top bar */}
          <div className="bg-emerald-600 px-6 py-8 text-center text-white space-y-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-10 h-10 text-white animate-bounce" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase font-mono">CREDENTIAL COMPILED & SEALED</h2>
            <p className="text-xs text-emerald-100 font-sans max-w-md mx-auto">
              Your document has been dynamically generated, securely uploaded to cloud storage, and registered in the cryptographic verification registry.
            </p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: QR & Meta */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-inner">
                <img src={qrSrc} alt="Verification QR" className="w-40 h-40 block shadow-sm bg-white p-1 rounded" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">SCAN TO VERIFY</div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(verifyUrl);
                    alert('Verification link copied to clipboard!');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold font-mono underline block cursor-pointer"
                >
                  Copy Verification URL
                </button>
              </div>

              <div className="w-full pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">LEDGER STATUS</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    lastCreatedDoc?.status === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-red-800'
                  }`}>
                    {lastCreatedDoc?.status || 'Valid'}
                  </span>
                </div>
                {lastCreatedDoc?.status === 'Valid' && (
                  <button
                    onClick={handleRevoke}
                    className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-red-600 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border border-rose-200 cursor-pointer"
                  >
                    Revoke Credential
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Receipt Parameters */}
            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider font-mono">OFFICIAL SERIAL ID</span>
                  <div className="text-base font-extrabold text-slate-900 font-mono">{lastCreatedDoc?.document_id}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider font-mono">DOCUMENT TYPE</span>
                  <div className="text-sm font-bold text-slate-700 uppercase font-mono">{selectedType}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider font-mono">RECIPIENT NAME</span>
                  <div className="text-sm font-bold text-slate-800">{lastCreatedDoc?.recipient_name}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider font-mono">ISSUING AUTHORITY</span>
                  <div className="text-sm font-bold text-slate-800">{lastCreatedDoc?.organization_name}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider font-mono">REGISTRATION DATE</span>
                  <div className="text-sm font-semibold text-slate-600">{new Date(lastCreatedDoc?.created_at).toLocaleDateString()}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider font-mono">SIGNATURE INTEGRITY</span>
                  <div className="text-sm font-mono text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    VERIFIED SECURE
                  </div>
                </div>
              </div>

              {/* Dynamic Storage Downloads */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">CLOUD REPOSITORY DOWNLOADS</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {lastCreatedDoc?.pdf_url && (
                    <a
                      href={lastCreatedDoc.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-4 h-4 text-indigo-600" />
                      Download PDF (Cloud)
                    </a>
                  )}
                  {lastCreatedDoc?.docx_url && (
                    <a
                      href={lastCreatedDoc.docx_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-4 h-4 text-slate-800" />
                      Download DOCX (Cloud)
                    </a>
                  )}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => onNavigate(`/verify/${lastCreatedDoc?.document_id}`)}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md font-mono uppercase tracking-wider cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  View Public Verification Page
                </button>
                <button
                  onClick={() => {
                    setShowSuccessCard(false);
                    setLastCreatedDoc(null);
                    handleStartOver();
                  }}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
                >
                  Create Another Document
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 5: Final Stylist Preview & Customizable Layout Canvas ---
  const templateRegistry = dynamicTemplates.length > 0 ? dynamicTemplates : TEMPLATE_REGISTRY;
  const currentTemplate = templateRegistry.find(t => t.id === selectedTemplateId) || templateRegistry[0];

  const step5Variables: Record<string, string> = {
    recipientName: formData.recipientName,
    organizationName: formData.organization,
    documentTitle: selectedType === 'certificate' ? formData.docTitle : selectedType === 'offer-letter' ? 'Employment Contract Offer' : 'Service Verification Letter',
    issueDate: formData.issueDate,
    documentId: verificationCode,
    issuerName: formData.signatoryName,
    issuerDesignation: formData.signatoryTitle,
    jobTitle: selectedType === 'offer-letter' ? formData.jobTitle : selectedType === 'internship-letter' ? formData.internRole : '',
    startDate: selectedType === 'offer-letter' ? formData.joiningDate : selectedType === 'internship-letter' ? formData.issueDate : '',
    endDate: selectedType === 'internship-letter' ? formData.endDate : '',
    description: formData.body,
    orgAddress: formData.orgAddress,
    candidateEmail: formData.candidateEmail || '',
    candidatePhone: formData.candidatePhone || '',
    candidateAddress: formData.candidateAddress || '',
    department: formData.department || '',
    employmentType: formData.employmentType || '',
    salary: formData.salary || '',
    probationPeriod: formData.probationPeriod || '',
    workLocation: formData.workLocation || '',
    customTerms: formData.customTerms || '',
    additionalNotes: formData.additionalNotes || '',
    collegeInstitution: formData.collegeInstitution || '',
    additionalNotesIntern: formData.additionalNotesIntern || '',
    logoHtml: getLogoHtml(styling.logoSize, styling.logoAlign),
    sigHtml: getSigHtml(styling.sigSize, styling.sigAlign),
  };

  // Compile with high-fidelity injected styles
  const styleBlock = `
    <style>
      .custom-styled-document, .custom-styled-document * {
        font-family: "${styling.fontFamily}", sans-serif !important;
      }
      .custom-styled-document {
        font-size: ${styling.fontSize}px !important;
        line-height: ${styling.lineHeight} !important;
        padding: ${styling.margins}px !important;
        transition: all 0.15s ease-in-out;
      }
      .custom-styled-document p {
        margin-bottom: ${styling.paragraphSpacing}px !important;
      }
      .custom-styled-document h1 {
        font-size: ${styling.fontSize * 1.8}px !important;
      }
      .custom-styled-document h2 {
        font-size: ${styling.fontSize * 1.4}px !important;
      }
      .custom-styled-document h3 {
        font-size: ${styling.fontSize * 1.1}px !important;
      }
      .custom-styled-document td, .custom-styled-document th {
        font-size: ${styling.fontSize * 0.85}px !important;
      }
    </style>
  `;

  const finalDocumentMarkup = `${styleBlock}<div class="custom-styled-document h-full w-full relative">${renderTemplate(currentTemplate.htmlStructure, step5Variables)}</div>`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-4 no-print">
        <button
          onClick={() => setCurrentStep(4)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="mr-1.5 w-4 h-4" />
          Back to AI Assistant
        </button>

        <div>
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400 gap-2">
            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Select
            </span>
            <span className="h-0.5 bg-emerald-200 w-6"></span>
            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Form Details
            </span>
            <span className="h-0.5 bg-emerald-200 w-6"></span>
            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Layout Selection
            </span>
            <span className="h-0.5 bg-emerald-200 w-6"></span>
            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              AI Content
            </span>
            <span className="h-0.5 bg-indigo-200 w-6"></span>
            <span className="text-indigo-600 font-extrabold flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px]">5</span>
              Design & Style Studio
            </span>
          </div>
        </div>
      </div>

      {/* simulated loading popup overlay during file generation */}
      {isSimulatedExporting && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-500 border-t-transparent animate-spin flex items-center justify-center mx-auto">
              <FileDown className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider">
                Compiling Secure Asset
              </h3>
              <p className="text-xs text-slate-500 leading-normal min-h-[36px]">
                {exportStepText}
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${exportStep}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-widest">{exportStep}% COMPILED</div>
          </div>
        </div>
      )}

      {/* Main Dual View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: A4 document preview experience */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Canvas Tweak / Settings bar (zoom, responsive toggle, reset) */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm flex flex-wrap gap-4 items-center justify-between text-xs no-print">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 font-mono text-[10px] uppercase">ZOOM</span>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                className="p-1 hover:bg-slate-100 text-slate-600 rounded"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={zoomLevel} 
                onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                className="w-20 accent-indigo-600"
              />
              <button 
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                className="p-1 hover:bg-slate-100 text-slate-600 rounded"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-slate-700 min-w-[32px]">{zoomLevel}%</span>
            </div>

            {/* Responsive toggler */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${
                  previewMode === 'desktop' ? 'bg-white text-indigo-750 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${
                  previewMode === 'mobile' ? 'bg-white text-indigo-750 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Mobile View
              </button>
            </div>

            {/* Reset helper */}
            <button
              onClick={handleResetChanges}
              className="inline-flex items-center text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Styles
            </button>
          </div>

          {/* Actual Document Sheet Container representing A4 parameters */}
          <div className="p-8 bg-slate-250 rounded-2xl border border-slate-350 shadow-inner flex items-start justify-center min-h-[500px] lg:min-h-[750px] overflow-auto select-none scrollbar-thin scrollbar-thumb-slate-300">
            
            {/* Aspect container scaled based on zoom factor and responsive size */}
            <div 
              style={{
                width: previewMode === 'mobile' ? `${375 * zoomLevel / 100}px` : `${794 * zoomLevel / 100}px`,
                height: previewMode === 'mobile' ? `${530 * zoomLevel / 100}px` : `${1123 * zoomLevel / 100}px`,
                transition: 'width 0.3s ease, height 0.3s ease',
              }}
              className="relative origin-top mt-7"
            >
              {/* Real-time Page Size & Metadata Indicator */}
              <div className="absolute -top-7 left-0 bg-slate-900 text-slate-100 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-slate-800 z-10 pointer-events-none select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  A4 • {previewMode === 'mobile' ? 'Mobile View' : 'Standard'} • {previewMode === 'mobile' ? '100 x 141 mm' : '210 x 297 mm'} • Margin: {styling.margins}px
                </span>
              </div>

              <div 
                id="a4-preview-canvas"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: previewMode === 'mobile' ? '375px' : '794px',
                  height: previewMode === 'mobile' ? '1123px' : '1123px', // Keep actual aspect ratio safe
                }}
                className="bg-white shadow-[0_30px_70px_-15px_rgba(15,23,42,0.25),_0_15px_35px_-10px_rgba(15,23,42,0.18),_0_0_90px_rgba(15,23,42,0.06)] border border-slate-350 rounded-[3px] relative overflow-hidden transition-all duration-300"
              >
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: finalDocumentMarkup }}
                />

                {/* Dynamic Live QR Code Overlay */}
                <div className="absolute bottom-6 right-6 z-40 bg-white p-1.5 rounded border border-slate-200/80 shadow-md flex flex-col items-center gap-0.5 select-none pointer-events-none scale-90 sm:scale-100 origin-bottom-right">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(verificationCode)}`}
                    alt="Secure QR Verification"
                    className="w-11 h-11 block"
                  />
                  <span className="text-[5.5px] font-mono font-bold text-indigo-600 tracking-wider">VERIFIED</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Styling customize Controls panel */}
        <div className="lg:col-span-5 space-y-6 animate-fade-in no-print">
          
          {/* Template Switcher */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" />
              1. Swap Template Layout
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {templateRegistry.filter(t => t.type === selectedType).map(tpl => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-2 text-left rounded-lg border text-xs transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 font-bold' 
                        : 'border-slate-200 bg-white hover:border-slate-350 text-slate-600'
                    }`}
                  >
                    <div className="font-mono text-[9px] text-slate-400 block uppercase">Standard</div>
                    <div className="truncate font-semibold mt-0.5">{tpl.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography configuration */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-wider border-b border-slate-100 pb-2">
              2. Typography configuration
            </h3>

            <div className="space-y-3">
              {/* Font Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Font Family</label>
                <select
                  value={styling.fontFamily}
                  onChange={(e) => setStyling(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-sans"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                  <option value="Playfair Display">Playfair Display (Royal Classic)</option>
                  <option value="Cinzel">Cinzel (Traditional Heritage)</option>
                  <option value="Montserrat">Montserrat (Geometric Tech)</option>
                  <option value="EB Garamond">EB Garamond (Delicate Literature)</option>
                </select>
              </div>

              {/* Font size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Base Sizing</span>
                  <span className="font-mono text-indigo-600 font-bold">{styling.fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="24" 
                  value={styling.fontSize} 
                  onChange={(e) => setStyling(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Line height */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Line Height</span>
                  <span className="font-mono text-indigo-600 font-bold">{styling.lineHeight}</span>
                </div>
                <input 
                  type="range" 
                  min="1.2" 
                  max="2.2" 
                  step="0.1" 
                  value={styling.lineHeight} 
                  onChange={(e) => setStyling(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Paragraph spacing */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Paragraph Gap</span>
                  <span className="font-mono text-indigo-600 font-bold">{styling.paragraphSpacing}px</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="32" 
                  value={styling.paragraphSpacing} 
                  onChange={(e) => setStyling(prev => ({ ...prev, paragraphSpacing: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Margins */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-wider border-b border-slate-100 pb-2">
              3. Margins & Padding
            </h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Page Margins</span>
                <span className="font-mono text-indigo-600 font-bold">{styling.margins}px</span>
              </div>
              <input 
                type="range" 
                min="16" 
                max="64" 
                value={styling.margins} 
                onChange={(e) => setStyling(prev => ({ ...prev, margins: parseInt(e.target.value) }))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Logos and signature sizing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-wider border-b border-slate-100 pb-2">
              4. Media & placement
            </h3>

            <div className="space-y-4">
              {/* Logo Sizing */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Logo Height</span>
                  <span className="font-mono text-indigo-600 font-bold">{styling.logoSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={styling.logoSize} 
                  onChange={(e) => setStyling(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Alignment</span>
                  <div className="flex gap-1 bg-slate-50 p-0.5 rounded border border-slate-100">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setStyling(prev => ({ ...prev, logoAlign: align }))}
                        className={`px-2 py-1 uppercase text-[8px] font-extrabold rounded-md transition-all ${
                          styling.logoAlign === align ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signature Sizing */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Signature Height</span>
                  <span className="font-mono text-indigo-600 font-bold">{styling.sigSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={styling.sigSize} 
                  onChange={(e) => setStyling(prev => ({ ...prev, sigSize: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Alignment</span>
                  <div className="flex gap-1 bg-slate-50 p-0.5 rounded border border-slate-100">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setStyling(prev => ({ ...prev, sigAlign: align }))}
                        className={`px-2 py-1 uppercase text-[8px] font-extrabold rounded-md transition-all ${
                          styling.sigAlign === align ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* live overrides */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-wider border-b border-slate-100 pb-2">
              5. Quick Content override
            </h3>

            <div className="space-y-3">
              {/* Recipient Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient Full Name</label>
                <input 
                  type="text" 
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Organization Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Issuing Organization</label>
                <input 
                  type="text" 
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Document Title / Role */}
              {selectedType === 'certificate' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Certificate Title</label>
                  <input 
                    type="text" 
                    name="docTitle"
                    value={formData.docTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              ) : selectedType === 'offer-letter' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Position Title</label>
                  <input 
                    type="text" 
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Internship Role</label>
                  <input 
                    type="text" 
                    name="internRole"
                    value={formData.internRole}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              )}

              {/* Description Body text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Main Description Paragraph</label>
                <textarea 
                  name="body"
                  value={formData.body}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">6. Build Credentials</div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => triggerSimulatedExport('pdf')}
                className="py-3 px-4 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm shadow-indigo-100"
              >
                <Printer className="w-4 h-4" />
                Generate PDF
              </button>

              <button
                type="button"
                onClick={() => triggerSimulatedExport('docx')}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                Generate DOCX
              </button>
            </div>

            <button
              onClick={handleStartOver}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200 text-center uppercase tracking-wider text-[10px]"
            >
              Start Over (Wipe Session)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

