/**
 * Reusable UI Components
 * Professional components for consistent UI across the app
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, TextInput } from 'react-native-paper';
import { COLORS, SPACING, TYPOGRAPHY, STATUS_COLORS, STATUS_LABELS } from '../constants';

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ visible = true, message = 'Loading...' }) => {
  if (!visible) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

/**
 * Error Message Component
 */
export const ErrorMessage = ({ message, onDismiss }: { message: string; onDismiss?: () => void }) => {
  return (
    <Card style={styles.errorCard}>
      <View style={styles.errorContent}>
        <Text style={styles.errorText}>{message}</Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

/**
 * Success Message Component
 */
export const SuccessMessage = ({ message }: { message: string }) => {
  return (
    <Card style={styles.successCard}>
      <Text style={styles.successText}>{message}</Text>
    </Card>
  );
};

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <Chip
      style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] || COLORS.disabled }]}
      textStyle={styles.statusBadgeText}
      // @ts-ignore - react-native-paper types mismatch
      label={STATUS_LABELS[status] || status}
    />
  );
};

/**
 * Enquiry Card Component
 */
export const EnquiryCard = ({
  company,
  contact,
  product,
  status,
  value,
  date,
  onPress,
}: {
  company: string;
  contact?: string;
  product: string;
  status: string;
  value?: number;
  date: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.enquiryCard}>
        <Card.Content>
          <View style={styles.enquiryHeader}>
            <View style={styles.enquiryInfo}>
              <Text style={styles.enquiryCompany}>{company}</Text>
              {contact && <Text style={styles.enquiryContact}>{contact}</Text>}
            </View>
            <StatusBadge status={status} />
          </View>

          <Text style={styles.enquiryProduct}>{product}</Text>

          <View style={styles.enquiryFooter}>
            {value && <Text style={styles.enquiryValue}>${value.toLocaleString()}</Text>}
            <Text style={styles.enquiryDate}>{date}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

/**
 * Company Card Component
 */
export const CompanyCard = ({
  name,
  industry,
  website,
  contactCount,
  onPress,
}: {
  name: string;
  industry: string;
  website?: string;
  contactCount: number;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.companyCard}>
        <Card.Content>
          <Text style={styles.companyName}>{name}</Text>
          <View style={styles.companyMeta}>
            <Text style={styles.companyIndustry}>{industry}</Text>
            <Text style={styles.companyContacts}>{contactCount} contact(s)</Text>
          </View>
          {website && <Text style={styles.companyWebsite}>{website}</Text>}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

/**
 * Contact Card Component
 */
export const ContactCard = ({
  name,
  designation,
  email,
  phone,
  isPrimary,
  onPress,
  onEdit,
  onDelete,
}: {
  name: string;
  designation: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.contactCard}>
        <Card.Content>
          <View style={styles.contactHeader}>
            <View>
              <Text style={styles.contactName}>{name}</Text>
              <Text style={styles.contactDesignation}>{designation}</Text>
            </View>
            {isPrimary && (
              <Chip
                // @ts-ignore - react-native-paper types mismatch
                label="Primary"
                icon="check"
              />
            )}
          </View>

          {email && <Text style={styles.contactEmail}>{email}</Text>}
          {phone && <Text style={styles.contactPhone}>{phone}</Text>}

          {(onEdit || onDelete) && (
            <View style={styles.contactActions}>
              {onEdit && (
                <Button mode="text" onPress={onEdit} compact>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button mode="text" onPress={onDelete} compact textColor={COLORS.error}>
                  Delete
                </Button>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

/**
 * Reminder Card Component
 */
export const ReminderCard = ({
  title,
  description,
  date,
  isCompleted,
  onPress,
  onComplete,
}: {
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
  onPress: () => void;
  onComplete?: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={[styles.reminderCard, isCompleted && styles.reminderCardCompleted]}>
        <Card.Content>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderInfo}>
              <Text style={[styles.reminderTitle, isCompleted && styles.reminderTitleCompleted]}>
                {title}
              </Text>
              <Text style={styles.reminderDescription}>{description}</Text>
            </View>
            {onComplete && !isCompleted && (
              <TouchableOpacity onPress={onComplete} style={styles.reminderCheckbox}>
                <Text style={styles.reminderCheckboxText}>☑</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.reminderDate}>{date}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

/**
 * Form Input Component
 */
export const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  numberOfLines = 4,
  required = false,
  editable = true,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  editable?: boolean;
}) => {
  return (
    <View style={styles.formInputContainer}>
      <Text style={styles.formLabel}>
        {label}
        {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        mode="outlined"
        editable={editable}
        style={[styles.textInput, error && styles.textInputError]}
      />
      {error && <Text style={styles.formError}>{error}</Text>}
    </View>
  );
};

/**
 * Summary Card Component
 */
export const SummaryCard = ({
  title,
  value,
  icon,
  color = COLORS.primary,
  onPress,
}: {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={[styles.summaryCard, { borderLeftColor: color }]}>
        <Card.Content style={styles.summaryContent}>
          <Text style={styles.summaryTitle}>{title}</Text>
          <Text style={[styles.summaryValue, { color }]}>{value}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

/**
 * Empty State Component
 */
export const EmptyState = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction} style={styles.emptyStateButton}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

/**
 * Modal Header Component
 */
export const ModalHeader = ({
  title,
  onClose,
  onSave,
  isSaving = false,
}: {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}) => {
  return (
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>{title}</Text>
      <View style={styles.modalActions}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.modalCloseButton}>✕</Text>
        </TouchableOpacity>
        {onSave && (
          <TouchableOpacity onPress={onSave} disabled={isSaving}>
            <Text style={styles.modalSaveButton}>{isSaving ? '⏳' : '✓'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * Divider Component
 */
export const Divider = () => <View style={styles.divider} />;

/**
 * Section Header Component
 */
export const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_secondary,
  },

  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    margin: SPACING.md,
  },
  errorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  errorDismiss: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error,
    marginLeft: SPACING.md,
  },

  successCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    margin: SPACING.md,
  },
  successText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },

  statusBadge: {
    height: 28,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.xs,
  },

  enquiryCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 8,
  },
  enquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  enquiryInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  enquiryCompany: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  enquiryContact: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
  enquiryProduct: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginVertical: SPACING.sm,
  },
  enquiryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  enquiryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  enquiryDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text_secondary,
  },

  companyCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  companyName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  companyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  companyIndustry: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
  },
  companyContacts: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  companyWebsite: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },

  contactCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  contactName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  contactDesignation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
  contactEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.sm,
  },
  contactPhone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
  contactActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  reminderCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  reminderCardCompleted: {
    opacity: 0.6,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  reminderTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.text_secondary,
  },
  reminderDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
  reminderCheckbox: {
    marginLeft: SPACING.md,
  },
  reminderCheckboxText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.success,
  },
  reminderDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text_secondary,
    marginTop: SPACING.md,
  },

  formInputContainer: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text_primary,
    marginBottom: SPACING.sm,
  },
  requiredStar: {
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.surface,
  },
  textInputError: {
    borderColor: COLORS.error,
  },
  formError: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
  },

  summaryCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
  },
  summaryContent: {
    paddingVertical: SPACING.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xs,
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    marginTop: SPACING.md,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  modalCloseButton: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text_secondary,
  },
  modalSaveButton: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.primary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
});
