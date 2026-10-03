export interface OfferLetterPromptParams {
  action: 'generate' | 'regenerate' | 'professional' | 'concise';
  formData: Record<string, any>;
  currentText?: string;
  userPrompt?: string;
}

export function buildOfferLetterPrompt(params: OfferLetterPromptParams): { systemInstruction: string; userPrompt: string } {
  const { action, formData, currentText, userPrompt } = params;

  const systemInstruction = `
    You are an elite, executive HR compliance copywriter at DocuAI. Your task is to draft a professional, welcoming, and compliant employment offer letter introduction.
    
    CRITICAL SAFETY RULES:
    1. Use ONLY the factual details explicitly provided in the parameters below.
    2. NEVER invent, guess, assume, or hallucinate any start dates, job titles, salary numbers, company names, department names, work locations, or perks.
    3. If any field or detail is missing, do not guess or use brackets/placeholders (like [Date]). Build the sentence around the known facts.
    4. Provide raw prose only. No markdown, no HTML, no brackets, no asterisks, no subject header, and no signature blocks.
  `;

  let promptText = '';

  if (action === 'generate') {
    promptText = `
      Draft a formal and welcoming introductory paragraph for an employment offer letter using ONLY these verified parameters:
      - Candidate Name: "${formData.recipientName}"
      - Company Name: "${formData.organization}"
      - Job Title: "${formData.jobTitle}"
      - Department: "${formData.department}"
      - Compensation/Salary: "${formData.salary}"
      - Start Date: "${formData.joiningDate}"
      - Key Duties/Achievements details: "${formData.body || userPrompt || 'contributing to our core team'}"
      
      Write a single, polished paragraph welcoming them to the team, expressing confidence in their capabilities based ONLY on the supplied details.
    `;
  } else if (action === 'regenerate') {
    promptText = `
      Rewrite the following employment offer introduction paragraph with fresh, alternative vocabulary and sentence structure, preserving all factual details exactly:
      "${currentText || formData.body}"
    `;
  } else if (action === 'professional') {
    promptText = `
      Elevate the tone of this offer letter paragraph to sound highly formal, authoritative, and corporate-compliant. Do not add any new facts or guess any details:
      "${currentText || formData.body}"
    `;
  } else if (action === 'concise') {
    promptText = `
      Condense this offer letter paragraph to be direct, sharp, and concise, without losing any of the critical terms or numbers:
      "${currentText || formData.body}"
    `;
  }

  return { systemInstruction, userPrompt: promptText.trim() };
}
