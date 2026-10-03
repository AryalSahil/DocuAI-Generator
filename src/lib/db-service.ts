import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATE_REGISTRY } from '../data/templateRegistry';

// Resolve directory path safely for both ES Modules and Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, '../data/db.json');

// Retrieve Environment keys for true Supabase integration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export let supabase: any = null;
const isRealSupabase = !!(supabaseUrl && supabaseKey);

if (isRealSupabase) {
  try {
    supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log('[Supabase Service] Real Supabase client successfully initialized.');
  } catch (err) {
    console.error('[Supabase Service] Failed to initialize real Supabase client:', err);
  }
} else {
  console.log('[Supabase Service] Real credentials not found. Falling back to persistent Local JSON Database Engine.');
}

// Ensure local db.json exists with seed structure
function ensureLocalDbFile() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    // Initial Seed Data
    const initialDb = {
      document_types: [
        { id: 'certificate', name: 'Verified Certificate', description: 'Formal, royal templates for achievements and credentials.', active: true },
        { id: 'offer-letter', name: 'Employment Offer Letter', description: 'Corporate layout agreements for executive offers.', active: true },
        { id: 'internship-letter', name: 'Internship Verification', description: 'Academic completion credentials for student cohorts.', active: true },
      ],
      templates: TEMPLATE_REGISTRY.map(t => ({
        id: t.id,
        name: t.name,
        document_type_id: t.type,
        description: t.description,
        template_config: { htmlStructure: t.htmlStructure, category: t.category },
        preview_image: t.thumbnailClass,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      documents: [] as any[],
      verification: [] as any[],
      settings: {
        branding: {
          platformName: "DocuAI Generator",
          logoUrl: "",
          faviconUrl: "",
          primaryColor: "#4f46e5",
          footerText: "© 2026 DocuAI Generator. All rights reserved.",
          contactDetails: "support@docuai.org"
        },
        ai_settings: {
          enabled: true,
          provider: "gemini",
          prompt_certificate: "Write a formal certificate description with achievements, titles, and legal sign-offs.",
          prompt_offer_letter: "Write a detailed, legally robust employment contract offer summary with base salaries, start dates, and probation covenants.",
          prompt_internship: "Write an internship completion credential detailing technical hours, project milestones, and student performance metrics."
        }
      }
    };
    
    // Create data directory if it doesn't exist
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    console.log('[JSON DB Engine] New db.json persisted with default seeds.');
  }
}

// Read whole JSON DB
function readLocalDb() {
  ensureLocalDbFile();
  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[JSON DB Engine] Error reading db.json:', err);
    return { document_types: [], templates: [], documents: [], verification: [] };
  }
}

// Save whole JSON DB
function saveLocalDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[JSON DB Engine] Error writing db.json:', err);
  }
}

/**
 * High-performance full-stack Database Controller
 */
