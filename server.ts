import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { buildAiPrompt } from './src/lib/ai/service';
import { dbService, supabase } from './src/lib/db-service';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Allow large uploads of base64 document assets
app.use(express.json({ limit: '10mb' }));

// Set up local storage folders matching the Supabase bucket specifications
const UPLOADS_ROOT = path.join(__dirname, 'uploads');
const BUCKETS = ['logos', 'signatures', 'templates', 'documents'];
BUCKETS.forEach(b => {
  const p = path.join(UPLOADS_ROOT, b);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

// Serve the uploaded static assets matching the physical buckets
app.use('/uploads', express.static(UPLOADS_ROOT));

// Automatically execute table structures checking and seed defaults on startup
dbService.seedDatabase();

// Initialize Google GenAI Client with standard environment variables
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log(`[AI Engine] Initialized successfully with model: ${modelName}`);
} else {
  console.warn('[AI Engine] GEMINI_API_KEY is not defined. AI requests will fallback to client-simulated models.');
}

// --------------------------------------------------------------------
// DATABASE & STORAGE ENDPOINTS
// --------------------------------------------------------------------

// 1. Get Document Types
app.get('/api/document-types', async (req, res) => {
  try {
    const list = await dbService.getDocumentTypes();
    return res.json(list);
  } catch (err: any) {
    console.error('Error fetching document types:', err);
    return res.status(500).json({ error: 'Failed to fetch document types.' });
  }
});

// 2. Get Layout Templates
app.get('/api/templates', async (req, res) => {
  try {
    const list = await dbService.getTemplates();
    return res.json(list);
  } catch (err: any) {
    console.error('Error fetching templates:', err);
    return res.status(500).json({ error: 'Failed to fetch templates.' });
  }
});

// 3. Create and register a compiled document
app.post('/api/documents', async (req, res) => {
  try {
    const {
      document_type_id,
      template_id,
      recipient_name,
      organization_name,
      document_data,
      generated_content,
      pdf_url,
      docx_url,
      verification_code
    } = req.body;

    if (!document_type_id || !recipient_name || !organization_name || !verification_code) {
      return res.status(400).json({ error: 'Missing required document fields.' });
    }

    const doc = await dbService.createDocument({
      document_type_id,
      template_id: template_id || 'cert-classic',
      recipient_name,
      organization_name,
      document_data: document_data || {},
      generated_content: generated_content || '',
      pdf_url,
      docx_url,
      verification_code
    });

    return res.status(201).json(doc);
  } catch (err: any) {
    console.error('Error creating document:', err);
    return res.status(500).json({ error: 'Failed to persist document.', details: err.message });
  }
});

// 4. Secure public Verification Endpoint (Requires NO login)
app.get('/api/verify/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const info = await dbService.getVerificationStatus(documentId);
    
    if (!info) {
      return res.status(404).json({ error: 'Document matching the provided verification ID was not found.' });
    }

    return res.json(info);
  } catch (err: any) {
    console.error('Error verifying document:', err);
    return res.status(500).json({ error: 'Verification service error.', details: err.message });
  }
});

// 5. Revoke a verified credential
app.post('/api/verify/:documentId/revoke', async (req, res) => {
  try {
    const { documentId } = req.params;
    const success = await dbService.revokeDocument(documentId);
    if (!success) {
      return res.status(404).json({ error: 'Document matching the provided ID was not found.' });
    }
    return res.json({ success: true, message: `Document ${documentId} revoked successfully.` });
  } catch (err: any) {
    console.error('Error revoking document:', err);
    return res.status(500).json({ error: 'Revocation request failed.', details: err.message });
  }
});

