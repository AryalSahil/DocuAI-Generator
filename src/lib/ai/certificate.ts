export interface CertificatePromptParams {
  action: 'generate' | 'regenerate' | 'professional' | 'concise';
  formData: Record<string, any>;
  currentText?: string;
  userPrompt?: string;
}

export function buildCertificatePrompt(params: CertificatePromptParams): { systemInstruction: string; userPrompt: string } {
  const { action, formData, currentText, userPrompt } = params;

  const systemInstruction = `
    You are an elite, prestigious credentials writer at DocuAI. Your task is to write high-fidelity, polished, and legitimate certificate achievement statements.
    
    CRITICAL SAFETY RULES:
    1. Use ONLY the factual details explicitly provided in the parameters below.
    2. NEVER invent, guess, assume, or hallucinate any dates, credentials, achievements, organizations, or supervisor names.
    3. If any field or detail is missing, do not make it up, do not use brackets/placeholders (like [Date]). Craft the sentence naturally without mentioning it.
    4. Provide raw prose only. No markdown, no HTML, no brackets, no asterisks, no subject header, and no signature blocks.
  `;

  let promptText = '';

  if (action === 'generate') {
    promptText = `
      Draft a prestigious certificate achievement statement using ONLY these verified facts:
      - Recipient Name: "${formData.recipientName}"
      - Certificate Title: "${formData.docTitle}"
      - Organization Name: "${formData.organization}"
      - Accomplishments/Achievements: "${formData.body || userPrompt || 'extraordinary achievement'}"
      - Publication Date: "${formData.issueDate}"
      - Certificate ID: "${formData.certificateId}"
      
      Write a single, inspiring, executive paragraph in the third-person. Start with something classic and elegant like "This certificate is proudly conferred upon..." or "In recognition of exceptional dedication, we hereby award..."
    `;
  } else if (action === 'regenerate') {
    promptText = `
      Rewrite the following certificate achievement statement using different formal vocabulary but retaining the exact same details:
      "${currentText || formData.body}"
    `;
  } else if (action === 'professional') {
    promptText = `
      Elevate the vocabulary and syntax of the following certificate statement to sound extremely formal, inspiring, and prestigious. Do not invent any new facts or milestones:
      "${currentText || formData.body}"
    `;
  } else if (action === 'concise') {
    promptText = `
      Condense the following certificate statement to be short, compact, and extremely punchy, while retaining every original detail:
      "${currentText || formData.body}"
    `;
  }

  return { systemInstruction, userPrompt: promptText.trim() };
}
