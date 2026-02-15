/**
 * Google Gemini AI Email Service
 * Generates professional B2B emails using Google Generative AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG, EMAIL_TEMPLATES } from '../constants';
import { EmailTemplateType, EmailGenerationContext } from '../types';

/**
 * AI Email Service
 */
class AIEmailService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_CONFIG.apiKey);
  }

  /**
   * Initialize model
   */
  private async getModel() {
    return this.genAI.getGenerativeModel({ model: GEMINI_CONFIG.model });
  }

  /**
   * Generate email using AI
   */
  async generateEmail(context: EmailGenerationContext): Promise<{
    subject: string;
    body: string;
  }> {
    try {
      if (!GEMINI_CONFIG.apiKey) {
        throw new Error(
          'Google Generative AI Key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.'
        );
      }

      const template = EMAIL_TEMPLATES[context.template_type];

      if (!template) {
        throw new Error(`Unknown email template: ${context.template_type}`);
      }

      const model = await this.getModel();
      const prompt = template.prompt({
        company_name: context.company_name,
        contact_name: context.contact_name,
        product_interest: context.product_interest,
        estimated_value: context.estimated_value,
        days_since: context.estimated_value ? undefined : 7,
      });

      // Generate email body
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const emailBody = response.text();

      // Generate subject line
      const subjectPrompt = this.generateSubjectPrompt(context.template_type, context.company_name);
      const subjectResult = await model.generateContent(subjectPrompt);
      const subjectResponse = await subjectResult.response;
      const emailSubject = subjectResponse.text().trim();

      return {
        subject: emailSubject.replace(/^["']|["']$/g, ''), // Remove quotes if present
        body: emailBody.trim(),
      };
    } catch (error) {
      console.error('Error generating email:', error);
      throw new Error(`Failed to generate email: ${(error as Error).message}`);
    }
  }

  /**
   * Generate email subject only
   */
  async generateEmailSubject(context: EmailGenerationContext): Promise<string> {
    try {
      if (!GEMINI_CONFIG.apiKey) {
        throw new Error(
          'Google Generative AI Key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.'
        );
      }

      const model = await this.getModel();
      const prompt = this.generateSubjectPrompt(context.template_type, context.company_name);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const subject = response.text().trim();

      return subject.replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Error generating subject:', error);
      throw new Error(`Failed to generate subject: ${(error as Error).message}`);
    }
  }

  /**
   * Generate email body only
   */
  async generateEmailBody(context: EmailGenerationContext): Promise<string> {
    try {
      if (!GEMINI_CONFIG.apiKey) {
        throw new Error(
          'Google Generative AI Key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.'
        );
      }

      const template = EMAIL_TEMPLATES[context.template_type];

      if (!template) {
        throw new Error(`Unknown email template: ${context.template_type}`);
      }

      const model = await this.getModel();
      const prompt = template.prompt({
        company_name: context.company_name,
        contact_name: context.contact_name,
        product_interest: context.product_interest,
        estimated_value: context.estimated_value,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text().trim();
    } catch (error) {
      console.error('Error generating body:', error);
      throw new Error(`Failed to generate body: ${(error as Error).message}`);
    }
  }

  /**
   * Generate subject prompt helper
   */
  private generateSubjectPrompt(templateType: EmailTemplateType, companyName: string): string {
    const subjects: Record<EmailTemplateType, string> = {
      initial_response: `Generate a professional, concise email subject line for an initial response to an enquiry from ${companyName}. Only respond with the subject line, no quotes needed.`,
      quotation_followup: `Generate a professional email subject for a quotation follow-up to ${companyName}. Only respond with the subject line.`,
      reminder_email: `Generate a professional email subject for a reminder email to ${companyName}. Only respond with the subject line.`,
      deal_closing: `Generate a professional email subject for a deal closing email to ${companyName}. Only respond with the subject line.`,
      re_engagement: `Generate a professional email subject for a re-engagement email to ${companyName}. Only respond with the subject line.`,
    };

    return subjects[templateType] || subjects.initial_response;
  }

  /**
   * Validate AI response for safety
   */
  validateResponse(content: string): {
    isValid: boolean;
    message: string;
  } {
    // Check for empty content
    if (!content || content.trim().length === 0) {
      return {
        isValid: false,
        message: 'Generated content is empty',
      };
    }

    // Check for minimum length
    if (content.trim().length < 50) {
      return {
        isValid: false,
        message: 'Generated content is too short',
      };
    }

    // Check for maximum length (reasonable for email)
    if (content.length > 5000) {
      return {
        isValid: false,
        message: 'Generated content is too long',
      };
    }

    // Check for placeholder text that shouldn't be there
    const placeholderPatterns = [
      /\[.*?\]/g, // [placeholder]
      /\{.*?\}/g, // {placeholder}
      /{{.*?}}/g, // {{placeholder}}
    ];

    for (const pattern of placeholderPatterns) {
      if (pattern.test(content)) {
        return {
          isValid: false,
          message: 'Generated content contains unresolved placeholders',
        };
      }
    }

    return {
      isValid: true,
      message: 'Content validation passed',
    };
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): Array<{
    id: EmailTemplateType;
    title: string;
    description: string;
  }> {
    return [
      {
        id: 'initial_response',
        title: 'Initial Enquiry Response',
        description: 'Professional response to a new enquiry',
      },
      {
        id: 'quotation_followup',
        title: 'Quotation Follow-up',
        description: 'Follow-up after sending a quotation',
      },
      {
        id: 'reminder_email',
        title: 'Reminder Email',
        description: 'Polite reminder about a pending enquiry',
      },
      {
        id: 'deal_closing',
        title: 'Deal Closing Email',
        description: 'Email to finalize a won deal',
      },
      {
        id: 're_engagement',
        title: 'Re-engagement Email',
        description: 'Email to re-engage inactive leads',
      },
    ];
  }
}

// Export singleton instance
export const aiEmailService = new AIEmailService();
export default AIEmailService;