export const dbService = {
  /**
   * Database Seeding helper (safe to invoke on launch)
   */
  async seedDatabase() {
    if (isRealSupabase) {
      try {
        console.log('[Supabase Service] Executing automatic table check/seeding...');
        
        // 1. Seed document types
        const docTypes = [
          { id: 'certificate', name: 'Verified Certificate', description: 'Formal, royal templates for achievements and credentials.', active: true },
          { id: 'offer-letter', name: 'Employment Offer Letter', description: 'Corporate layout agreements for executive offers.', active: true },
          { id: 'internship-letter', name: 'Internship Verification', description: 'Academic completion credentials for student cohorts.', active: true },
        ];
        
        for (const dt of docTypes) {
          const { error } = await supabase.from('document_types').upsert(dt, { onConflict: 'id' });
          if (error) console.warn('[Supabase Seeding] Warning seeding document_type:', dt.id, error.message);
        }

        // 2. Seed templates
        const templates = TEMPLATE_REGISTRY.map(t => ({
          id: t.id,
          name: t.name,
          document_type_id: t.type,
          description: t.description,
          template_config: { htmlStructure: t.htmlStructure, category: t.category },
          preview_image: t.thumbnailClass,
          active: true
        }));
        
        for (const t of templates) {
          const { error } = await supabase.from('templates').upsert(t, { onConflict: 'id' });
          if (error) console.warn('[Supabase Seeding] Warning seeding template:', t.id, error.message);
        }
        
        console.log('[Supabase Service] Dynamic database seeding finalized.');
      } catch (e: any) {
        console.error('[Supabase Service] Error during real-Supabase seeding:', e.message || e);
      }
    } else {
      ensureLocalDbFile();
    }
  },

  /**
   * Fetch active document types
   */
  async getDocumentTypes() {
    if (isRealSupabase) {
      const { data, error } = await supabase.from('document_types').select('*').eq('active', true);
      if (error) throw error;
      return data;
    } else {
      const db = readLocalDb();
      return db.document_types.filter((d: any) => d.active);
    }
  },

  /**
   * Fetch active templates
   */
  async getTemplates() {
    if (isRealSupabase) {
      const { data, error } = await supabase.from('templates').select('*').eq('active', true);
      if (error) throw error;
      return data;
    } else {
      const db = readLocalDb();
      return db.templates.filter((t: any) => t.active);
    }
  },

  /**
   * Save a newly compiled physical document
   */
  async createDocument(params: {
    document_type_id: string;
    template_id: string;
    recipient_name: string;
    organization_name: string;
    document_data: any;
    generated_content: string;
    pdf_url?: string;
    docx_url?: string;
    verification_code: string;
  }) {
    if (isRealSupabase) {
      // Fetch current count to assign accurate, sequential document_id
      const { count, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      const nextNum = (count || 0) + 1;
      const document_id = `DOC-2026-${String(nextNum).padStart(6, '0')}`;

      // Insert into documents
      const newDoc = {
        document_id,
        document_type_id: params.document_type_id,
        template_id: params.template_id,
        recipient_name: params.recipient_name,
        organization_name: params.organization_name,
        document_data: params.document_data,
        generated_content: params.generated_content,
        pdf_url: params.pdf_url || '',
        docx_url: params.docx_url || '',
        status: 'Valid'
      };

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert(newDoc)
        .select('*')
        .single();

      if (docError) throw docError;

      // Insert corresponding verification ledger record
      const verificationRecord = {
        document_id,
        verification_code: params.verification_code,
        status: 'Valid'
      };

      const { error: verError } = await supabase
        .from('verification')
        .insert(verificationRecord);

      if (verError) throw verError;

      return docData;
    } else {
      const db = readLocalDb();
      
      const nextNum = db.documents.length + 1;
      const document_id = `DOC-2026-${String(nextNum).padStart(6, '0')}`;

      const newDoc = {
        id: crypto.randomUUID?.() || `uuid-${Math.random().toString(36).substr(2, 9)}`,
        document_id,
        document_type_id: params.document_type_id,
        template_id: params.template_id,
        recipient_name: params.recipient_name,
        organization_name: params.organization_name,
        document_data: params.document_data,
        generated_content: params.generated_content,
        pdf_url: params.pdf_url || '',
        docx_url: params.docx_url || '',
        status: 'Valid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const verificationRecord = {
        id: crypto.randomUUID?.() || `uuid-${Math.random().toString(36).substr(2, 9)}`,
        document_id,
        verification_code: params.verification_code,
        status: 'Valid',
        created_at: new Date().toISOString(),
        revoked_at: null
      };

      db.documents.push(newDoc);
      db.verification.push(verificationRecord);
      saveLocalDb(db);

      return newDoc;
    }
  },

  /**
   * Fetch verification card ledger status
   */
  async getVerificationStatus(documentId: string) {
    if (isRealSupabase) {
      // Try fetching matching document directly
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();

      if (docError) throw docError;
      if (!document) return null;

      // Fetch verification status
      const { data: ver, error: verError } = await supabase
        .from('verification')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();

      if (verError) throw verError;

      return {
        document_id: document.document_id,
        document_type_id: document.document_type_id,
        recipient_name: document.recipient_name,
        organization_name: document.organization_name,
        created_at: document.created_at,
        pdf_url: document.pdf_url,
        docx_url: document.docx_url,
        status: ver ? ver.status : document.status
      };
    } else {
      const db = readLocalDb();
      const document = db.documents.find((d: any) => d.document_id === documentId);
      if (!document) return null;

      const ver = db.verification.find((v: any) => v.document_id === documentId);

      return {
        document_id: document.document_id,
        document_type_id: document.document_type_id,
        recipient_name: document.recipient_name,
        organization_name: document.organization_name,
        created_at: document.created_at,
        pdf_url: document.pdf_url,
        docx_url: document.docx_url,
        status: ver ? ver.status : document.status
      };
    }
  },

  /**
   * Revoke an active, verified credential
   */
  async revokeDocument(documentId: string) {
    if (isRealSupabase) {
      // Update documents table status
      const { error: docError } = await supabase
        .from('documents')
        .update({ status: 'Revoked', updated_at: new Date().toISOString() })
        .eq('document_id', documentId);

      if (docError) throw docError;

      // Update verification table status
      const { error: verError } = await supabase
        .from('verification')
        .update({ status: 'Revoked', revoked_at: new Date().toISOString() })
        .eq('document_id', documentId);

      if (verError) throw verError;
      return true;
    } else {
      const db = readLocalDb();
      const document = db.documents.find((d: any) => d.document_id === documentId);
      if (!document) return false;

      document.status = 'Revoked';
      document.updated_at = new Date().toISOString();

      const ver = db.verification.find((v: any) => v.document_id === documentId);
      if (ver) {
        ver.status = 'Revoked';
        ver.revoked_at = new Date().toISOString();
      }

      saveLocalDb(db);
      return true;
    }
  },

  /**
   * Save (Insert/Update) a Template configuration dynamically
   */
  async saveTemplate(tpl: any) {
    if (isRealSupabase) {
      const { error } = await supabase
        .from('templates')
        .upsert({
          id: tpl.id,
          name: tpl.name,
          document_type_id: tpl.document_type_id,
          description: tpl.description,
          template_config: tpl.template_config || {},
          preview_image: tpl.preview_image || '',
          active: tpl.active !== undefined ? tpl.active : true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      if (error) throw error;
      return tpl;
    } else {
      const db = readLocalDb();
      const existingIdx = db.templates.findIndex((t: any) => t.id === tpl.id);
      
      const updatedTpl = {
        id: tpl.id,
        name: tpl.name,
        document_type_id: tpl.document_type_id,
        description: tpl.description,
        template_config: tpl.template_config || {},
        preview_image: tpl.preview_image || '',
        active: tpl.active !== undefined ? tpl.active : true,
        created_at: existingIdx !== -1 ? db.templates[existingIdx].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        db.templates[existingIdx] = updatedTpl;
      } else {
        db.templates.push(updatedTpl);
      }
      
      saveLocalDb(db);
      return updatedTpl;
    }
  },

  /**
   * Delete a template from service registry
   */
  async deleteTemplate(id: string) {
    if (isRealSupabase) {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const db = readLocalDb();
      const idx = db.templates.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        db.templates.splice(idx, 1);
        saveLocalDb(db);
        return true;
      }
      return false;
    }
  },

  /**
   * Save (Insert/Update) a Document Type dynamically
   */
  async saveDocumentType(dt: any) {
    if (isRealSupabase) {
      const { error } = await supabase
        .from('document_types')
        .upsert({
          id: dt.id,
          name: dt.name,
          description: dt.description,
          active: dt.active !== undefined ? dt.active : true,
          field_schema: dt.field_schema || {}
        }, { onConflict: 'id' });
      if (error) throw error;
      return dt;
    } else {
      const db = readLocalDb();
      const existingIdx = db.document_types.findIndex((d: any) => d.id === dt.id);
      
      const updatedDt = {
        id: dt.id,
        name: dt.name,
        description: dt.description,
        active: dt.active !== undefined ? dt.active : true,
        field_schema: dt.field_schema || {},
        created_at: existingIdx !== -1 ? db.document_types[existingIdx].created_at : new Date().toISOString()
      };

      if (existingIdx !== -1) {
        db.document_types[existingIdx] = updatedDt;
      } else {
        db.document_types.push(updatedDt);
      }
      
      saveLocalDb(db);
      return updatedDt;
    }
  },

  /**
   * Delete a document type from service index
   */
  async deleteDocumentType(id: string) {
    if (isRealSupabase) {
      const { error } = await supabase.from('document_types').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const db = readLocalDb();
      const idx = db.document_types.findIndex((d: any) => d.id === id);
      if (idx !== -1) {
        db.document_types.splice(idx, 1);
        saveLocalDb(db);
        return true;
      }
      return false;
    }
  },

  /**
   * Fetch platform settings by key ('branding' or 'ai_settings')
   */
  async getSettings(key: string) {
    const defaultBranding = {
      platformName: "DocuAI Generator",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#4f46e5",
      footerText: "© 2026 DocuAI Generator. All rights reserved.",
      contactDetails: "support@docuai.org"
    };

    const defaultAiSettings = {
      enabled: true,
      provider: "gemini",
      prompt_certificate: "Write a formal certificate description with achievements, titles, and legal sign-offs.",
      prompt_offer_letter: "Write a detailed, legally robust employment contract offer summary with base salaries, start dates, and probation covenants.",
      prompt_internship: "Write an internship completion credential detailing technical hours, project milestones, and student performance metrics."
    };

    const fallback = key === 'branding' ? defaultBranding : defaultAiSettings;

    if (isRealSupabase) {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('key', key)
          .maybeSingle();
        
        if (!error && data) {
          return { ...fallback, ...data.value };
        }
        return fallback;
      } catch (e) {
        return fallback;
      }
    } else {
      const db = readLocalDb();
      if (!db.settings) {
        db.settings = {
          branding: defaultBranding,
          ai_settings: defaultAiSettings
        };
        saveLocalDb(db);
      }
      return db.settings[key] || fallback;
    }
  },

  /**
   * Save platform settings by key
   */
  async saveSettings(key: string, value: any) {
    if (isRealSupabase) {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      if (error) throw error;
      return value;
    } else {
      const db = readLocalDb();
      if (!db.settings) {
        db.settings = {};
      }
      db.settings[key] = value;
      saveLocalDb(db);
      return value;
    }
  }
};
