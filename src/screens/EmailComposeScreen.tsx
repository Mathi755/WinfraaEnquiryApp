/**
 * Email Compose Screen
 * Generate professional emails using AI
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Text, Button, TextInput, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, EMAIL_TEMPLATES } from '../constants';
import {
  LoadingSpinner,
  ErrorMessage,
  SectionHeader,
  ModalHeader,
  Divider,
} from '../components';
import { supabaseService } from '../services/supabaseService';
import { aiEmailService } from '../services/aiEmailService';
import { Enquiry, Company, Contact, EmailTemplateType, EmailDraft } from '../types';
import { DateUtils } from '../utils';

/**
 * Email Compose Screen Component
 */
export const EmailComposeScreen = ({ navigation, route }: any) => {
  const enquiryId = route.params.enquiryId;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);

  // Email State
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>('initial_response');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [editMode, setEditMode] = useState(false);

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
      const [companyData, contactData] = await Promise.all([
        supabaseService.getCompanyById(enquiryData.company_id),
        enquiryData.contact_id ? supabaseService.getContactById(enquiryData.contact_id) : Promise.resolve(null),
      ]);

      setCompany(companyData);
      setContact(contactData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load enquiry';
      setError(errorMessage);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiryDetails();
  }, [enquiryId]);

  const handleGenerateEmail = async () => {
    try {
      if (!company || !enquiry) {
        throw new Error('Missing required data');
      }

      setGenerating(true);
      setError(null);

      const context = {
        template_type: selectedTemplate,
        company_name: company.name,
        contact_name: contact?.name,
        enquiry_status: enquiry.status,
        product_interest: enquiry.product_interest,
        estimated_value: enquiry.estimated_value,
      };

      const { subject, body } = await aiEmailService.generateEmail(context);

      // Validate generated content
      const validation = aiEmailService.validateResponse(body);
      if (!validation.isValid) {
        throw new Error(`Generated content validation failed: ${validation.message}`);
      }

      setEmailSubject(subject);
      setEmailBody(body);
      setEditMode(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate email';
      setError(errorMessage);
      console.error('Generate error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (!emailSubject.trim() || !emailBody.trim()) {
        Alert.alert('Error', 'Please enter subject and body');
        return;
      }

      setSaving(true);
      const draft = await supabaseService.createEmailDraft({
        enquiry_id: enquiryId,
        template_type: selectedTemplate,
        subject: emailSubject,
        body: emailBody,
      });

      Alert.alert('Success', 'Email draft saved', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      setError(errorMessage);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleShareEmail = async () => {
    try {
      const message = `Subject: ${emailSubject}\n\n${emailBody}`;
      await Share.share({
        message,
        title: 'Email Draft',
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleCopyToClipboard = () => {
    const emailText = `Subject: ${emailSubject}\n\n${emailBody}`;
    // Implement clipboard functionality (requires react-native-clipboard or similar)
    Alert.alert('Copied', 'Email content copied to clipboard');
  };

  const handleRegenerateEmail = () => {
    Alert.alert(
      'Regenerate Email',
      'This will overwrite the current email. Continue?',
      [
        { text: 'Cancel' },
        {
          text: 'Regenerate',
          onPress: () => handleGenerateEmail(),
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner visible={true} message="Loading Enquiry..." />;
  }

  if (!enquiry || !company) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Failed to load enquiry details" />
      </View>
    );
  }

  const templates = aiEmailService.getAvailableTemplates();

  return (
    <ScrollView style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Enquiry Context */}
      <SectionHeader title="Context" subtitle={company.name} />
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Company</Text>
            <Text style={styles.contextValue}>{company.name}</Text>
          </View>
          {contact && (
            <View style={styles.contextRow}>
              <Text style={styles.contextLabel}>Contact</Text>
              <Text style={styles.contextValue}>{contact.name}</Text>
            </View>
          )}
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Product Interest</Text>
            <Text style={styles.contextValue}>{enquiry.product_interest}</Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Status</Text>
            <Text style={styles.contextValue}>
              {enquiry.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {enquiry.estimated_value && (
            <View style={styles.contextRow}>
              <Text style={styles.contextLabel}>Est. Value</Text>
              <Text style={styles.contextValue}>${enquiry.estimated_value.toLocaleString()}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Divider />

      {/* Template Selection */}
      <SectionHeader title="Select Email Template" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.templatesScroll}
      >
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplate === template.id && styles.templateCardActive,
            ]}
            onPress={() => {
              setSelectedTemplate(template.id);
              setEmailSubject('');
              setEmailBody('');
              setEditMode(false);
            }}
          >
            <Text
              style={[
                styles.templateTitle,
                selectedTemplate === template.id && styles.templateTitleActive,
              ]}
            >
              {template.title}
            </Text>
            <Text
              style={[
                styles.templateDesc,
                selectedTemplate === template.id && styles.templateDescActive,
              ]}
            >
              {template.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Divider />

      {/* Generate Button */}
      {!emailBody && (
        <View style={styles.generateSection}>
          <Button
            mode="contained"
            icon="sparkles"
            onPress={handleGenerateEmail}
            loading={generating}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Email with AI'}
          </Button>
          <Text style={styles.generateHint}>
            AI will create a professional email based on the selected template
          </Text>
        </View>
      )}

      {/* Email Preview/Edit */}
      {emailBody && (
        <>
          <SectionHeader title={editMode ? 'Edit Email' : 'Email Preview'} />

          {editMode && (
            <View style={styles.editSection}>
              <TextInput
                label="Subject Line"
                value={emailSubject}
                onChangeText={setEmailSubject}
                mode="outlined"
                style={styles.subjectInput}
              />

              <TextInput
                label="Email Body"
                value={emailBody}
                onChangeText={setEmailBody}
                mode="outlined"
                style={styles.bodyInput}
                multiline
                numberOfLines={12}
                placeholder="Edit your email..."
              />
            </View>
          )}

          {!editMode && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.emailSubject}>{emailSubject}</Text>
                <Divider />
                <Text style={styles.emailBody}>{emailBody}</Text>
              </Card.Content>
            </Card>
          )}

          <View style={styles.emailActions}>
            {!editMode && (
              <>
                <Button
                  mode="outlined"
                  icon="pencil"
                  onPress={() => setEditMode(true)}
                  compact
                >
                  Edit
                </Button>
                <Button
                  mode="outlined"
                  icon="refresh"
                  onPress={handleRegenerateEmail}
                  compact
                >
                  Regenerate
                </Button>
              </>
            )}

            {editMode && (
              <Button
                mode="outlined"
                icon="eye"
                onPress={() => setEditMode(false)}
                compact
              >
                Preview
              </Button>
            )}

            <Button
              mode="outlined"
              icon="content-copy"
              onPress={handleCopyToClipboard}
              compact
            >
              Copy
            </Button>

            <Button
              mode="outlined"
              icon="share-variant"
              onPress={handleShareEmail}
              compact
            >
              Share
            </Button>
          </View>

          <Divider />

          {/* Save Draft */}
          <View style={styles.submitSection}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              icon="content-save"
              onPress={handleSaveDraft}
              loading={saving}
              style={styles.saveDraftButton}
            >
              Save Draft
            </Button>
          </View>
        </>
      )}

      {/* Info Section */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={COLORS.secondary}
            style={styles.infoIcon}
          />
          <Text style={styles.infoTitle}>About AI-Generated Emails</Text>
          <Text style={styles.infoText}>
            • AI generates professional, template-based emails{'\n'}
            • Always review before sending{'\n'}
            • Personalize with specific details{'\n'}
            • No sensitive data is used in generation{'\n'}
            • Saved as drafts for future use
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
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

  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contextLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_secondary,
    flex: 1,
  },
  contextValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },

  templatesScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  templateCard: {
    width: 160,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  templateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  templateTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
    marginBottom: SPACING.xs,
  },
  templateTitleActive: {
    color: '#FFFFFF',
  },
  templateDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text_secondary,
    lineHeight: 14,
  },
  templateDescActive: {
    color: '#E8F5E9',
  },

  generateSection: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  generateHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  editSection: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  subjectInput: {
    marginBottom: SPACING.lg,
  },
  bodyInput: {
    marginBottom: SPACING.lg,
  },

  emailSubject: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
    marginBottom: SPACING.md,
  },
  emailBody: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
    lineHeight: 24,
    marginTop: SPACING.md,
  },

  emailActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexWrap: 'wrap',
  },

  submitSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  saveDraftButton: {
    flex: 1,
  },

  infoCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  infoIcon: {
    marginBottom: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.secondary,
    lineHeight: 20,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default EmailComposeScreen;
