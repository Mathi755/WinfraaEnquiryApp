/**
 * Enquiry Detail Screen
 * Display and edit detailed enquiry information
 */

// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Chip, Modal, Portal, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, STATUS_LABELS, STATUS_COLORS } from '../constants';
import {
  LoadingSpinner,
  ErrorMessage,
  StatusBadge,
  SectionHeader,
  Divider,
  ModalHeader,
  ReminderCard,
} from '../components';
import { supabaseService } from '../services/supabaseService';
import { notificationService } from '../services/notificationService';
import { Enquiry, Contact, Company, Reminder, EnquiryStatus } from '../types';
import { DateUtils } from '../utils';

const AVAILABLE_STATUSES: EnquiryStatus[] = ['new', 'in_progress', 'quoted', 'won', 'lost', 'on_hold'];

/**
 * Enquiry Detail Screen Component
 */
export const EnquiryDetailScreen = ({ navigation, route }: any) => {
  const enquiryId = route.params.enquiryId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Edit state
  const [editData, setEditData] = useState<Partial<Enquiry>>({});
  const [newReminderDate, setNewReminderDate] = useState<Date>(new Date());
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDesc, setReminderDesc] = useState('');

  // Load enquiry details
  const loadEnquiryDetails = async () => {
    try {
      setError(null);
      const enquiryData = await supabaseService.getEnquiryById(enquiryId);

      if (!enquiryData) {
        throw new Error('Enquiry not found');
      }

      setEnquiry(enquiryData);

      // Load related data
      const [companyData, contactData, remindersData] = await Promise.all([
        supabaseService.getCompanyById(enquiryData.company_id),
        enquiryData.contact_id ? supabaseService.getContactById(enquiryData.contact_id) : Promise.resolve(null),
        supabaseService.getRemindersByEnquiryId(enquiryId),
      ]);

      setCompany(companyData);
      setContact(contactData);
      setReminders(remindersData || []);
      setEditData(enquiryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load enquiry';
      setError(errorMessage);
      console.error('Enquiry detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiryDetails();
  }, [enquiryId]);

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    try {
      setSaving(true);
      const updated = await supabaseService.updateEnquiry(enquiryId, { status: newStatus });
      setEnquiry(updated);
      setShowStatusModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      console.error('Status update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const updated = await supabaseService.updateEnquiry(enquiryId, editData);
      setEnquiry(updated);
      setEditMode(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setError(errorMessage);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewReminderDate(selectedDate);
    }
  };

  const handleAddReminder = async () => {
    try {
      if (!reminderTitle.trim()) {
        Alert.alert('Error', 'Please enter a reminder title');
        return;
      }

      setSaving(true);
      const reminder = await supabaseService.createReminder({
        enquiry_id: enquiryId,
        reminder_date: newReminderDate.toISOString(),
        title: reminderTitle,
        description: reminderDesc,
        is_completed: false,
      });

      // Schedule notification
      await notificationService.scheduleReminderNotification(reminder);

      setReminders([...reminders, reminder]);
      setShowReminderModal(false);
      setReminderTitle('');
      setReminderDesc('');
      setNewReminderDate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add reminder';
      setError(errorMessage);
      console.error('Reminder error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await supabaseService.updateReminder(reminderId, { is_completed: true });
      await notificationService.cancelReminderNotification(reminderId);
      setReminders(reminders.map((r) => (r.id === reminderId ? { ...r, is_completed: true } : r)));
    } catch (err) {
      console.error('Complete reminder error:', err);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await supabaseService.deleteReminder(reminderId);
            await notificationService.cancelReminderNotification(reminderId);
            setReminders(reminders.filter((r) => r.id !== reminderId));
          } catch (err) {
            console.error('Delete reminder error:', err);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingSpinner visible={true} message="Loading Enquiry..." />;
  }

  if (!enquiry) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Enquiry not found" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.companyName}>{company?.name || 'Unknown'}</Text>
            {contact && <Text style={styles.contactName}>{contact.name}</Text>}
          </View>
          <StatusBadge status={enquiry.status} />
        </View>

        {!editMode && (
          <View style={styles.headerActions}>
            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => setEditMode(true)}
              compact
            >
              Edit
            </Button>
            <Button
              mode="contained"
              icon="email"
              onPress={() => navigation.navigate('EmailCompose', { enquiryId })}
              style={styles.emailButton}
              compact
            >
              Email
            </Button>
          </View>
        )}
      </View>

      {editMode && (
        <View style={styles.editActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setEditMode(false);
              setEditData(enquiry);
            }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveChanges}
            loading={saving}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </View>
      )}

      <Divider />

      {/* Company Information */}
      {company && (
        <>
          <SectionHeader title="Company Information" />
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Industry</Text>
                <Text style={styles.infoValue}>{company.industry}</Text>
              </View>
              {company.website && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <Text style={styles.infoValue}>{company.website}</Text>
                </View>
              )}
              {company.address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{company.address}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
          <Divider />
        </>
      )}

      {/* Contact Information */}
      {contact && (
        <>
          <SectionHeader title="Contact Information" />
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{contact.name}</Text>
              </View>
              {contact.designation && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Designation</Text>
                  <Text style={styles.infoValue}>{contact.designation}</Text>
                </View>
              )}
              {contact.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{contact.email}</Text>
                </View>
              )}
              {contact.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{contact.phone}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
          <Divider />
        </>
      )}

      {/* Enquiry Details */}
      <SectionHeader title="Enquiry Details" />
      <Card style={styles.card}>
        <Card.Content>
          {editMode ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <TouchableOpacity onPress={() => setShowStatusModal(true)}>
                  <StatusBadge status={editData.status || enquiry.status} />
                </TouchableOpacity>
              </View>

              <TextInput
                label="Product Interest"
                value={editData.product_interest || enquiry.product_interest}
                onChangeText={(text) =>
                  setEditData({ ...editData, product_interest: text })
                }
                mode="outlined"
                style={styles.input}
                multiline
              />

              <TextInput
                label="Estimated Value"
                value={(editData.estimated_value || enquiry.estimated_value || '').toString()}
                onChangeText={(text) =>
                  setEditData({ ...editData, estimated_value: parseFloat(text) || undefined })
                }
                mode="outlined"
                style={styles.input}
                keyboardType="decimal-pad"
              />

              <TextInput
                label="Notes"
                value={editData.notes || enquiry.notes || ''}
                onChangeText={(text) => setEditData({ ...editData, notes: text })}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
              />
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <TouchableOpacity onPress={() => setShowStatusModal(true)}>
                  <StatusBadge status={enquiry.status} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Product Interest</Text>
                <Text style={styles.infoValue}>{enquiry.product_interest}</Text>
              </View>

              {enquiry.estimated_value && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estimated Value</Text>
                  <Text style={styles.infoValue}>${enquiry.estimated_value.toLocaleString()}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Enquiry Date</Text>
                <Text style={styles.infoValue}>{DateUtils.formatDate(enquiry.enquiry_date)}</Text>
              </View>

              {enquiry.next_follow_up && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Next Follow-up</Text>
                  <Text style={styles.infoValue}>{DateUtils.formatDate(enquiry.next_follow_up)}</Text>
                </View>
              )}

              {enquiry.notes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Notes</Text>
                  <Text style={styles.infoValue}>{enquiry.notes}</Text>
                </View>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      <Divider />

      {/* Reminders Section */}
      <View style={styles.reminderHeader}>
        <SectionHeader title={`Reminders (${reminders.length})`} />
        <TouchableOpacity onPress={() => setShowReminderModal(true)}>
          <MaterialCommunityIcons name="plus-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {reminders.length > 0 ? (
        <View>
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              title={reminder.title}
              description={reminder.description}
              date={DateUtils.formatDate(reminder.reminder_date)}
              isCompleted={reminder.is_completed}
              onPress={() => {}}
              onComplete={
                !reminder.is_completed
                  ? () => handleCompleteReminder(reminder.id)
                  : undefined
              }
            />
          ))}
        </View>
      ) : (
        <Card style={[styles.card, styles.emptyCard]}>
          <Card.Content>
            <Text style={styles.emptyText}>No reminders yet</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomSpacing} />

      {/* Status Modal */}
      <Portal>
        <Modal visible={showStatusModal} onDismiss={() => setShowStatusModal(false)}>
          <View style={styles.modalContent}>
            <ModalHeader
              title="Change Status"
              onClose={() => setShowStatusModal(false)}
            />
            <ScrollView style={styles.statusList}>
              {AVAILABLE_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    enquiry.status === status && styles.statusOptionActive,
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  {/* @ts-ignore - react-native-paper types mismatch */}
                  <Chip
                    style={{ backgroundColor: STATUS_COLORS[status] || COLORS.disabled }}
                    textStyle={styles.statusChipText}
                    label={STATUS_LABELS[status]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </Portal>

      {/* Reminder Modal */}
      <Portal>
        <Modal visible={showReminderModal} onDismiss={() => setShowReminderModal(false)}>
          <View style={styles.modalContent}>
            <ModalHeader
              title="Add Reminder"
              onClose={() => setShowReminderModal(false)}
            />
            <ScrollView style={styles.reminderModalContent}>
              <TextInput
                label="Reminder Title"
                value={reminderTitle}
                onChangeText={setReminderTitle}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Description"
                value={reminderDesc}
                onChangeText={setReminderDesc}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
                <Text style={styles.datePickerText}>
                  {DateUtils.formatDate(newReminderDate.toISOString())}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newReminderDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              <Button
                mode="contained"
                onPress={handleAddReminder}
                loading={saving}
                style={styles.addReminderButton}
              >
                Add Reminder
              </Button>
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  headerSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  companyName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  contactName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  emailButton: {
    flex: 1,
  },

  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  saveButton: {
    flex: 1,
  },

  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },

  input: {
    marginVertical: SPACING.sm,
  },

  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },

  emptyCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.text_secondary,
  },

  bottomSpacing: {
    height: 100,
  },

  // Modal Styles
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
    marginTop: 40,
  },

  statusList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  statusOption: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusOptionActive: {
    backgroundColor: COLORS.background,
  },
  statusChipText: {
    color: '#FFFFFF',
  },

  reminderModalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  datePickerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
  },
  addReminderButton: {
    marginVertical: SPACING.lg,
  },
});

export default EnquiryDetailScreen;