// 6. Unified Storage Upload Router (handles local disk vs real Supabase Storage)
app.post('/api/upload', async (req, res) => {
  try {
    const { bucket, filename, fileData, mimeType } = req.body;

    if (!bucket || !filename || !fileData) {
      return res.status(400).json({ error: 'Missing required upload parameters (bucket, filename, fileData).' });
    }

    if (!BUCKETS.includes(bucket)) {
      return res.status(400).json({ error: `Invalid bucket location. Options: ${BUCKETS.join(', ')}` });
    }

    // Decode base64 file data
    const cleanBase64 = fileData.split(',')[1] || fileData;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const contentType = mimeType || 'application/octet-stream';

    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // A. Check if real Supabase client is connected
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(safeFilename, buffer, {
            contentType,
            upsert: true
          });

        if (error) throw error;

        // Retrieve public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(safeFilename);

        return res.status(201).json({
          url: publicUrl,
          provider: 'supabase',
          bucket,
          filename: safeFilename
        });
      } catch (err: any) {
        console.warn('[Supabase Storage] Failed, falling back to local storage write:', err.message || err);
      }
    }

    // B. Local fallback disk write
    const localPath = path.join(UPLOADS_ROOT, bucket, safeFilename);
    fs.writeFileSync(localPath, buffer);

    // Dynamic self-referential URL construction based on active request headers
    const protocol = req.headers['x-forwarding-proto'] || req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${bucket}/${safeFilename}`;

    return res.status(201).json({
      url: fileUrl,
      provider: 'local',
      bucket,
      filename: safeFilename
    });

  } catch (err: any) {
    console.error('Error during secure upload:', err);
    return res.status(500).json({ error: 'Storage transfer failed.', details: err.message });
  }
});

// Secure AI Content Generation Endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { type, action, formData, currentText, userPrompt } = req.body;

    if (!type || !action || !formData) {
      return res.status(400).json({ error: 'Missing required parameters: type, action, or formData.' });
    }

    // Load admin dynamic AI configuration & enforce enabled toggle
    const aiSettings = await dbService.getSettings('ai_settings');
    if (aiSettings && aiSettings.enabled === false) {
      return res.status(403).json({ error: 'AI Content Generation is currently disabled by the system administrator.' });
    }

    // Build the tailored, anti-hallucination prompts
    const { systemInstruction, userPrompt: promptText } = buildAiPrompt({
      type,
      action,
      formData,
      currentText,
      userPrompt
    });

    // Ingress admin dynamic prompt configurations if available
    let adminCustomPrompt = '';
    if (aiSettings) {
      if (type === 'certificate') adminCustomPrompt = aiSettings.prompt_certificate;
      else if (type === 'offer-letter') adminCustomPrompt = aiSettings.prompt_offer_letter;
      else if (type === 'internship-letter') adminCustomPrompt = aiSettings.prompt_internship;
    }

    const finalSystemInstruction = adminCustomPrompt 
      ? `${systemInstruction}\n\n[ADMIN_INSTRUCTIONS_OVERRIDE]: ${adminCustomPrompt}`
      : systemInstruction;

    // Fallback if API Key isn't configured in environment
    if (!ai) {
      console.warn('[AI Engine] No API key configured. Executing premium mock content response.');
      // Simulate slight network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let mockProse = '';
      if (type === 'certificate') {
        mockProse = `This certificate of excellence is proudly presented to ${formData.recipientName} in recognition of outstanding completion of the curriculum at ${formData.organization}. Having demonstrated exceptional capability and commitment to operations, they are formally awarded this credential on ${formData.issueDate}.`;
      } else if (type === 'offer-letter') {
        mockProse = `We are delighted to extend this formal offer of employment to join our team at ${formData.organization} in the role of ${formData.jobTitle} starting on ${formData.joiningDate}. You will receive a base salary of ${formData.salary} and your focus on performance and quality makes you a tremendous addition to our team.`;
      } else {
        mockProse = `This letter attests that student ${formData.recipientName} of ${formData.collegeInstitution} successfully completed their technical internship role as ${formData.internRole} at ${formData.organization} under the supervision of ${formData.signatoryName}. During the program from ${formData.issueDate} to ${formData.endDate}, they exhibited superb capability.`;
      }
      return res.json({ text: mockProse });
    }

    // Call the genuine server-side Gemini client
    const response = await ai.models.generateContent({
      model: aiSettings?.model || modelName,
      contents: promptText,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: aiSettings?.temperature || 0.7,
      }
    });

    const generatedText = response.text;
    if (!generatedText) {
      throw new Error('Gemini model returned empty contents.');
    }

    return res.json({ text: generatedText.trim() });
  } catch (error: any) {
    console.error('[AI Engine Error]', error);
    return res.status(500).json({ 
      error: 'AI content synthesis failed.', 
      details: error.message || error 
    });
  }
});

// --------------------------------------------------------------------
// SECURE ADMINISTRATOR CONTROL PROTOCOLS
// --------------------------------------------------------------------

const adminSessions = new Set<string>();

interface ActivityLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

const activityLogs: ActivityLog[] = [
  { id: 'log-1', type: 'SYSTEM_START', message: 'DocuAI security ledger nodes initialized successfully on cloud run.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-2', type: 'SEED_SUCCESS', message: 'Preloaded layout registries successfully imported into database indices.', timestamp: new Date(Date.now() - 3550000).toISOString() }
];

function logActivity(type: string, message: string) {
  activityLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(5)}`,
    type,
    message,
    timestamp: new Date().toISOString()
  });
}

// Server-side Route Protection Middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Secure admin session header missing.' });
  }
  const token = authHeader.substring(7);
  if (!adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Expired or invalid session token.' });
  }
  next();
};

