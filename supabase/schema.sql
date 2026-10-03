-- ====================================================================
-- DocuAI Generator Schema Definition
-- Includes Tables, RLS Policies, and Storage Bucket Initializers
-- ====================================================================

-- 1. Create Document Types Table
CREATE TABLE IF NOT EXISTS document_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  field_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  document_type_id VARCHAR(255) NOT NULL,
  description TEXT,
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_image TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Documents Table (Sequential ID: DOC-2026-000001)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., DOC-2026-000001
  document_type_id VARCHAR(255) NOT NULL,
  template_id VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  document_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_content TEXT,
  pdf_url TEXT,
  docx_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Valid', -- Valid, Revoked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Verification Ledger Table
CREATE TABLE IF NOT EXISTS verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id VARCHAR(50) NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Valid', -- Valid, Revoked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create Platform Settings Table (Branding & AI prompts)
CREATE TABLE IF NOT EXISTS platform_settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) - "There is STILL NO PUBLIC USER LOGIN"
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Document Types: Public Read
CREATE POLICY "Allow public read-only access to document types" 
ON document_types FOR SELECT USING (true);

-- Templates: Public Read, Write for Admin
CREATE POLICY "Allow public read-only access to templates" 
ON templates FOR SELECT USING (true);

CREATE POLICY "Allow anyone to write templates" 
ON templates FOR ALL USING (true);

-- Documents: Public Insert & Read, Allow Update for Status/URLs
CREATE POLICY "Allow anyone to read documents for public verification" 
ON documents FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert new documents" 
ON documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update document status or download URLs" 
ON documents FOR UPDATE USING (true);

-- Verification: Public Read, Insert, and Update
CREATE POLICY "Allow anyone to read verification ledger records" 
ON verification FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert ledger records" 
ON verification FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update ledger records" 
ON verification FOR UPDATE USING (true);

-- Platform Settings: Public Read, Full access for administrative calls
CREATE POLICY "Allow public read access to platform settings" 
ON platform_settings FOR SELECT USING (true);

CREATE POLICY "Allow anyone to modify platform settings" 
ON platform_settings FOR ALL USING (true);

-- ====================================================================
-- STORAGE BUCKETS (Recommended Supabase Storage setup via dashboard)
-- Note: Create the following buckets in your Supabase Storage console:
--   1. 'logos' (Set to Public)
--   2. 'signatures' (Set to Public)
--   3. 'templates' (Set to Public)
--   4. 'documents' (Set to Public)
-- ====================================================================
