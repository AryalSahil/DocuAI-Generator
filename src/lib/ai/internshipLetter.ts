export interface InternshipLetterPromptParams {
  action: 'generate' | 'regenerate' | 'professional' | 'concise';
  formData: Record<string, any>;
  currentText?: string;
  userPrompt?: string;
}

export function buildInternshipLetterPrompt(params: InternshipLetterPromptParams): { systemInstruction: string; userPrompt: string } {
  const { action, formData, currentText, userPrompt } = params;

  const systemInstruction = `
    You are an elite academic credentials director at DocuAI. Your task is to draft a professional, appreciative, and clear internship completion verification paragraph.
    
    CRITICAL SAFETY RULES:
    1. Use ONLY the factual details explicitly provided in the parameters below.
    2. NEVER invent, guess, assume, or hallucinate any start dates, end dates, intern roles, university names, organization names, supervisor names, or achievements.
    3. If any detail is missing, do not guess or use brackets/placeholders (like [Date]). Synthesize the narrative around the known facts.
    4. Provide raw prose only. No markdown, no HTML, no brackets, no asterisks, no subject header, and no signature blocks.
  `;

  let promptText = '';

  if (action === 'generate') {
    promptText = `
      Draft an internship verification and performance summary paragraph using ONLY these verified parameters:
      - Student/Intern Name: "${formData.recipientName}"
      - Academic Institution: "${formData.collegeInstitution}"
      - Organization Name: "${formData.organization}"
      - Internship Role: "${formData.internRole}"
      - Department: "${formData.department}"
      - Timeline: "${formData.issueDate} to ${formData.endDate}"
      - Supervisor: "${formData.signatoryName} (${formData.signatoryTitle})"
      - Projects/Remarks Highlights: "${formData.body || userPrompt || 'demonstrating strong capability'}"
      
      Write a single, polished paragraph confirming successful completion and describing their contributions and performance based ONLY on the supplied remarks.
    `;
  } else if (action === 'regenerate') {
    promptText = `
      Rewrite the following internship verification paragraph using alternative phrasing, keeping all original parameters and facts:
      "${currentText || formData.body}"
    `;
  } else if (action === 'professional') {
    promptText = `
      Elevate this internship verification statement to sound highly authoritative, academic, and corporate-compliant. Do not invent any new facts or milestones:
      "${currentText || formData.body}"
    `;
  } else if (action === 'concise') {
    promptText = `
      Condense this internship verification paragraph to be direct, sharp, and concise, while preserving all dates, roles, and names:
      "${currentText || formData.body}"
    `;
  }

  return { systemInstruction, userPrompt: promptText.trim() };
}
