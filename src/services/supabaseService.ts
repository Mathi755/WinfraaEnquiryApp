/**
 * Supabase Database Service
 * Handles all CRUD operations and realtime subscriptions
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants';
import {
  Company,
  Contact,
  Enquiry,
  EmailDraft,
  Reminder,
  EnquiryFilterOptions,
  DashboardSummary,
  ExportEnquiryData,
} from '../types';

// Initialize Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

/**
 * Supabase Service - All database operations
 */
class SupabaseService {
  /**
   * ============================================
   * COMPANY OPERATIONS
   * ============================================
   */

  /**
   * Get all companies with pagination
   */
  async getCompanies(limit: number = 20, offset: number = 0): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  /**
   * Get single company by ID
   */
  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

  /**
   * Search companies by name
   */
  async searchCompanies(searchTerm: string): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  }

  /**
   * Create new company
   */
  async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  /**
   * Update company
   */
  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * CONTACT OPERATIONS
   * ============================================
   */

  /**
   * Get contacts for a company
   */
  async getContactsByCompanyId(companyId: string): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  /**
   * Get single contact
   */
  async getContactById(id: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  /**
   * Create contact
   */
  async createContact(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  /**
   * Update contact
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * ENQUIRY OPERATIONS
   * ============================================
   */

  /**
   * Get all enquiries with advanced filtering
   */
  async getEnquiries(
    filters?: EnquiryFilterOptions,
    limit: number = 20,
    offset: number = 0
  ): Promise<Enquiry[]> {
    try {
      let query = supabase
        .from('enquiries')
        .select(
          `
          *,
          company:companies(*),
          contact:contacts(*)
        `
        );

      // Apply filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }
        if (filters.owner) {
          query = query.eq('owner', filters.owner);
        }
        if (filters.dateFrom) {
          query = query.gte('enquiry_date', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('enquiry_date', filters.dateTo);
        }
        if (filters.productInterest) {
          query = query.ilike('product_interest', `%${filters.productInterest}%`);
        }
        if (filters.companyId) {
          query = query.eq('company_id', filters.companyId);
        }
      }

      const { data, error } = await query
        .order('enquiry_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw error;
    }
  }

  /**
   * Get single enquiry with all related data
   */
  async getEnquiryById(id: string): Promise<Enquiry | null> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(
          `
          *,
          company:companies(*),
          contact:contacts(*)
        `
        )
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching enquiry:', error);
      throw error;
    }
  }

  /**
   * Get enquiries by company
   */
  async getEnquiriesByCompanyId(companyId: string): Promise<Enquiry[]> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(
          `
          *,
          company:companies(*),
          contact:contacts(*)
        `
        )
        .eq('company_id', companyId)
        .order('enquiry_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company enquiries:', error);
      throw error;
    }
  }

  /**
   * Create enquiry
   */
  async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>): Promise<Enquiry> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .insert([enquiry])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating enquiry:', error);
      throw error;
    }
  }

  /**
   * Update enquiry
   */
  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating enquiry:', error);
      throw error;
    }
  }

  /**
   * Delete enquiry
   */
  async deleteEnquiry(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('enquiries').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // Get all enquiries for summary
      const { data: enquiries, error } = await supabase.from('enquiries').select('status, estimated_value');

      if (error) throw error;

      const summary: DashboardSummary = {
        total_enquiries: enquiries?.length || 0,
        new_count: enquiries?.filter((e) => e.status === 'new').length || 0,
        in_progress_count: enquiries?.filter((e) => e.status === 'in_progress').length || 0,
        quoted_count: enquiries?.filter((e) => e.status === 'quoted').length || 0,
        won_count: enquiries?.filter((e) => e.status === 'won').length || 0,
        lost_count: enquiries?.filter((e) => e.status === 'lost').length || 0,
        on_hold_count: enquiries?.filter((e) => e.status === 'on_hold').length || 0,
        upcoming_followups: 0, // Will be calculated separately
        total_estimated_value: enquiries?.reduce((sum, e) => sum + (e.estimated_value || 0), 0) || 0,
      };

      // Get upcoming follow-ups
      const today = new Date().toISOString().split('T')[0];
      const { data: followups, error: followupError } = await supabase
        .from('enquiries')
        .select('id')
        .gte('next_follow_up', today)
        .lte('next_follow_up', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (!followupError) {
        summary.upcoming_followups = followups?.length || 0;
      }

      return summary;
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * EMAIL DRAFT OPERATIONS
   * ============================================
   */

  /**
   * Create email draft
   */
  async createEmailDraft(draft: Omit<EmailDraft, 'id' | 'created_at'>): Promise<EmailDraft> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .insert([draft])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email draft:', error);
      throw error;
    }
  }

  /**
   * Get email drafts for enquiry
   */
  async getEmailDraftsByEnquiryId(enquiryId: string): Promise<EmailDraft[]> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email drafts:', error);
      throw error;
    }
  }

  /**
   * Update email draft
   */
  async updateEmailDraft(id: string, updates: Partial<EmailDraft>): Promise<EmailDraft> {
    try {
      const { data, error } = await supabase
        .from('email_drafts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating email draft:', error);
      throw error;
    }
  }

  /**
   * Delete email draft
   */
  async deleteEmailDraft(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('email_drafts').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting email draft:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * REMINDER OPERATIONS
   * ============================================
   */

  /**
   * Create reminder
   */
  async createReminder(reminder: Omit<Reminder, 'id' | 'created_at'>): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminder])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  /**
   * Get reminders for enquiry
   */
  async getRemindersByEnquiryId(enquiryId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  }

  /**
   * Get upcoming reminders
   */
  async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_completed', false)
        .gte('reminder_date', today.toISOString())
        .lte('reminder_date', futureDate.toISOString())
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
      throw error;
    }
  }

  /**
   * Update reminder
   */
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  /**
   * Delete reminder
   */
  async deleteReminder(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * EXPORT OPERATIONS
   * ============================================
   */

  /**
   * Get enquiries for export with all related data
   */
  async getEnquiriesForExport(filters?: EnquiryFilterOptions): Promise<ExportEnquiryData[]> {
    try {
      const enquiries = await this.getEnquiries(filters, 1000, 0);

      const exportData: ExportEnquiryData[] = await Promise.all(
        enquiries.map(async (enquiry) => {
          const [company, contact] = await Promise.all([
            this.getCompanyById(enquiry.company_id),
            enquiry.contact_id ? this.getContactById(enquiry.contact_id) : Promise.resolve(null),
          ]);

          return {
            company_name: company?.name || '',
            contact_name: contact?.name,
            contact_email: contact?.email,
            contact_phone: contact?.phone,
            status: enquiry.status,
            product_interest: enquiry.product_interest,
            estimated_value: enquiry.estimated_value,
            enquiry_date: enquiry.enquiry_date,
            next_follow_up: enquiry.next_follow_up,
            notes: enquiry.notes,
            owner: enquiry.owner,
          };
        })
      );

      return exportData;
    } catch (error) {
      console.error('Error preparing export data:', error);
      throw error;
    }
  }

  /**
   * ============================================
   * REALTIME SUBSCRIPTIONS
   * ============================================
   */

  /**
   * Subscribe to enquiry changes for a specific enquiry
   */
  subscribeToEnquiryChanges(enquiryId: string, callback: (enquiry: Enquiry) => void) {
    const channel = supabase.channel(`enquiry:${enquiryId}`);

    const unsubscribe = channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enquiries',
          filter: `id=eq.${enquiryId}`,
        },
        (payload: any) => {
          callback(payload.new as Enquiry);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Subscribe to all enquiries
   */
  subscribeToAllEnquiries(callback: (enquiry: Enquiry) => void) {
    const channel = supabase.channel('enquiries');

    const unsubscribe = channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enquiries',
        },
        (payload: any) => {
          callback(payload.new as Enquiry);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Unsubscribe from realtime updates
   */
  unsubscribeFromChannel(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
export default SupabaseService;
