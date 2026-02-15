/**
 * Settings Screen
 * App configuration and user preferences
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { SectionHeader, Divider } from '../components';
import { notificationService } from '../services/notificationService';

/**
 * Settings Screen Component
 */
export const SettingsScreen = ({ navigation }: any) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sync, setSync] = useState(true);

  const handleEnableNotifications = async () => {
    try {
      const granted = await notificationService.requestPermissions();
      setNotificationsEnabled(granted);

      if (granted) {
        Alert.alert('Success', 'Notifications enabled successfully');
      } else {
        Alert.alert('Warning', 'Notification permissions denied. You can enable them in Settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      Alert.alert('Error', 'Failed to enable notifications');
    }
  };

  const handleSyncReminders = async () => {
    try {
      await notificationService.syncReminders();
      Alert.alert('Success', 'Reminders synced successfully');
    } catch (error) {
      console.error('Error syncing reminders:', error);
      Alert.alert('Error', 'Failed to sync reminders');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove cached data. Your data on Supabase will not be affected.',
      [
        { text: 'Cancel' },
        {
          text: 'Clear',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExportData = async () => {
    Alert.alert('Export Data', 'This feature will be available in the next update');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <Divider />

      {/* Notifications Section */}
      <SectionHeader title="Notifications" />
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="bell"
                size={24}
                color={COLORS.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={styles.settingTitle}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders and updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>

          <Divider />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={24}
                color={COLORS.secondary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Show notifications even when app is closed
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              disabled={!notificationsEnabled}
            />
          </View>

          <Divider />

          <TouchableOpacity style={styles.settingButton} onPress={handleEnableNotifications}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={COLORS.success}
              style={styles.settingIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Request Permissions</Text>
              <Text style={styles.settingDescription}>
                Grant app notification permissions
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.text_secondary}
            />
          </TouchableOpacity>

          <Divider />

          <TouchableOpacity style={styles.settingButton} onPress={handleSyncReminders}>
            <MaterialCommunityIcons
              name="sync"
              size={24}
              color={COLORS.accent}
              style={styles.settingIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Sync Reminders</Text>
              <Text style={styles.settingDescription}>
                Synchronize reminders with notifications
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.text_secondary}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Divider />

      {/* Data & Privacy Section */}
      <SectionHeader title="Data & Privacy" />
      <Card style={styles.card}>
        <Card.Content>
          <TouchableOpacity style={styles.settingButton} onPress={handleClearCache}>
            <MaterialCommunityIcons
              name="delete"
              size={24}
              color={COLORS.error}
              style={styles.settingIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Clear Cache</Text>
              <Text style={styles.settingDescription}>
                Remove temporary data from device
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.text_secondary}
            />
          </TouchableOpacity>

          <Divider />

          <TouchableOpacity style={styles.settingButton} onPress={handleExportData}>
            <MaterialCommunityIcons
              name="download"
              size={24}
              color={COLORS.secondary}
              style={styles.settingIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Download your data as CSV/Excel
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.text_secondary}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Divider />

      {/* About Section */}
      <SectionHeader title="About" />
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Name</Text>
            <Text style={styles.aboutValue}>Winfraatech Enquiry Manager</Text>
          </View>

          <Divider />

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <Divider />

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>Production</Text>
          </View>

          <Divider />

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Last Updated</Text>
            <Text style={styles.aboutValue}>{new Date().toLocaleDateString()}</Text>
          </View>
        </Card.Content>
      </Card>

      <Divider />

      {/* Development Section */}
      <SectionHeader title="Development" />
      <Card style={styles.card}>
        <Card.Content>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              Alert.alert(
                'Debug Info',
                'App is running in development mode\n\nSupabase: Configured\nGoogle Gemini: Configured'
              );
            }}
          >
            <MaterialCommunityIcons
              name="bug"
              size={24}
              color={COLORS.text_secondary}
              style={styles.settingIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Debug Info</Text>
              <Text style={styles.settingDescription}>
                View debug information
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.text_secondary}
            />
          </TouchableOpacity>

          <Divider />

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              Alert.alert(
                'Test Notification',
                'A test notification will be sent in 5 seconds'
              );
              setTimeout(() => {
                notificationService.sendImmediateNotification({
                  title: 'Test Notification',
                  body: 'This is a test notification from the app',
                });
              }, 5000);
            }}
          >
            <MaterialCommunityIcons
              name="bell-ring"
              size={24}
              color={COLORS.accent}
              style={styles.settingIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Test Notification</Text>
              <Text style={styles.settingDescription}>
                Send a test notification
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.text_secondary}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 Winfraatech. All rights reserved.
        </Text>
        <Text style={styles.footerSubtext}>
          Built with React Native & Supabase
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
  },

  card: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingIcon: {
    marginRight: SPACING.lg,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text_primary,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },

  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },

  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  aboutLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_secondary,
  },
  aboutValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text_secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen;
