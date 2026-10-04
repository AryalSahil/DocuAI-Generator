import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Activity, FileText, Layout, Settings, LogOut, CheckCircle2, 
  XCircle, Trash2, Eye, Download, Server, Sparkles, RefreshCw, AlertTriangle, 
  Search, Calendar, User, Building, ShieldAlert, BadgeCheck, BookOpen, Copy,
  Edit, ToggleLeft, ToggleRight, Plus, EyeOff, Save, KeyRound, Type, Mail, Heart, Palette
} from 'lucide-react';

interface AdminViewProps {
  onNavigate: (path: string, state?: any) => void;
}

export default function AdminView({ onNavigate }: AdminViewProps) {
  // Authentication State
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('docuai_admin_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'templates' | 'types' | 'ai' | 'branding' | 'logs' | 'settings'>('dashboard');

  // Datasets from Backend
  const [stats, setStats] = useState<any>({
    totalDocuments: 0,
    certificates: 0,
    offerLetters: 0,
    internshipLetters: 0,
    activeTemplates: 0,
    validDocuments: 0,
    revokedDocuments: 0
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Branding Config form state
  const [brandingForm, setBrandingForm] = useState({
    platformName: 'DocuAI Generator',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4f46e5',
    footerText: '© 2026 DocuAI Generator. All rights reserved.',
    contactDetails: 'support@docuai.org'
  });
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // 2. AI Settings form state
  const [aiForm, setAiForm] = useState({
    enabled: true,
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.7,
    prompt_certificate: '',
    prompt_offer_letter: '',
    prompt_internship: ''
  });
  const [isSavingAi, setIsSavingAi] = useState(false);

  // 2b. Maintenance settings form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    title: 'We\'ll Be Back Soon',
    message: 'We\'re currently improving our document generation system.',
    estimatedReturn: '',
    contactEmail: 'support@docuai.org',
    showAdminLogin: true
  });
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // 3. Template CRUD modal states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [tplForm, setTplForm] = useState({
    id: '',
    name: '',
    document_type_id: 'certificate',
    description: '',
    htmlStructure: '',
    category: 'Standard',
    thumbnailClass: 'border-slate-800 bg-white',
    active: true
  });
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // 4. Document Type CRUD modal states
  const [isDocTypeModalOpen, setIsDocTypeModalOpen] = useState(false);
  const [docTypeForm, setDocTypeForm] = useState({
    id: '',
    name: '',
    description: '',
    active: true,
    field_schema: { fields: [] as any[] }
  });
  const [isSavingDocType, setIsSavingDocType] = useState(false);

  // Check and verify active session token on mount
  useEffect(() => {
    if (token) {
      verifySession(token);
    }
  }, [token]);

  const verifySession = async (sessionToken: string) => {
    try {
      const res = await fetch('/api/admin/session', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      const data = await res.json();
      if (data.valid) {
        setIsAuthenticated(true);
        fetchAdminData(sessionToken);
      } else {
        handleLogout();
      }
    } catch (e) {
      handleLogout();
    }
  };

  // Fetch administrator datasets
  const fetchAdminData = async (sessionToken = token) => {
    if (!sessionToken) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${sessionToken}` };
      
      // Fetch stats metrics
      const statsRes = await fetch('/api/admin/stats', { headers });
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch dynamic generated documents
      const docsRes = await fetch('/api/admin/documents', { headers });
      if (docsRes.ok) setDocuments(await docsRes.json());

      // Fetch layout templates
      const templatesRes = await fetch('/api/templates', { headers });
      if (templatesRes.ok) {
        const rawTemplates = await templatesRes.json();
        // Format layouts cleanly
        const parsedTemplates = rawTemplates.map((t: any) => ({
          id: t.id,
          name: t.name,
          document_type_id: t.document_type_id,
          description: t.description,
          htmlStructure: t.template_config?.htmlStructure || '',
          category: t.template_config?.category || 'Standard',
          thumbnailClass: t.preview_image || 'border-slate-300 bg-white',
          active: t.active
        }));
        setTemplates(parsedTemplates);
      }

      // Fetch dynamic document types
      const typesRes = await fetch('/api/document-types', { headers });
      if (typesRes.ok) setDocumentTypes(await typesRes.json());

      // Fetch dynamic audit logs
      const logsRes = await fetch('/api/admin/logs', { headers });
      if (logsRes.ok) setActivityLogs(await logsRes.json());

      // Fetch dynamic Platform Branding settings
      const brandingRes = await fetch('/api/branding');
      if (brandingRes.ok) setBrandingForm(await brandingRes.json());

      // Fetch dynamic Maintenance settings
      const maintRes = await fetch('/api/maintenance');
      if (maintRes.ok) setMaintenanceForm(await maintRes.json());

      // Fetch dynamic AI engine settings
      const aiRes = await fetch('/api/admin/ai-settings', { headers });
      if (aiRes.ok) setAiForm(await aiRes.json());

    } catch (err) {
      console.error('Failed to load dynamic admin datasets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit secure administrator credentials
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in both security fields.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('docuai_admin_token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        fetchAdminData(data.token);
      } else {
        const errData = await res.json();
        setLoginError(errData.error || 'Access authorization rejected.');
      }
    } catch (err) {
      setLoginError('Failed to establish contact with authentication node.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('docuai_admin_token');
    setToken(null);
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // Administrative Actions triggers
  const triggerRevoke = async (documentId: string) => {
    if (confirm(`Are you absolutely sure you want to revoke and invalidate ${documentId}?`)) {
      try {
        const res = await fetch(`/api/verify/${documentId}/revoke`, { method: 'POST' });
        if (res.ok) {
          alert(`Ledger status of ${documentId} adjusted to: Revoked.`);
          fetchAdminData();
        } else {
          alert('Revocation denied.');
        }
      } catch (err) {
        alert('Failed to transmit revocation.');
      }
    }
  };

  const triggerDelete = async (id: string, documentId: string) => {
    if (confirm(`Are you absolutely sure you want to permanently DELETE ${documentId} from the database? This is irreversible.`)) {
      try {
        const res = await fetch(`/api/admin/documents/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          alert(`Document reference ${documentId} successfully purged from database tables.`);
          fetchAdminData();
        } else {
          alert('Purge request denied.');
        }
      } catch (err) {
        alert('Failed to execute permanent delete.');
      }
    }
  };

  // Branding Customizer Save
  const handleBrandingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    try {
      const res = await fetch('/api/admin/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(brandingForm)
      });
      if (res.ok) {
        alert('Platform custom branding coordinates successfully saved and deployed!');
        fetchAdminData();
      } else {
        alert('Branding update rejected by backend policy.');
      }
    } catch (err) {
      alert('Network transfer failure.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  // AI Configuration Save
  const handleAiSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAi(true);
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aiForm)
      });
      if (res.ok) {
        alert('Dynamic AI prompts and engine models configured successfully!');
        fetchAdminData();
      } else {
        alert('Configuration denied.');
      }
    } catch (err) {
      alert('Failed to update AI model parameters.');
    } finally {
      setIsSavingAi(false);
    }
  };

  // Maintenance Settings Save
  const handleMaintenanceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMaintenance(true);
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(maintenanceForm)
      });
      if (res.ok) {
        alert('Global maintenance mode settings saved and deployed successfully!');
        fetchAdminData();
      } else {
        alert('Failed to update maintenance settings.');
      }
    } catch (err) {
      alert('Network error saving maintenance configuration.');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  // Template Management CRUD triggers
  const openCreateTemplate = () => {
    setTplForm({
      id: '',
      name: '',
      document_type_id: 'certificate',
      description: '',
      htmlStructure: '<!-- Use standard Tailwind, Georgia or Arial, and template parameters -->\n<div class="h-full p-8 flex flex-col justify-between text-center bg-white relative font-sans">\n  <div>\n    <div class="flex justify-center mb-2">{{logoHtml}}</div>\n    <h1 class="text-2xl font-black text-slate-800">{{documentTitle}}</h1>\n  </div>\n  \n  <div class="space-y-2">\n    <div class="text-lg font-bold text-indigo-600">{{recipientName}}</div>\n    <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{{description}}</p>\n  </div>\n\n  <div class="flex justify-between items-end border-t pt-3 text-[10px] text-slate-400 font-mono">\n    <div>DATE: {{issueDate}}</div>\n    <div>ID: {{documentId}}</div>\n  </div>\n</div>',
      category: 'Minimalist',
      thumbnailClass: 'border-slate-200 bg-white',
      active: true
    });
    setIsTemplateModalOpen(true);
  };

  const openEditTemplate = (tpl: any) => {
    setTplForm({
      id: tpl.id,
      name: tpl.name,
      document_type_id: tpl.document_type_id,
      description: tpl.description,
      htmlStructure: tpl.htmlStructure,
      category: tpl.category,
      thumbnailClass: tpl.thumbnailClass,
      active: tpl.active
    });
    setIsTemplateModalOpen(true);
  };

  const handleDuplicateTemplate = (tpl: any) => {
    setTplForm({
      id: `${tpl.id}-clone`,
      name: `${tpl.name} (Clone)`,
      document_type_id: tpl.document_type_id,
      description: tpl.description,
      htmlStructure: tpl.htmlStructure,
      category: tpl.category,
      thumbnailClass: tpl.thumbnailClass,
      active: tpl.active
    });
    setIsTemplateModalOpen(true);
  };

  const handleToggleTemplateStatus = async (tpl: any) => {
    try {
      const updated = { ...tpl, active: !tpl.active, template_config: { htmlStructure: tpl.htmlStructure, category: tpl.category } };
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Failed to toggle status.');
      }
    } catch (err) {
      alert('Network error trying to toggle template state.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm(`Are you sure you want to permanently delete template ${id}? This is irreversible.`)) {
      try {
        const res = await fetch(`/api/admin/templates/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          alert('Template successfully deleted from database.');
          fetchAdminData();
        } else {
          alert('Delete request denied.');
        }
      } catch (err) {
        alert('Network error deleting template.');
      }
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplForm.id || !tplForm.name || !tplForm.htmlStructure) {
      alert('Please fill in all template parameters.');
      return;
    }
    setIsSavingTemplate(true);
    try {
      const payload = {
        id: tplForm.id,
        name: tplForm.name,
        document_type_id: tplForm.document_type_id,
        description: tplForm.description,
        preview_image: tplForm.thumbnailClass,
        active: tplForm.active,
        template_config: {
          htmlStructure: tplForm.htmlStructure,
          category: tplForm.category
        }
      };

      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsTemplateModalOpen(false);
        fetchAdminData();
      } else {
        alert('Failed to save layout template.');
      }
    } catch (err) {
      alert('Failed to submit template coordinates.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Quick insertion of variable placeholders
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const updated = before + variable + after;
      
      setTplForm(prev => ({ ...prev, htmlStructure: updated }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      }, 50);
    }
  };

  // Document Type CRUD Modal triggers
  const openCreateDocType = () => {
    setDocTypeForm({
      id: '',
      name: '',
      description: '',
      active: true,
      field_schema: { fields: [] }
    });
    setIsDocTypeModalOpen(true);
  };

  const openEditDocType = (dt: any) => {
    setDocTypeForm({
      id: dt.id,
      name: dt.name,
      description: dt.description,
      active: dt.active,
      field_schema: dt.field_schema || { fields: [] }
    });
    setIsDocTypeModalOpen(true);
  };

  const handleToggleDocTypeStatus = async (dt: any) => {
    try {
      const updated = { ...dt, active: !dt.active };
      const res = await fetch('/api/admin/document-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Toggle request denied.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleDeleteDocType = async (id: string) => {
    if (confirm(`Are you absolutely sure you want to permanently delete document type '${id}'? This will disconnect any templates attached to it.`)) {
      try {
        const res = await fetch(`/api/admin/document-types/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          alert('Document Type purged.');
          fetchAdminData();
        } else {
          alert('Delete denied.');
        }
      } catch (err) {
        alert('Network error purging document type.');
      }
    }
  };

  const handleDocTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTypeForm.id || !docTypeForm.name) {
      alert('Please fill in all document type requirements.');
      return;
    }
    setIsSavingDocType(true);
    try {
      const res = await fetch('/api/admin/document-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(docTypeForm)
      });

      if (res.ok) {
        setIsDocTypeModalOpen(false);
        fetchAdminData();
      } else {
        alert('Failed to save document type.');
      }
    } catch (err) {
      alert('Network transfer failed.');
    } finally {
      setIsSavingDocType(false);
    }
  };

  // Filtered documents list for search bar
  const filteredDocs = documents.filter(d => 
    d.document_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.organization_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- LOGIN PANEL STYLING ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-8 text-center animate-scale-in">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-100">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 font-mono tracking-tight uppercase">SECURE ADMIN CONSOLE</h1>
          <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
            Please log in with the administrator credentials configured in your environment properties.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="bg-white border border-slate-200/80 p-6 rounded-2xl text-left shadow-xl space-y-4">
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 animate-pulse">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@docuai.org"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Security Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono tracking-widest uppercase rounded-lg transition-all active:scale-95 shadow cursor-pointer disabled:bg-slate-700"
          >
            {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate'}
          </button>
        </form>

        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 tracking-wide uppercase cursor-pointer"
        >
          Back to Public Hub
        </button>
      </div>
    );
  }

  // --- MAIN ADMIN PANEL ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner Status Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-wider font-mono uppercase">{brandingForm.platformName} Admin Console</h1>
          </div>
          <p className="text-[11px] text-slate-400">
            Secure admin ledger session: <span className="text-white font-mono font-bold">admin@docuai.org</span> • Connected to PostgreSQL Index
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => fetchAdminData()}
            disabled={isLoading}
            className="px-3.5 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold font-mono rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync DB
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav column */}
        <div className="lg:col-span-3 space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase px-3 pb-2 border-b border-slate-100">
            Console Options
          </div>
          
          <nav className="space-y-1 flex flex-col pt-2 font-mono">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'templates', label: 'Template Builder', icon: Layout },
              { id: 'types', label: 'Document Types', icon: BookOpen },
              { id: 'ai', label: 'AI Parameters', icon: Sparkles },
              { id: 'branding', label: 'Branding Layout', icon: Palette },
              { id: 'logs', label: 'Activity Logs', icon: Server },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wide text-left inline-flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-extrabold' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content detail area column */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-scale-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Total Documents</div>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{stats.totalDocuments}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left border-l-4 border-l-indigo-600">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Certificates</div>
                  <div className="text-2xl font-black text-indigo-950 mt-1 font-mono">{stats.certificates}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left border-l-4 border-l-amber-500">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Offer Letters</div>
                  <div className="text-2xl font-black text-amber-950 mt-1 font-mono">{stats.offerLetters}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left border-l-4 border-l-teal-600">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Internship Letters</div>
                  <div className="text-2xl font-black text-teal-950 mt-1 font-mono">{stats.internshipLetters}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Valid Documents</span>
                    <div className="text-xl font-black text-emerald-600 mt-1 font-mono">{stats.validDocuments}</div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-200" />
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Revoked Documents</span>
                    <div className="text-xl font-black text-red-600 mt-1 font-mono">{stats.revokedDocuments}</div>
                  </div>
                  <XCircle className="w-8 h-8 text-red-200" />
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Templates</span>
                    <div className="text-xl font-black text-indigo-600 mt-1 font-mono">{stats.activeTemplates}</div>
                  </div>
                  <Layout className="w-8 h-8 text-indigo-200" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">Recent Document Registries</h3>
                  <span className="text-[9px] font-mono font-bold text-slate-400">Ledger audit trace</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px] bg-slate-50/50">
                        <th className="px-5 py-3">Document ID</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Recipient</th>
                        <th className="px-5 py-3">Organization</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400 font-mono italic">
                            No documents registered. Build some in the creator panel first!
                          </td>
                        </tr>
                      ) : (
                        documents.slice(0, 10).map((doc) => (
                          <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-mono font-bold text-indigo-900 select-all">{doc.document_id}</td>
                            <td className="px-5 py-3 uppercase text-[10px] font-bold font-mono">{doc.document_type_id}</td>
                            <td className="px-5 py-3 font-semibold text-slate-800">{doc.recipient_name}</td>
                            <td className="px-5 py-3 text-slate-500">{doc.organization_name}</td>
                            <td className="px-5 py-3 text-slate-500 font-mono">{new Date(doc.created_at).toLocaleDateString()}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                doc.status === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-red-800'
                              }`}>
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => onNavigate(`/verify/${doc.document_id}`)}
                                className="p-1 hover:bg-slate-100 text-indigo-600 rounded inline-flex items-center cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              
                              {doc.pdf_url && (
                                <a
                                  href={doc.pdf_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 hover:bg-slate-100 text-indigo-600 rounded inline-flex items-center"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                              
                              {doc.status === 'Valid' && (
                                <button
                                  onClick={() => triggerRevoke(doc.document_id)}
                                  className="p-1 hover:bg-rose-50 text-red-600 hover:text-red-800 rounded inline-flex items-center cursor-pointer"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => triggerDelete(doc.id, doc.document_id)}
                                className="p-1 hover:bg-rose-50 text-red-600 hover:text-red-800 rounded inline-flex items-center cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left animate-scale-in space-y-4 p-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wider">Document Ledger Directory</h3>
                  <p className="text-[10px] text-slate-400 font-sans">Full logs of certified physical documents.</p>
                </div>
                
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 text-xs rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px] bg-slate-50/50">
                      <th className="px-4 py-2.5">Document ID</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Recipient Name</th>
                      <th className="px-4 py-2.5">Issuing Authority</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400 font-mono italic">
                          No document records matched the search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-900 select-all">{doc.document_id}</td>
                          <td className="px-4 py-2.5 uppercase text-[10px] font-mono">{doc.document_type_id}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800">{doc.recipient_name}</td>
                          <td className="px-4 py-2.5 text-slate-500">{doc.organization_name}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${
                              doc.status === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-red-800'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => onNavigate(`/verify/${doc.document_id}`)}
                              className="p-1 hover:bg-slate-100 text-indigo-600 rounded cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {doc.pdf_url && (
                              <a
                                href={doc.pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 hover:bg-slate-100 text-indigo-600 rounded inline-block"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {doc.status === 'Valid' && (
                              <button
                                onClick={() => triggerRevoke(doc.document_id)}
                                className="p-1 hover:bg-rose-50 text-red-600 rounded cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => triggerDelete(doc.id, doc.document_id)}
                              className="p-1 hover:bg-rose-50 text-red-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LAYOUT TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left animate-scale-in p-5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wider">Dynamic Layout Templates</h3>
                  <p className="text-[10px] text-slate-400 font-sans">Create and configure A4 HTML design structures.</p>
                </div>
                <button
                  onClick={openCreateTemplate}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 shadow cursor-pointer font-mono tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Template
                </button>
              </div>

              {/* Template Editor Modal Overlay */}
              {isTemplateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="bg-slate-950 px-6 py-4 flex justify-between items-center text-white border-b border-slate-800 shrink-0">
                      <span className="font-mono font-black uppercase text-xs tracking-wider">
                        {tplForm.id ? 'Modify Template Layout' : 'Compile New Layout Template'}
                      </span>
                      <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleTemplateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-grow">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Unique ID key (slug)</label>
                          <input
                            type="text"
                            disabled={!!tplForm.id && templates.some(t => t.id === tplForm.id)}
                            value={tplForm.id}
                            onChange={(e) => setTplForm(prev => ({ ...prev, id: e.target.value }))}
                            placeholder="cert-new-heritage"
                            className="w-full px-3 py-2 text-xs border rounded-lg bg-white disabled:bg-slate-50 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Layout Display Name</label>
                          <input
                            type="text"
                            value={tplForm.name}
                            onChange={(e) => setTplForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Dynamic Retro Royal"
                            className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-sans font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Parent Document Type</label>
                          <select
                            value={tplForm.document_type_id}
                            onChange={(e) => setTplForm(prev => ({ ...prev, document_type_id: e.target.value }))}
                            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white capitalize"
                          >
                            {documentTypes.length > 0 ? (
                              documentTypes.map(dt => (
                                <option key={dt.id} value={dt.id}>{dt.name}</option>
                              ))
                            ) : (
                              <>
                                <option value="certificate">Verified Certificate</option>
                                <option value="offer-letter">Employment Offer Letter</option>
                                <option value="internship-letter">Internship Verification</option>
                                <option value="birth-certificate">Birth Certificate</option>
                                <option value="death-certificate">Death Certificate</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Layout Category</label>
                          <input
                            type="text"
                            value={tplForm.category}
                            onChange={(e) => setTplForm(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="Minimalist, Luxury, Modern"
                            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Thumbnail Styles (Tailwind)</label>
                          <input
                            type="text"
                            value={tplForm.thumbnailClass}
                            onChange={(e) => setTplForm(prev => ({ ...prev, thumbnailClass: e.target.value }))}
                            placeholder="border-slate-800 bg-[#FAFBFD]"
                            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Description</label>
                        <input
                          type="text"
                          value={tplForm.description}
                          onChange={(e) => setTplForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="A royal heritage theme using golden borders and double vector alignment."
                          className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
                        />
                      </div>

                      {/* Visual Config Tag Quick Helper Toolbar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          <span>Visual HTML Content Configurator</span>
                          <span className="text-indigo-600">Click variable badge to insert at cursor position:</span>
                        </div>
                        <div className="flex flex-wrap gap-1 bg-slate-50 border p-2 rounded-lg">
                          {[
                            '{{recipientName}}', '{{organizationName}}', '{{documentId}}', 
                            '{{issueDate}}', '{{issuerName}}', '{{issuerDesignation}}', 
                            '{{logoHtml}}', '{{sigHtml}}', '{{description}}', 
                            '{{jobTitle}}', '{{startDate}}', '{{endDate}}'
                          ].map((variable) => (
                            <button
                              key={variable}
                              type="button"
                              onClick={() => insertVariable(variable)}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 border hover:border-indigo-200 text-slate-700 hover:text-indigo-900 rounded font-mono text-[9px] cursor-pointer shadow-sm transition-all"
                            >
                              {variable}
                            </button>
                          ))}
                        </div>
                        <textarea
                          id="template-html-editor"
                          rows={8}
                          value={tplForm.htmlStructure}
                          onChange={(e) => setTplForm(prev => ({ ...prev, htmlStructure: e.target.value }))}
                          placeholder="<div class='h-full border-[10px] p-6 flex flex-col justify-between'>...</div>"
                          className="w-full p-3 border rounded-lg bg-[#FAFBFD] font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsTemplateModalOpen(false)}
                          className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingTemplate}
                          className="py-2 px-5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-lg transition-all shadow cursor-pointer font-mono uppercase tracking-wider"
                        >
                          {isSavingTemplate ? 'Compiling Layout...' : 'Save Template'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Templates List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-4 border border-slate-200/80 rounded-xl space-y-3 bg-white flex flex-col justify-between hover:border-slate-350 transition-all">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-900">{tpl.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                            tpl.active ? 'bg-emerald-550/15 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {tpl.active ? 'Active' : 'Deactivated'}
                          </span>
                          <span className="text-[8px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
                            {tpl.document_type_id}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 max-w-sm line-clamp-2">{tpl.description}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-3 border-t border-slate-100 font-mono text-slate-500">
                      <span className="text-[8px] text-slate-400">ID: {tpl.id}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleTemplateStatus(tpl)}
                          title={tpl.active ? 'Deactivate Layout' : 'Activate Layout'}
                          className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                        >
                          {tpl.active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                        </button>
                        <button
                          onClick={() => openEditTemplate(tpl)}
                          title="Edit HTML config"
                          className="p-1 hover:bg-slate-100 text-indigo-600 rounded cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(tpl)}
                          title="Duplicate template"
                          className="p-1 hover:bg-slate-100 text-indigo-600 rounded cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          title="Purge layout template"
                          className="p-1 hover:bg-rose-50 text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENT TYPES */}
          {activeTab === 'types' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left p-5 space-y-4 animate-scale-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wider">Dynamic Document Types</h3>
                  <p className="text-[10px] text-slate-400 font-sans">Primary structural configurations registered in database schema.</p>
                </div>
                <button
                  onClick={openCreateDocType}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 shadow cursor-pointer font-mono tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Doc Type
                </button>
              </div>

              {/* Document Type Modal Overlay */}
              {isDocTypeModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                    <div className="bg-slate-950 px-6 py-4 flex justify-between items-center text-white border-b border-slate-800 shrink-0">
                      <span className="font-mono font-black uppercase text-xs tracking-wider">
                        {docTypeForm.id ? 'Modify Document Type' : 'Register New Document Type'}
                      </span>
                      <button onClick={() => setIsDocTypeModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleDocTypeSubmit} className="p-6 space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Unique Slug ID</label>
                        <input
                          type="text"
                          disabled={!!docTypeForm.id}
                          value={docTypeForm.id}
                          onChange={(e) => setDocTypeForm(prev => ({ ...prev, id: e.target.value }))}
                          placeholder="e.g. customized-invitation"
                          className="w-full px-3 py-2 border rounded-lg bg-white disabled:bg-slate-50 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Structure Name</label>
                        <input
                          type="text"
                          value={docTypeForm.name}
                          onChange={(e) => setDocTypeForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Verified Performance Award"
                          className="w-full px-3 py-2 border rounded-lg bg-white font-semibold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase font-mono tracking-wider text-[9px] block">Description</label>
                        <textarea
                          rows={3}
                          value={docTypeForm.description}
                          onChange={(e) => setDocTypeForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Standard completion covenents for corporate awards..."
                          className="w-full p-3 border rounded-lg bg-white"
                        />
                      </div>

                      <div className="flex justify-between items-center py-2 bg-slate-50 px-3 rounded-lg border">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">Enable Document Type</span>
                          <span className="text-[10px] text-slate-400">If disabled, it will disappear from dynamic dropdown lists.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocTypeForm(prev => ({ ...prev, active: !prev.active }))}
                          className="p-1 cursor-pointer"
                        >
                          {docTypeForm.active ? <ToggleRight className="w-7 h-7 text-emerald-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                        </button>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                          type="button"
                          onClick={() => setIsDocTypeModalOpen(false)}
                          className="py-2 px-4 border text-slate-500 rounded-lg cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingDocType}
                          className="py-2 px-5 bg-indigo-600 hover:bg-indigo-750 text-white font-mono uppercase tracking-wider rounded-lg shadow font-bold cursor-pointer"
                        >
                          {isSavingDocType ? 'Registering...' : 'Save Document Type'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Document Types List */}
              <div className="space-y-3">
                {documentTypes.map((dt) => (
                  <div key={dt.id} className="p-4 border border-slate-150 rounded-xl flex items-center justify-between gap-4 hover:border-slate-350 transition-all bg-[#FAFBFD]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{dt.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-mono font-bold uppercase tracking-wider ${
                          dt.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {dt.active ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-md">{dt.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <button
                        onClick={() => handleToggleDocTypeStatus(dt)}
                        title={dt.active ? 'Disable Type' : 'Enable Type'}
                        className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                      >
                        {dt.active ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      </button>
                      <button
                        onClick={() => openEditDocType(dt)}
                        title="Edit Type details"
                        className="p-1 hover:bg-slate-100 text-indigo-600 rounded cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocType(dt.id)}
                        title="Delete Type structure"
                        className="p-1 hover:bg-rose-50 text-red-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI SETTINGS */}
          {activeTab === 'ai' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left p-5 space-y-4 animate-scale-in">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wider">AI Content Synthesis Parameters</h3>
                <p className="text-[10px] text-slate-400 font-sans">Configure server-side AI provider settings, toggles, and prompts safely.</p>
              </div>

              <form onSubmit={handleAiSave} className="space-y-4 max-w-2xl text-xs font-sans">
                <div className="flex justify-between items-center py-2.5 bg-slate-50 px-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Enable AI Content Orchestrator</span>
                    <span className="text-[10px] text-slate-400">If disabled, the generation route blocks automatically with an admin override error.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiForm(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className="p-1 cursor-pointer"
                  >
                    {aiForm.enabled ? <ToggleRight className="w-7 h-7 text-emerald-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">AI Core Provider</label>
                    <select
                      value={aiForm.provider}
                      onChange={(e) => setAiForm(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
                    >
                      <option value="gemini">Google Gemini AI Engine (CORS Verified)</option>
                      <option value="mock">Simulated Content Synthesis (Sandbox Offline)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Gemini Model Engine</label>
                    <select
                      value={aiForm.model}
                      onChange={(e) => setAiForm(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
                    >
                      <option value="gemini-3.8-flash">Gemini 3.8 Flash (Optimized Speed & Complexity)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Legacy Speed)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Extreme Precision)</option>
                    </select>
                  </div>
                </div>

                {/* Customizable prompts */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Certificate AI Prompt Instructions</label>
                    <textarea
                      rows={3}
                      value={aiForm.prompt_certificate}
                      onChange={(e) => setAiForm(prev => ({ ...prev, prompt_certificate: e.target.value }))}
                      placeholder="Write a formal certificate description with achievements, titles, and legal sign-offs."
                      className="w-full p-2.5 border rounded-lg bg-[#FAFBFD] font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Offer Letter AI Prompt Instructions</label>
                    <textarea
                      rows={3}
                      value={aiForm.prompt_offer_letter}
                      onChange={(e) => setAiForm(prev => ({ ...prev, prompt_offer_letter: e.target.value }))}
                      placeholder="Write a detailed, legally robust employment contract offer summary with base salaries, start dates, and probation covenants."
                      className="w-full p-2.5 border rounded-lg bg-[#FAFBFD] font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Internship AI Prompt Instructions</label>
                    <textarea
                      rows={3}
                      value={aiForm.prompt_internship}
                      onChange={(e) => setAiForm(prev => ({ ...prev, prompt_internship: e.target.value }))}
                      placeholder="Write an internship completion credential detailing technical hours, project milestones, and student performance metrics."
                      className="w-full p-2.5 border rounded-lg bg-[#FAFBFD] font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t text-right">
                  <button
                    type="submit"
                    disabled={isSavingAi}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-lg font-mono uppercase tracking-wider shadow cursor-pointer transition-all"
                  >
                    {isSavingAi ? 'Configuring System...' : 'Apply settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: BRANDING */}
          {activeTab === 'branding' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left p-5 space-y-4 animate-scale-in">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wider">Enterprise Branding Palette</h3>
                <p className="text-[10px] text-slate-400 font-sans">Modify application logo images, platform name, footers, and dynamically inject style colors.</p>
              </div>

              <form onSubmit={handleBrandingSave} className="space-y-4 max-w-xl text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Platform Title Name</label>
                    <input
                      type="text"
                      value={brandingForm.platformName}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, platformName: e.target.value }))}
                      placeholder="DocuAI Generator"
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                      Primary Theme Color
                      <Palette className="w-3.5 h-3.5 text-indigo-500" />
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={brandingForm.primaryColor}
                        onChange={(e) => setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-10 h-8 border rounded cursor-pointer shrink-0 bg-white"
                      />
                      <input
                        type="text"
                        value={brandingForm.primaryColor}
                        onChange={(e) => setBrandingForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#4f46e5"
                        className="w-full px-3 py-1.5 border rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Logo URL (Absolute Image Path)</label>
                    <input
                      type="text"
                      value={brandingForm.logoUrl}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="e.g. https://domain.com/logo.png"
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Favicon Icon URL</label>
                    <input
                      type="text"
                      value={brandingForm.faviconUrl}
                      onChange={(e) => setBrandingForm(prev => ({ ...prev, faviconUrl: e.target.value }))}
                      placeholder="e.g. https://domain.com/favicon.ico"
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Support Contact Details (Email/Info)</label>
                  <input
                    type="text"
                    value={brandingForm.contactDetails}
                    onChange={(e) => setBrandingForm(prev => ({ ...prev, contactDetails: e.target.value }))}
                    placeholder="support@docuai.org"
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Copyright Footer Text</label>
                  <input
                    type="text"
                    value={brandingForm.footerText}
                    onChange={(e) => setBrandingForm(prev => ({ ...prev, footerText: e.target.value }))}
                    placeholder="© 2026 DocuAI. All rights reserved."
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>

                <div className="pt-2 border-t text-right">
                  <button
                    type="submit"
                    disabled={isSavingBranding}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-lg font-mono uppercase tracking-wider shadow cursor-pointer transition-all"
                  >
                    {isSavingBranding ? 'Saving Style Palette...' : 'Update Branding'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left animate-scale-in p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wider">Security & Table Audit Ledger Logs</h3>
                <p className="text-[10px] text-slate-400 font-sans">Full logs tracing actions executed on platform tables.</p>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden font-mono text-[11px] leading-relaxed">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex text-slate-400 font-bold text-[9px] uppercase tracking-wider font-mono">
                  <span className="w-24 shrink-0">Time</span>
                  <span className="w-44 shrink-0">Security Code</span>
                  <span>Ledger Log Audit Message</span>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-50/50 flex transition-colors">
                      <span className="w-24 shrink-0 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`w-44 shrink-0 font-bold uppercase tracking-wider text-[10px] ${
                        log.type.includes('SUCCESS') || log.type.includes('UPDATED') ? 'text-emerald-600' : log.type.includes('DELETED') || log.type.includes('REVOKED') || log.type.includes('FAILURE') ? 'text-rose-600' : 'text-slate-500'
                      }`}>{log.type}</span>
                      <span className="text-slate-700">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left p-5 space-y-6 animate-scale-in">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-800 uppercase tracking-wider">System Settings & Maintenance Mode</h3>
                <p className="text-[10px] text-slate-400 font-sans font-medium">Configure credentials information and system-wide maintenance mode status.</p>
              </div>

              {/* Maintenance Mode Configuration Panel */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Global Maintenance Mode Configurator</h4>
                </div>

                <form onSubmit={handleMaintenanceSave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Toggle: Maintenance Mode */}
                    <div className="flex justify-between items-center py-2 bg-white px-3 rounded-lg border">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">Maintenance Mode</span>
                        <span className="text-[9px] text-slate-400">If active, redirects all public visitors to the maintenance screen.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaintenanceForm(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className="p-1 cursor-pointer"
                      >
                        {maintenanceForm.enabled ? <ToggleRight className="w-7 h-7 text-rose-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                      </button>
                    </div>

                    {/* Toggle: Show Admin Login */}
                    <div className="flex justify-between items-center py-2 bg-white px-3 rounded-lg border">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">Show Admin Login</span>
                        <span className="text-[9px] text-slate-400">If active, renders a hidden login link on the maintenance screen.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMaintenanceForm(prev => ({ ...prev, showAdminLogin: !prev.showAdminLogin }))}
                        className="p-1 cursor-pointer"
                      >
                        {maintenanceForm.showAdminLogin ? <ToggleRight className="w-7 h-7 text-emerald-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Maintenance Title</label>
                      <input
                        type="text"
                        value={maintenanceForm.title}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="We'll Be Back Soon"
                        className="w-full px-3 py-2 border rounded-lg bg-white font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Estimated Return Time (Optional)</label>
                      <input
                        type="text"
                        value={maintenanceForm.estimatedReturn}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, estimatedReturn: e.target.value }))}
                        placeholder="e.g. 2 Hours, Monday 9 AM"
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Contact Email (Optional)</label>
                      <input
                        type="email"
                        value={maintenanceForm.contactEmail}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="support@docuai.org"
                        className="w-full px-3 py-2 border rounded-lg bg-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Maintenance Detail Message</label>
                      <input
                        type="text"
                        value={maintenanceForm.message}
                        onChange={(e) => setMaintenanceForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="We're currently conducting routine upgrades to improve our document generation engine."
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="text-right pt-2">
                    <button
                      type="submit"
                      disabled={isSavingMaintenance}
                      className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-lg font-mono uppercase tracking-wider shadow cursor-pointer transition-all inline-flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingMaintenance ? 'Saving parameters...' : 'Save Maintenance Settings'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-600 text-xs leading-normal space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-indigo-950 font-mono uppercase text-[10px] tracking-wider">
                  <BadgeCheck className="w-4 h-4 text-indigo-600" />
                  Credentials Ledger Encryption
                </p>
                <p>
                  DocuAI employs server-side credential synchronization. Credentials are encrypted on transit and referenced entirely by their unique SHA document signature indexes.
                </p>
                <p className="pt-2">
                  To modify administrator email or passphrase overrides, adjust the corresponding <code className="bg-slate-200 border px-1 py-0.5 rounded font-bold font-mono">ADMIN_EMAIL</code> and <code className="bg-slate-200 border px-1 py-0.5 rounded font-bold font-mono">ADMIN_PASSWORD</code> variables inside your platform deployment config.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
