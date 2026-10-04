import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Menu, X, ArrowRight, Lock, Eye } from 'lucide-react';
import HomeView from './components/HomeView';
import CreateView from './components/CreateView';
import TemplatesView from './components/TemplatesView';
import HowItWorksView from './components/HowItWorksView';
import VerifyView from './components/VerifyView';
import AboutView from './components/AboutView';
import AdminView from './components/AdminView';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [navigationState, setNavigationState] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Enterprise Branding State
  const [branding, setBranding] = useState({
    platformName: "DocuAI Generator",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#4f46e5",
    footerText: "© 2026 DocuAI Generator. All rights reserved.",
    contactDetails: "support@docuai.org"
  });

  // Dynamic Maintenance Mode State
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    title: "Scheduled Maintenance In Progress",
    message: "We're currently conducting routine upgrades to improve our document generation engine. We'll be back shortly.",
    estimatedReturn: "",
    contactEmail: "support@docuai.org",
    showAdminLogin: true
  });

  // Load dynamic Maintenance configuration
  useEffect(() => {
    fetch('/api/maintenance')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setMaintenance(data);
        }
      })
      .catch(err => console.warn('Could not contact maintenance status endpoint:', err));
  }, [currentPath]);

  // Load customizable branding coordinates dynamically
  useEffect(() => {
    fetch('/api/branding')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBranding(data);
          
          // Repaint active Tailwind primary colors dynamically on the :root node
          const style = document.createElement('style');
          style.innerHTML = `
            :root {
              --color-indigo-50: ${data.primaryColor}10 !important;
              --color-indigo-100: ${data.primaryColor}20 !important;
              --color-indigo-600: ${data.primaryColor} !important;
              --color-indigo-700: ${data.primaryColor}ee !important;
              --color-indigo-750: ${data.primaryColor}dd !important;
              --color-indigo-900: ${data.primaryColor}cc !important;
              --color-indigo-950: ${data.primaryColor}bb !important;
            }
          `;
          document.head.appendChild(style);

          // Update active browser window tab title
          document.title = data.platformName;
        }
      })
      .catch(err => console.warn('Could not connect to branding configurations, falling back to core styles:', err));
  }, [currentPath]);

  // Sync state with address bar URL on initial load
  useEffect(() => {
    const path = window.location.pathname;
    // Map root or any fallback path nicely
    const allowedPaths = [
      '/', 
      '/create', 
      '/create/certificate', 
      '/create/offer-letter', 
      '/create/internship-letter', 
      '/create/birth-certificate', 
      '/create/death-certificate', 
      '/templates', 
      '/how-it-works', 
      '/verify', 
      '/about', 
      '/admin'
    ];
    if (allowedPaths.includes(path) || path.startsWith('/verify/')) {
      setCurrentPath(path);
    } else {
      setCurrentPath('/');
    }
  }, []);

  // Listen to popstate event to make browser Back/Forward navigation fully work!
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setCurrentPath(window.location.pathname);
      setNavigationState(e.state);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Central Routing function
  const navigate = (path: string, state?: any) => {
    window.history.pushState(state, '', path);
    setCurrentPath(path);
    setNavigationState(state);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  };

  // Nav Links Configuration (Top Bar Contract Zone 2)
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Create', path: '/create' },
    { label: 'Templates', path: '/templates' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Verify', path: '/verify' },
    { label: 'About', path: '/about' },
  ];

  // Intercept and render Maintenance page for public visitors if enabled
  if (maintenance.enabled && currentPath !== '/admin') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col justify-center items-center px-4 py-16 font-sans select-none">
        <div className="max-w-md w-full bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-8 space-y-6 text-center animate-scale-in">
          
          <div className="flex justify-center">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Platform Logo" className="h-14 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                <ShieldCheck className="w-10 h-10" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight uppercase">
              {maintenance.title || "We'll Be Back Soon"}
            </h1>
            <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
              {maintenance.message || "DocuAI is currently undergoing scheduled maintenance."}
            </p>
          </div>

          {maintenance.estimatedReturn && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100/30 rounded-xl text-indigo-950 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
              <span>ESTIMATED RETURN:</span>
              <span className="text-indigo-600">{maintenance.estimatedReturn}</span>
            </div>
          )}

          {maintenance.contactEmail && (
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Contact Administration</span>
              <a href={`mailto:${maintenance.contactEmail}`} className="text-xs font-bold text-indigo-600 hover:underline">
                {maintenance.contactEmail}
              </a>
            </div>
          )}

          {maintenance.showAdminLogin && (
            <div className="pt-2">
              <button
                onClick={() => navigate('/admin')}
                className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 font-mono uppercase tracking-widest cursor-pointer hover:underline"
              >
                — Admin Entry Portal —
              </button>
            </div>
          )}

        </div>
        <div className="text-[10px] text-slate-400 mt-6 font-mono">{branding.footerText}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 selection:bg-indigo-100 selection:text-indigo-950 font-sans">
      
      {/* 3-ZONE TOP BAR CONTRACT nav header (no-print utility excludes it from print paper outputs!) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-3.5 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => navigate('/')}
            className="text-lg font-extrabold tracking-tight text-slate-900 hover:opacity-90 cursor-pointer transition-all flex items-center gap-2"
          >
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Platform Logo" className="w-5 h-5 object-contain" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            )}
            <span>{branding.platformName}</span>
          </button>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-colors relative py-1 cursor-pointer ${
                  currentPath === link.path
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {link.label}
                {currentPath === link.path && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-750 transition-colors cursor-pointer"
            >
              Draft Document
            </button>
          </div>

          {/* Responsive Hamburger Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Responsive mobile menu slide-down drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200/80 px-4 py-4 space-y-3 no-print">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`w-full text-left py-2 px-3 text-sm font-semibold rounded-lg capitalize ${
                  currentPath === link.path ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => navigate('/create')}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg text-center"
              >
                Draft Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page View Router Switcher */}
      <main className="flex-grow pt-4">
        <ErrorBoundary>
          {currentPath === '/' && (
            <HomeView onNavigate={navigate} />
          )}
          
          {currentPath.startsWith('/create') && (
            <ErrorBoundary>
              <CreateView
                onNavigate={navigate}
                initialPresetId={navigationState?.presetId}
                initialType={
                  navigationState?.type || 
                  (currentPath === '/create/certificate' ? 'certificate' :
                   currentPath === '/create/offer-letter' ? 'offer-letter' :
                   currentPath === '/create/internship-letter' ? 'internship-letter' :
                   currentPath === '/create/birth-certificate' ? 'birth-certificate' :
                   currentPath === '/create/death-certificate' ? 'death-certificate' : undefined)
                }
              />
            </ErrorBoundary>
          )}
          
          {currentPath === '/templates' && (
            <TemplatesView onNavigate={navigate} />
          )}
          
          {currentPath === '/how-it-works' && (
            <HowItWorksView />
          )}
          
          {currentPath.startsWith('/verify') && (
            <VerifyView initialCode={currentPath.startsWith('/verify/') ? currentPath.substring(8) : (navigationState?.code || new URLSearchParams(window.location.search).get('id') || undefined)} />
          )}
          
          {currentPath === '/about' && (
            <AboutView onNavigate={navigate} />
          )}
  
          {/* ADMIN PANEL AREA - Secure Admin Dashboard View */}
          {currentPath === '/admin' && (
            <AdminView onNavigate={navigate} />
          )}
        </ErrorBoundary>
      </main>

      {/* Footers with exact non-telemetry elements */}
      <footer className="bg-slate-900 text-white mt-16 py-12 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-base tracking-tight text-white">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Platform Logo" className="w-5 h-5 object-contain" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              )}
              <span>{branding.platformName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Professional credential drafting powered by visual guidelines and platform verification ledgers.
            </p>
          </div>

          {/* Column 2: Document links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Create Document</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-semibold">
              <li>
                <button onClick={() => navigate('/create', { type: 'certificate' })} className="hover:text-white transition-colors cursor-pointer">
                  Certificates
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/create', { type: 'offer-letter' })} className="hover:text-white transition-colors cursor-pointer">
                  Employment Offers
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/create', { type: 'internship-letter' })} className="hover:text-white transition-colors cursor-pointer">
                  Internship Letters
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Platform Directories</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-semibold">
              <li>
                <button onClick={() => navigate('/templates')} className="hover:text-white transition-colors cursor-pointer">
                  Design Presets
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  Technical Pillars
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/verify')} className="hover:text-white transition-colors cursor-pointer">
                  Verification Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Secure Administrator portal link */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Security Portal</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-semibold">
              <li>
                <button onClick={() => navigate('/admin')} className="inline-flex items-center gap-1.5 hover:text-white transition-colors text-amber-400 cursor-pointer">
                  <Lock className="w-3.5 h-3.5" />
                  Admin Console
                </button>
              </li>
              <li>
                <span className="text-[10px] text-slate-500 block font-mono">Secured with Client-Side Hashes</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Sub copyright and legal bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div>{branding.footerText}</div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400">Terms of Use</span>
            <span>·</span>
            <span className="hover:text-slate-400">Privacy Standards</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