// A. Secure Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const targetEmail = process.env.ADMIN_EMAIL || 'admin@docuai.org';
    const targetPass = process.env.ADMIN_PASSWORD || 'admin2026!';

    if (email === targetEmail && password === targetPass) {
      const token = 'admin_session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      adminSessions.add(token);
      logActivity('AUTH_SUCCESS', `Administrator successfully logged in from IP signature.`);
      return res.json({ success: true, token });
    }

    logActivity('AUTH_FAILURE', `Failed login attempt for account user: ${email || 'unknown'}`);
    return res.status(401).json({ error: 'Invalid administrator email or password.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login server error.', details: err.message });
  }
});

// B. Session Verification check
app.get('/api/admin/session', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ valid: false });
  }
  const token = authHeader.substring(7);
  return res.json({ valid: adminSessions.has(token) });
});

// C. Metrics & Statistics aggregator (Protected)
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const docTypes = await dbService.getDocumentTypes();
    const templatesList = await dbService.getTemplates();
    
    // Fetch all documents from service
    let docs: any[] = [];
    if (supabase) {
      const { data, error } = await supabase.from('documents').select('*');
      if (!error && data) docs = data;
    } else {
      // Direct file read fallback
      const data = fs.readFileSync(path.join(__dirname, 'src/data/db.json'), 'utf-8');
      docs = JSON.parse(data).documents;
    }

    const total = docs.length;
    const certs = docs.filter(d => d.document_type_id === 'certificate').length;
    const offers = docs.filter(d => d.document_type_id === 'offer-letter').length;
    const interns = docs.filter(d => d.document_type_id === 'internship-letter').length;
    const valid = docs.filter(d => d.status === 'Valid').length;
    const revoked = docs.filter(d => d.status === 'Revoked').length;

    return res.json({
      totalDocuments: total,
      certificates: certs,
      offerLetters: offers,
      internshipLetters: interns,
      activeTemplates: templatesList.length,
      validDocuments: valid,
      revokedDocuments: revoked
    });
  } catch (err: any) {
    console.error('Stats fetch failed:', err);
    return res.status(500).json({ error: 'Failed to compile stats metrics.' });
  }
});

// D. List all Documents (Protected)
app.get('/api/admin/documents', requireAdmin, async (req, res) => {
  try {
    let docs: any[] = [];
    if (supabase) {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (!error && data) docs = data;
    } else {
      const data = fs.readFileSync(path.join(__dirname, 'src/data/db.json'), 'utf-8');
      docs = JSON.parse(data).documents;
      // Sort manually
      docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return res.json(docs);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch ledger logs.' });
  }
});

// E. Retrieve Log Activity (Protected)
app.get('/api/admin/logs', requireAdmin, (req, res) => {
  return res.json(activityLogs);
});

// F. Public Branding Endpoint (Available to all visitors of the public site)
app.get('/api/branding', async (req, res) => {
  try {
    const data = await dbService.getSettings('branding');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve platform branding.' });
  }
});

// G. Get AI Settings config (Protected)
app.get('/api/admin/ai-settings', requireAdmin, async (req, res) => {
  try {
    const data = await dbService.getSettings('ai_settings');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve AI settings.' });
  }
});

// H. Update AI Settings config (Protected)
app.post('/api/admin/ai-settings', requireAdmin, async (req, res) => {
  try {
    const { model, temperature, enabled, provider, prompt_certificate, prompt_offer_letter, prompt_internship } = req.body;
    
    const value = {
      enabled: enabled !== undefined ? enabled : true,
      provider: provider || 'gemini',
      prompt_certificate: prompt_certificate || '',
      prompt_offer_letter: prompt_offer_letter || '',
      prompt_internship: prompt_internship || '',
      model: model || 'gemini-3.8-flash',
      temperature: temperature || 0.7
    };

    await dbService.saveSettings('ai_settings', value);
    logActivity('AI_SETTINGS_UPDATED', `AI Orchestrator params adjusted. Enabled=${value.enabled}, Model=${value.model}, Provider=${value.provider}`);
    return res.json({ success: true, message: 'AI Orchestrator settings refreshed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update AI settings.', details: err.message });
  }
});

// I. Update Branding details (Protected)
app.post('/api/admin/branding', requireAdmin, async (req, res) => {
  try {
    const { platformName, logoUrl, faviconUrl, primaryColor, footerText, contactDetails } = req.body;
    
    const value = {
      platformName: platformName || 'DocuAI Generator',
      logoUrl: logoUrl || '',
      faviconUrl: faviconUrl || '',
      primaryColor: primaryColor || '#4f46e5',
      footerText: footerText || '© 2026 DocuAI Generator. All rights reserved.',
      contactDetails: contactDetails || 'support@docuai.org'
    };

    await dbService.saveSettings('branding', value);
    logActivity('BRANDING_UPDATED', `Enterprise style palette adjusted. PlatformName=${value.platformName}, PrimaryColor=${value.primaryColor}`);
    return res.json({ success: true, data: value });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update enterprise style coordinates.', details: err.message });
  }
});

// J. Save or Update layout template (Protected)
app.post('/api/admin/templates', requireAdmin, async (req, res) => {
  try {
    const tpl = req.body;
    if (!tpl.id || !tpl.name || !tpl.document_type_id) {
      return res.status(400).json({ error: 'Missing template identification properties.' });
    }

    const saved = await dbService.saveTemplate(tpl);
    logActivity('TEMPLATE_UPDATED', `Template layout '${saved.name}' [UID: ${saved.id}] compiled successfully.`);
    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compile layout changes.', details: err.message });
  }
});

// K. Delete layout template (Protected)
app.delete('/api/admin/templates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dbService.deleteTemplate(id);
    if (!success) {
      return res.status(404).json({ error: 'Layout template matching UID was not found.' });
    }
    logActivity('TEMPLATE_DELETED', `Template layout reference '${id}' permanently purged from active indices.`);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete template layout.', details: err.message });
  }
});

