/**
 * Export Utilities
 * Handles CSV and Excel export functionality
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
import Papa from 'papaparse';
import { ExportEnquiryData } from '../types';
import { EXPORT_FORMATS } from '../constants';

/**
 * Export utility functions
 */
export class ExportUtils {
  /**
   * Export enquiries to CSV format
   */
  static async exportToCSV(data: ExportEnquiryData[], filename: string = 'enquiries.csv'): Promise<string | null> {
    try {
      // Convert to CSV
      const csv = Papa.unparse(data);

      // Create file
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return fileUri;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Export enquiries to Excel format
   */
  static async exportToExcel(data: ExportEnquiryData[], filename: string = 'enquiries.xlsx'): Promise<string | null> {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

      // Write to file
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return fileUri;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  /**
   * Export enquiries based on format
   */
  static async exportEnquiries(
    data: ExportEnquiryData[],
    format: 'csv' | 'xlsx' = 'csv',
    filename?: string
  ): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = format === 'csv' ? `enquiries_${timestamp}.csv` : `enquiries_${timestamp}.xlsx`;

      if (format === EXPORT_FORMATS.CSV) {
        return await this.exportToCSV(data, filename || defaultFilename);
      } else if (format === EXPORT_FORMATS.EXCEL) {
        return await this.exportToExcel(data, filename || defaultFilename);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting enquiries:', error);
      throw error;
    }
  }

  /**
   * Prepare CSV headers
   */
  static getCSVHeaders(): string[] {
    return [
      'company_name',
      'contact_name',
      'contact_email',
      'contact_phone',
      'status',
      'product_interest',
      'estimated_value',
      'enquiry_date',
      'next_follow_up',
      'notes',
      'owner',
    ];
  }

  /**
   * Format data for export
   */
  static formatForExport(data: ExportEnquiryData[]): Record<string, any>[] {
    return data.map((item) => ({
      'Company Name': item.company_name,
      'Contact Name': item.contact_name || '-',
      'Contact Email': item.contact_email || '-',
      'Contact Phone': item.contact_phone || '-',
      Status: item.status,
      'Product Interest': item.product_interest,
      'Estimated Value': item.estimated_value ? `$${item.estimated_value}` : '-',
      'Enquiry Date': item.enquiry_date,
      'Next Follow-up': item.next_follow_up || '-',
      Notes: item.notes || '-',
      Owner: item.owner,
    }));
  }
}

/**
 * Date utility functions
 */
export class DateUtils {
  /**
   * Format date for display
   */
  static formatDate(date: string | Date, format: string = 'MMM dd, yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return dateObj.toLocaleDateString('en-US', options);
    } catch {
      return '-';
    }
  }

  /**
   * Get days until date
   */
  static daysUntilDate(date: string): number {
    const targetDate = new Date(date);
    const today = new Date();
    const diffMs = targetDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Get relative date string
   */
  static getRelativeDateString(date: string): string {
    const daysUntil = this.daysUntilDate(date);

    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} days ago`;
    } else if (daysUntil === 0) {
      return 'Today';
    } else if (daysUntil === 1) {
      return 'Tomorrow';
    } else {
      return `In ${daysUntil} days`;
    }
  }

  /**
   * Check if date is overdue
   */
  static isOverdue(date: string): boolean {
    return new Date(date) < new Date();
  }

  /**
   * Check if date is within range
   */
  static isWithinRange(date: string, startDate: string, endDate: string): boolean {
    const d = new Date(date);
    const s = new Date(startDate);
    const e = new Date(endDate);
    return d >= s && d <= e;
  }

  /**
   * Get date range for current week
   */
  static getCurrentWeekRange(): { startDate: string; endDate: string } {
    const today = new Date();
    const currentDay = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDay);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  /**
   * Get date range for current month
   */
  static getCurrentMonthRange(): { startDate: string; endDate: string } {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }
}

/**
 * String utility functions
 */
export class StringUtils {
  /**
   * Truncate string
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Convert enum to readable label
   */
  static enumToLabel(value: string): string {
    return value
      .split('_')
      .map((word) => this.capitalize(word))
      .join(' ');
  }

  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number
   */
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }
}

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Validate required field
   */
  static isRequired(value: string | null | undefined): boolean {
    return value !== null && value !== undefined && value.trim().length > 0;
  }

  /**
   * Validate field length
   */
  static isValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  /**
   * Validate number range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate form data
   */
  static validateFormData(
    data: Record<string, any>,
    rules: Record<string, { required?: boolean; minLength?: number; maxLength?: number }>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];

      if (fieldRules.required && !this.isRequired(value)) {
        errors[field] = `${field} is required`;
      }

      if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
      }

      if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${field} must be at most ${fieldRules.maxLength} characters`;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

/**
 * Format utility functions
 */
export class FormatUtils {
  /**
   * Format currency
   */
  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  }

  /**
   * Format number
   */
  static formatNumber(value: number, decimals: number = 0): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }
}
