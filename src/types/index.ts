/**
 * Winfraatech Enquiry Manager - Type Definitions
 * Complete type safety throughout the application
 */

/**
 * Company Model
 */
export interface Company {
  id: string;
  name: string;
  address: string;
  industry: string;
  website?: string;
  notes?: string;
  owner: string;
  created_at: string;
  updated_at: string;
}

/**
 * Contact Model
 */
export interface Contact {
  id: string;
  company_id: string;
  name: string;
  designation: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

/**
 * Enquiry Status
 */
export type EnquiryStatus = 'new' | 'in_progress' | 'quoted' | 'won' | 'lost' | 'on_hold';

/**
 * Enquiry Model
 */
export interface Enquiry {
  id: string;
  company_id: string;
  contact_id?: string;
  enquiry_date: string;
  status: EnquiryStatus;
  product_interest: string;
  estimated_value?: number;
  notes?: string;
  next_follow_up?: string;
  owner: string;
  created_at: string;
  updated_at: string;
}

/**
 * Email Draft Model
 */
export interface EmailDraft {
  id: string;
  enquiry_id: string;
  template_type: EmailTemplateType;
  subject: string;
  body: string;
  created_at: string;
}

/**
 * Email Template Types
 */
export type EmailTemplateType =
  | 'initial_response'
  | 'quotation_followup'
  | 'reminder_email'
  | 'deal_closing'
  | 're_engagement';

/**
 * Reminder Model
 */
export interface Reminder {
  id: string;
  enquiry_id: string;
  reminder_date: string;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

/**
 * Extended Enquiry (with relations)
 */
export interface EnquiryWithRelations extends Enquiry {
  company?: Company;
  contact?: Contact;
}

/**
 * Pagination helper
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Filter options for enquiries
 */
export interface EnquiryFilterOptions {
  status?: EnquiryStatus[];
  owner?: string;
  dateFrom?: string;
  dateTo?: string;
  productInterest?: string;
  companyId?: string;
  searchTerm?: string;
}

/**
 * Export data format
 */
export interface ExportEnquiryData {
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status: EnquiryStatus;
  product_interest: string;
  estimated_value?: number;
  enquiry_date: string;
  next_follow_up?: string;
  notes?: string;
  owner: string;
}

/**
 * Dashboard Summary
 */
export interface DashboardSummary {
  total_enquiries: number;
  new_count: number;
  in_progress_count: number;
  quoted_count: number;
  won_count: number;
  lost_count: number;
  on_hold_count: number;
  upcoming_followups: number;
  total_estimated_value: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * AI Email generation context
 */
export interface EmailGenerationContext {
  template_type: EmailTemplateType;
  company_name: string;
  contact_name?: string;
  enquiry_status: EnquiryStatus;
  product_interest: string;
  estimated_value?: number;
  previous_communication?: string;
}

/**
 * Notification payload
 */
export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    enquiry_id?: string;
    reminder_id?: string;
    screen?: string;
  };
}

/**
 * Navigation parameter lists
 */
export type RootStackParamList = {
  Dashboard: undefined;
  EnquiryList: undefined;
  EnquiryDetail: { enquiryId: string };
  AddEnquiry: { companyId?: string; contactId?: string };
  CompanyDetail: { companyId: string };
  EmailCompose: { enquiryId: string };
  Settings: undefined;
};

/**
 * Bottom tab navigator param list
 */
export type BottomTabParamList = {
  HomeTab: undefined;
  ListTab: undefined;
  AddTab: undefined;
  SettingsTab: undefined;
};

/**
 * Analytics event types
 */
export enum AnalyticsEvent {
  ENQUIRY_CREATED = 'enquiry_created',
  ENQUIRY_UPDATED = 'enquiry_updated',
  EMAIL_GENERATED = 'email_generated',
  DATA_EXPORTED = 'data_exported',
  REMINDER_SET = 'reminder_set',
}