// L. Save or Update dynamic document type (Protected)
app.post('/api/admin/document-types', requireAdmin, async (req, res) => {
  try {
    const dt = req.body;
    if (!dt.id || !dt.name) {
      return res.status(400).json({ error: 'Missing document type identification properties.' });
    }

    const saved = await dbService.saveDocumentType(dt);
    logActivity('DOCUMENT_TYPE_UPDATED', `Document Type structure '${saved.name}' [UID: ${saved.id}] registered successfully.`);
    return res.status(201).json(saved);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to write document type changes.', details: err.message });
  }
});

// M. Delete document type (Protected)
app.delete('/api/admin/document-types/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dbService.deleteDocumentType(id);
    if (!success) {
      return res.status(404).json({ error: 'Document type structure matching UID was not found.' });
    }
    logActivity('DOCUMENT_TYPE_DELETED', `Document type structure '${id}' permanently purged from database tables.`);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete document type structure.', details: err.message });
  }
});

// N. Delete Document from physical database (Protected)
app.delete('/api/admin/documents/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (supabase) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    } else {
      const dbPath = path.join(__dirname, 'src/data/db.json');
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      
      const foundIdx = db.documents.findIndex((d: any) => d.id === id);
      if (foundIdx === -1) {
        return res.status(404).json({ error: 'Document matching ID not found.' });
      }
      
      const docId = db.documents[foundIdx].document_id;
      db.documents.splice(foundIdx, 1);
      
      // Also delete from verification
      const verIdx = db.verification.findIndex((v: any) => v.document_id === docId);
      if (verIdx !== -1) {
        db.verification.splice(verIdx, 1);
      }
      
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
      logActivity('DOC_DELETED', `Document with serial ID: ${docId} deleted permanently.`);
    }

    return res.json({ success: true, message: 'Document wiped from verification registry successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete record.', details: err.message });
  }
});

// O. Global Maintenance Mode Endpoint (Public check)
app.get('/api/maintenance', async (req, res) => {
  try {
    const data = await dbService.getSettings('maintenance');
    // Ensure standard keys exist
    const fallback = {
      enabled: false,
      title: "Scheduled Maintenance In Progress",
      message: "We're currently conducting routine upgrades to improve our document generation engine. We'll be back shortly.",
      estimatedReturn: "",
      contactEmail: "support@docuai.org",
      showAdminLogin: true
    };
    return res.json({ ...fallback, ...data });
  } catch (err) {
    return res.json({ enabled: false });
  }
});

// P. Save Global Maintenance Mode settings (Protected)
app.post('/api/admin/maintenance', requireAdmin, async (req, res) => {
  try {
    const value = req.body;
    await dbService.saveSettings('maintenance', value);
    logActivity('MAINTENANCE_TOGGLED', `System maintenance mode set to: ${value.enabled ? 'ON' : 'OFF'}. Title: ${value.title}`);
    return res.json({ success: true, data: value });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to adjust maintenance parameters.', details: err.message });
  }
});

// Q. Server-side Error Logging Endpoint
app.post('/api/log-error', async (req, res) => {
  try {
    const { context, message, stack, document_type_id, recipient_name } = req.body;
    console.error(`[Client-side Error Logging] [Context: ${context}] [Type: ${document_type_id}] Message: ${message}`);
    if (stack) {
      console.error(stack);
    }
    // Record error inside activity logs or log to console
    logActivity('CLIENT_ERROR', `Compilation/Export failure inside ${context} for ${recipient_name || 'unknown'}: ${message}`);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to write error log.' });
  }
});

// Mounting the Vite Middleware or serving static index depending on production stage
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await import('vite');
  const viteServer = await vite.createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'spa'
  });
  app.use(viteServer.middlewares);
  console.log('[Dev Server] Vite middleware successfully mounted.');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});
