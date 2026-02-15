/**
 * Add Enquiry Screen
 * Create new enquiries with company and contact selection
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Text, Button, TextInput, Card, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, STATUS_LABELS } from '../constants';
import {
  LoadingSpinner,
  ErrorMessage,
  FormInput,
  SectionHeader,
  Divider,
  ModalHeader,
} from '../components';
import { supabaseService } from '../services/supabaseService';
import { Company, Contact, EnquiryStatus } from '../types';
import { ValidationUtils, StringUtils, DateUtils } from '../utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add Enquiry Screen Component
 */
export const AddEnquiryScreen = ({ navigation, route }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [companyContacts, setCompanyContacts] = useState<Contact[]>([]);
  const [enquiryStatus, setEnquiryStatus] = useState<EnquiryStatus>('new');
  const [followUpDate, setFollowUpDate] = useState<Date>(new Date());

  // New Company Form
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    address: '',
    website: '',
  });

  // New Contact Form
  const [newContact, setNewContact] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    is_primary: true,
  });

  // Enquiry Details
  const [enquiryDetails, setEnquiryDetails] = useState({
    product_interest: '',
    estimated_value: '',
    notes: '',
  });

  // Load companies
  const loadCompanies = async () => {
    try {
      setError(null);
      const data = await supabaseService.getCompanies(100, 0);
      setCompanies(data);

      // Pre-select company if passed via route
      if (route.params?.companyId) {
        const company = data.find((c) => c.id === route.params.companyId);
        if (company) {
          await handleSelectCompany(company);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load companies';
      setError(errorMessage);
      console.error('Load companies error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSelectCompany = async (company: Company) => {
    try {
      setSelectedCompany(company);
      const contacts = await supabaseService.getContactsByCompanyId(company.id);
      setCompanyContacts(contacts);
      setShowCompanyModal(false);

      // Auto-select primary contact if exists
      const primaryContact = contacts.find((c) => c.is_primary);
      if (primaryContact) {
        setSelectedContact(primaryContact);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  };

  const handleCreateCompany = async () => {
    try {
      const validation = ValidationUtils.validateFormData(newCompany, {
        name: { required: true, minLength: 2, maxLength: 100 },
        industry: { required: true, minLength: 2, maxLength: 50 },
      });

      if (!validation.valid) {
        Alert.alert('Validation Error', Object.values(validation.errors).join('\n'));
        return;
      }

      setSaving(true);
      const createdCompany = await supabaseService.createCompany({
        name: newCompany.name,
        industry: newCompany.industry,
        address: newCompany.address,
        website: newCompany.website,
        owner: 'current_user', // TODO: Replace with actual user
        notes: '',
      });

      setCompanies([...companies, createdCompany]);
      await handleSelectCompany(createdCompany);
      setShowNewCompanyForm(false);
      setNewCompany({ name: '', industry: '', address: '', website: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create company';
      setError(errorMessage);
      console.error('Create company error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateContact = async () => {
    try {
      if (!selectedCompany) {
        Alert.alert('Error', 'Please select a company first');
        return;
      }

      const validation = ValidationUtils.validateFormData(newContact, {
        name: { required: true, minLength: 2, maxLength: 100 },
        designation: { required: true, minLength: 2, maxLength: 50 },
      });

      if (!validation.valid) {
        Alert.alert('Validation Error', Object.values(validation.errors).join('\n'));
        return;
      }

      if (newContact.email && !StringUtils.isValidEmail(newContact.email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      setSaving(true);
      const createdContact = await supabaseService.createContact({
        company_id: selectedCompany.id,
        name: newContact.name,
        designation: newContact.designation,
        email: newContact.email,
        phone: newContact.phone,
        is_primary: newContact.is_primary,
        notes: '',
      });

      setCompanyContacts([...companyContacts, createdContact]);
      setSelectedContact(createdContact);
      setShowContactModal(false);
      setNewContact({ name: '', designation: '', email: '', phone: '', is_primary: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create contact';
      setError(errorMessage);
      console.error('Create contact error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEnquiry = async () => {
    try {
      if (!selectedCompany) {
        Alert.alert('Error', 'Please select a company');
        return;
      }

      const validation = ValidationUtils.validateFormData(enquiryDetails, {
        product_interest: { required: true, minLength: 2, maxLength: 100 },
      });

      if (!validation.valid) {
        Alert.alert('Validation Error', Object.values(validation.errors).join('\n'));
        return;
      }

      setSaving(true);
      const enquiry = await supabaseService.createEnquiry({
        company_id: selectedCompany.id,
        contact_id: selectedContact?.id,
        enquiry_date: new Date().toISOString().split('T')[0],
        status: enquiryStatus,
        product_interest: enquiryDetails.product_interest,
        estimated_value: enquiryDetails.estimated_value ? parseFloat(enquiryDetails.estimated_value) : undefined,
        notes: enquiryDetails.notes,
        next_follow_up: followUpDate ? followUpDate.toISOString().split('T')[0] : undefined,
        owner: 'current_user', // TODO: Replace with actual user
      });

      Alert.alert('Success', 'Enquiry created successfully', [
        {
          text: 'View',
          onPress: () =>
            navigation.replace('EnquiryDetail', { enquiryId: enquiry.id }),
        },
        {
          text: 'Create Another',
          onPress: () => {
            resetForm();
          },
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create enquiry';
      setError(errorMessage);
      console.error('Create enquiry error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFollowUpDate(selectedDate);
    }
  };

  const resetForm = () => {
    setSelectedCompany(null);
    setSelectedContact(null);
    setCompanyContacts([]);
    setEnquiryStatus('new');
    setFollowUpDate(new Date());
    setEnquiryDetails({ product_interest: '', estimated_value: '', notes: '' });
  };

  if (loading) {
    return <LoadingSpinner visible={true} message="Loading..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Step 1: Company Selection */}
      <SectionHeader title="Step 1: Select Company" />

      {selectedCompany ? (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.selectedItem}>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedCompany.name}</Text>
                <Text style={styles.selectedMeta}>{selectedCompany.industry}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCompanyModal(true)}>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCompanyModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
          <Text style={styles.selectButtonText}>Select Company</Text>
        </TouchableOpacity>
      )}

      {selectedCompany && (
        <>
          <Divider />

          {/* Step 2: Contact Selection */}
          <SectionHeader title="Step 2: Select Contact (Optional)" />

          {selectedContact ? (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.selectedItem}>
                  <View style={styles.selectedInfo}>
                    <Text style={styles.selectedName}>{selectedContact.name}</Text>
                    <Text style={styles.selectedMeta}>{selectedContact.designation}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowContactModal(true)}>
                    <Text style={styles.changeButton}>Change</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.contactOptions}>
              {companyContacts.length > 0 && (
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowContactModal(true)}
                >
                  <MaterialCommunityIcons name="account-check" size={24} color={COLORS.secondary} />
                  <Text style={styles.selectButtonText}>Select Existing Contact</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  setShowContactModal(true);
                  setNewContact({ name: '', designation: '', email: '', phone: '', is_primary: true });
                }}
              >
                <MaterialCommunityIcons name="account-plus" size={24} color={COLORS.accent} />
                <Text style={styles.selectButtonText}>Add New Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setSelectedContact(null)}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.text_secondary} />
                <Text style={styles.selectButtonText}>Skip (No Contact)</Text>
              </TouchableOpacity>
            </View>
          )}

          <Divider />

          {/* Step 3: Enquiry Details */}
          <SectionHeader title="Step 3: Enquiry Details" />

          <View style={styles.formContainer}>
            <FormInput
              label="Product Interest"
              placeholder="What product/service are they interested in?"
              value={enquiryDetails.product_interest}
              onChangeText={(text) =>
                setEnquiryDetails({ ...enquiryDetails, product_interest: text })
              }
              required
            />

            <FormInput
              label="Estimated Value"
              placeholder="e.g., 50000"
              value={enquiryDetails.estimated_value}
              onChangeText={(text) =>
                setEnquiryDetails({ ...enquiryDetails, estimated_value: text })
              }
              multiline={false}
            />

            <FormInput
              label="Notes"
              placeholder="Any additional details about this enquiry..."
              value={enquiryDetails.notes}
              onChangeText={(text) =>
                setEnquiryDetails({ ...enquiryDetails, notes: text })
              }
              multiline
              numberOfLines={4}
            />

            <View style={styles.formLabel}>
              <Text style={styles.labelText}>Status</Text>
            </View>
            <TouchableOpacity
              style={styles.statusSelectButton}
              onPress={() => {
                // Status selection modal
              }}
            >
              <Text style={styles.statusSelectText}>{STATUS_LABELS[enquiryStatus]}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.formLabel}>
              <Text style={styles.labelText}>Follow-up Date</Text>
            </View>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.datePickerText}>{DateUtils.formatDate(followUpDate.toISOString())}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={followUpDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <Divider />

          {/* Submit Buttons */}
          <View style={styles.submitButtons}>
            <Button
              mode="outlined"
              onPress={resetForm}
            >
              Reset
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateEnquiry}
              loading={saving}
              style={styles.submitButton}
            >
              Create Enquiry
            </Button>
          </View>
        </>
      )}

      <View style={styles.bottomSpacing} />

      {/* Company Selection Modal */}
      <Modal visible={showCompanyModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ModalHeader
            title="Select Company"
            onClose={() => setShowCompanyModal(false)}
          />

          <ScrollView style={styles.modalContent}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => {
                setShowNewCompanyForm(true);
                setShowCompanyModal(false);
              }}
              style={styles.newCompanyButton}
            >
              + Add New Company
            </Button>

            <SectionHeader title="Existing Companies" />
            {companies.map((company) => (
              <TouchableOpacity
                key={company.id}
                style={styles.companyOption}
                onPress={() => handleSelectCompany(company)}
              >
                <View>
                  <Text style={styles.companyOptionName}>{company.name}</Text>
                  <Text style={styles.companyOptionMeta}>{company.industry}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.text_secondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* New Company Form Modal */}
      <Modal visible={showNewCompanyForm} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ModalHeader
            title="Add New Company"
            onClose={() => {
              setShowNewCompanyForm(false);
              setShowCompanyModal(true);
            }}
          />

          <ScrollView style={styles.modalContent}>
            <FormInput
              label="Company Name"
              placeholder="Enter company name"
              value={newCompany.name}
              onChangeText={(text) => setNewCompany({ ...newCompany, name: text })}
              required
            />

            <FormInput
              label="Industry"
              placeholder="e.g., Technology, Finance, Healthcare"
              value={newCompany.industry}
              onChangeText={(text) => setNewCompany({ ...newCompany, industry: text })}
              required
            />

            <FormInput
              label="Address"
              placeholder="Company address"
              value={newCompany.address}
              onChangeText={(text) => setNewCompany({ ...newCompany, address: text })}
            />

            <FormInput
              label="Website"
              placeholder="e.g., https://example.com"
              value={newCompany.website}
              onChangeText={(text) => setNewCompany({ ...newCompany, website: text })}
            />

            <View style={styles.submitButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowNewCompanyForm(false);
                  setShowCompanyModal(true);
                  setNewCompany({ name: '', industry: '', address: '', website: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateCompany}
                loading={saving}
                style={styles.submitButton}
              >
                Create
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Contact Selection Modal */}
      <Modal visible={showContactModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ModalHeader
            title="Select Contact"
            onClose={() => setShowContactModal(false)}
          />

          <ScrollView style={styles.modalContent}>
            {/* Existing Contacts */}
            {companyContacts.length > 0 && (
              <>
                <SectionHeader title="Existing Contacts" />
                {companyContacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactOption}
                    onPress={() => {
                      setSelectedContact(contact);
                      setShowContactModal(false);
                    }}
                  >
                    <View>
                      <Text style={styles.contactOptionName}>{contact.name}</Text>
                      <Text style={styles.contactOptionMeta}>{contact.designation}</Text>
                    </View>
                    {contact.is_primary && (
                      <Chip
                        // @ts-ignore - react-native-paper types mismatch
                        label="Primary"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            <SectionHeader title="New Contact" />

            <FormInput
              label="Contact Name"
              placeholder="Enter full name"
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              required
            />

            <FormInput
              label="Designation"
              placeholder="e.g., Manager, Director"
              value={newContact.designation}
              onChangeText={(text) => setNewContact({ ...newContact, designation: text })}
              required
            />

            <FormInput
              label="Email"
              placeholder="contact@example.com"
              value={newContact.email}
              onChangeText={(text) => setNewContact({ ...newContact, email: text })}
            />

            <FormInput
              label="Phone"
              placeholder="+1 123-456-7890"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            />

            <View style={styles.submitButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowContactModal(false);
                  setNewContact({ name: '', designation: '', email: '', phone: '', is_primary: true });
                }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateContact}
                loading={saving}
                style={styles.submitButton}
              >
                Add Contact
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  card: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },

  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  selectedMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
  changeButton: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  selectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
  },

  contactOptions: {
    marginVertical: SPACING.md,
  },

  formContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },

  formLabel: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  labelText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text_primary,
  },

  statusSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusSelectText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
  },

  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  datePickerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
  },

  submitButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  submitButton: {
    flex: 1,
  },

  bottomSpacing: {
    height: 100,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    marginTop: 40,
  },
  modalContent: {
    flex: 1,
  },

  newCompanyButton: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },

  companyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  companyOptionName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  companyOptionMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },

  contactOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactOptionName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },
  contactOptionMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },
});

export default AddEnquiryScreen;
