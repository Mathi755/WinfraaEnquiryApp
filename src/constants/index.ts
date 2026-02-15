/**
 * Environment & Constants Configuration
 * IMPORTANT: Replace with your actual Supabase and Google Gemini credentials
 */

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Validation for required configuration
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  console.warn('⚠️ Missing Supabase configuration. Please check your .env file.');
}

// Google Gemini AI Configuration
export const GEMINI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  model: 'gemini-1.5-flash-latest', // Latest stable model
};

if (!GEMINI_CONFIG.apiKey) {
  console.warn('⚠️ Missing Google Generative AI configuration. Please check your .env file.');
}

// Email Template Prompts for AI
export const EMAIL_TEMPLATES = {
  initial_response: {
    title: 'Initial Enquiry Response',
    prompt: (context: {
      company_name: string;
      contact_name?: string;
      product_interest: string;
    }) =>
      `You are a professional B2B sales representative for a technology company.
Generate a professional initial response email to ${context.company_name} ${context.contact_name ? `(Contact: ${context.contact_name})` : ''}.
Subject: Response to your enquiry about ${context.product_interest}
The email should:
- Thank them for their interest
- Briefly acknowledge their enquiry about ${context.product_interest}
- Highlight 2-3 key benefits relevant to their needs
- Propose a meeting/call
- Be concise (200-250 words)
- Use professional but friendly tone
Generate only the email body, not the subject line.`,
  },

  quotation_followup: {
    title: 'Quotation Follow-up',
    prompt: (context: {
      company_name: string;
      contact_name?: string;
      estimated_value?: number;
    }) =>
      `You are a professional B2B sales representative.
Generate a professional quotation follow-up email to ${context.company_name} ${context.contact_name ? `(${context.contact_name})` : ''}.
Subject: Your Quotation Details - Next Steps
Details: Estimated value: ${context.estimated_value ? `$${context.estimated_value}` : 'TBD'}
The email should:
- Reference the quotation provided
- Highlight value proposition
- Address potential questions
- Include next steps
- Create urgency without pressure
- Be concise (180-220 words)
Generate only the email body.`,
  },

  reminder_email: {
    title: 'Reminder Email',
    prompt: (context: {
      company_name: string;
      contact_name?: string;
      days_since?: number;
    }) =>
      `You are a professional B2B sales representative.
Generate a professional reminder email to ${context.company_name} ${context.contact_name ? `(${context.contact_name})` : ''}.
Subject: Following Up - ${context.company_name}
Timeline: Last contact was ${context.days_since || 7} days ago.
The email should:
- Gently remind about previous discussion
- Add new value/information if possible
- Ask for decision timeline
- Offer assistance
- Maintain professional relationship
- Be concise (150-200 words)
Generate only the email body.`,
  },

  deal_closing: {
    title: 'Deal Closing Email',
    prompt: (context: {
      company_name: string;
      contact_name?: string;
      product_interest: string;
    }) =>
      `You are a professional B2B sales representative.
Generate a professional deal closing email to ${context.company_name} ${context.contact_name ? `(${context.contact_name})` : ''}.
Subject: Let's Finalize - ${context.product_interest}
The email should:
- Summarize agreed terms
- Thank them for choosing us
- Outline next implementation steps
- Provide contact information for support
- Express excitement about partnership
- Be concise (150-180 words)
Generate only the email body.`,
  },

  re_engagement: {
    title: 're-Engagement Email',
    prompt: (context: {
      company_name: string;
      contact_name?: string;
      days_since?: number;
    }) =>
      `You are a professional B2B sales representative.
Generate a professional re-engagement email to ${context.company_name} ${context.contact_name ? `(${context.contact_name})` : ''}.
Subject: We Miss You - ${context.company_name}
Timeline: It's been ${context.days_since || 30} days without contact.
The email should:
- Acknowledge the absence
- Introduce new features/offerings
- Provide relevance to their business
- Remove previous price barriers if any
- Invite to brief conversation
- Be genuine and concise (150-200 words)
Generate only the email body.`,
  },
};

// UI/UX Constants
export const COLORS = {
  primary: '#2E7D32', // Professional green
  secondary: '#1976D2', // Professional blue
  accent: '#F57C00', // Orange accent
  success: '#388E3C',
  warning: '#FBC02D',
  error: '#D32F2F',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text_primary: '#212121',
  text_secondary: '#757575',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

// Status-related constants
export const STATUS_COLORS: Record<string, string> = {
  new: '#2196F3',
  in_progress: '#FF9800',
  quoted: '#9C27B0',
  won: '#4CAF50',
  lost: '#F44336',
  on_hold: '#9E9E9E',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'New Enquiry',
  in_progress: 'In Progress',
  quoted: 'Quoted',
  won: 'Won Deal',
  lost: 'Lost',
  on_hold: 'On Hold',
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  limit: 20,
  offset: 0,
};

// Notification constants
export const NOTIFICATION_SETTINGS = {
  sound: true,
  vibration: true,
  leadTime: 15 * 60 * 1000, // 15 minutes before
};

// Date formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  full: 'MMMM dd, yyyy',
  time: 'HH:mm',
  dateTime: 'MMM dd, yyyy HH:mm',
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  REQUIRED_FIELD: 'This field is required.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  AI_ERROR: 'Failed to generate email. Please try again.',
  EXPORT_ERROR: 'Failed to export data. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  ENQUIRY_CREATED: 'Enquiry created successfully.',
  ENQUIRY_UPDATED: 'Enquiry updated successfully.',
  EMAIL_GENERATED: 'Email generated successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  REMINDER_SET: 'Reminder set successfully.',
  DATA_EXPORTED: 'Data exported successfully.',
};

// API Timeouts
export const API_TIMEOUTS = {
  default: 10000, // 10 seconds
  upload: 30000, // 30 seconds
  longOperation: 60000, // 60 seconds
};

// Validation rules
export const VALIDATION_RULES = {
  minCompanyNameLength: 2,
  maxCompanyNameLength: 100,
  minContactNameLength: 2,
  maxContactNameLength: 100,
  minNotesLength: 0,
  maxNotesLength: 1000,
  minEmailLength: 5,
  maxEmailLength: 100,
  phoneRegex: /^[\d\s\-\+\(\)]+$/,
};

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  companies: 10 * 60 * 1000, // 10 minutes
  enquiries: 5 * 60 * 1000, // 5 minutes
  contacts: 10 * 60 * 1000, // 10 minutes
};
