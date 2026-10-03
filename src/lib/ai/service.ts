import { buildCertificatePrompt } from './certificate';
import { buildOfferLetterPrompt } from './offerLetter';
import { buildInternshipLetterPrompt } from './internshipLetter';

export interface AiGenerationParams {
  type: 'certificate' | 'offer-letter' | 'internship-letter';
  action: 'generate' | 'regenerate' | 'professional' | 'concise';
  formData: Record<string, any>;
  currentText?: string;
  userPrompt?: string;
}

// Unified delegation handler for prompt construction
export function buildAiPrompt(params: AiGenerationParams): { systemInstruction: string; userPrompt: string } {
  const { type, action, formData, currentText, userPrompt } = params;

  switch (type) {
    case 'certificate':
      return buildCertificatePrompt({ action, formData, currentText, userPrompt });
    case 'offer-letter':
      return buildOfferLetterPrompt({ action, formData, currentText, userPrompt });
    case 'internship-letter':
      return buildInternshipLetterPrompt({ action, formData, currentText, userPrompt });
    default:
      throw new Error(`Unsupported document type: ${type}`);
  }
}
