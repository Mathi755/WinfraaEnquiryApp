/**
 * Notification Service
 * Handles push notifications and reminders
 */

import * as Notifications from 'expo-notifications';
import { NotificationPayload, Reminder } from '../types';
import { supabaseService } from './supabaseService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Notification Service
 */
class NotificationService {
  private scheduledNotifications: Map<string, string> = new Map(); // Map of reminder ID to notification ID

  /**
   * Initialize and request permissions
   */
  async initializeNotifications(): Promise<void> {
    try {
      // Request permissions
      const { granted } = await Notifications.requestPermissionsAsync();

      if (!granted) {
        console.warn('Notification permissions not granted');
        return;
      }

      // Setup notification response listener
      this.setupNotificationResponseListener();

      // Sync existing reminders
      await this.syncReminders();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  /**
   * Setup listener for notification responses
   */
  private setupNotificationResponseListener(): void {
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.enquiry_id) {
        // Handle enquiry notification tap
        console.log('Enquiry notification tapped:', data.enquiry_id);
        // Navigation should be handled by parent component
      }

      if (data?.reminder_id) {
        // Mark reminder as viewed/handled
        this.handleReminderNotificationTapped(data.reminder_id);
      }
    });
  }

  /**
   * Schedule a notification
   */
  async scheduleNotification(
    payload: NotificationPayload,
    triggerDate: Date
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: true,
          badge: 1,
        },
        trigger: {
          date: triggerDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Schedule a local push notification after a delay
   */
  async scheduleLocalNotification(
    payload: NotificationPayload,
    delayInSeconds: number
  ): Promise<string | null> {
    try {
      const triggerDate = new Date(Date.now() + delayInSeconds * 1000);
      return await this.scheduleNotification(payload, triggerDate);
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  /**
   * Schedule reminder notification
   */
  async scheduleReminderNotification(reminder: Reminder): Promise<void> {
    try {
      const reminderDate = new Date(reminder.reminder_date);

      // Check if reminder date is in the future
      if (reminderDate <= new Date()) {
        console.warn('Reminder date is in the past, skipping scheduling');
        return;
      }

      const notificationPayload: NotificationPayload = {
        title: 'Follow-up Reminder',
        body: reminder.title,
        data: {
          reminder_id: reminder.id,
          enquiry_id: reminder.enquiry_id,
          screen: 'EnquiryDetail',
        },
      };

      const notificationId = await this.scheduleNotification(notificationPayload, reminderDate);

      if (notificationId) {
        this.scheduledNotifications.set(reminder.id, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel reminder notification by reminder ID
   */
  async cancelReminderNotification(reminderId: string): Promise<void> {
    try {
      const notificationId = this.scheduledNotifications.get(reminderId);
      if (notificationId) {
        await this.cancelNotification(notificationId);
        this.scheduledNotifications.delete(reminderId);
      }
    } catch (error) {
      console.error('Error canceling reminder notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Sync reminders with notifications on app start
   */
  async syncReminders(): Promise<void> {
    try {
      // Get all upcoming reminders
      const reminders = await supabaseService.getUpcomingReminders(30); // Next 30 days

      // Cancel all existing notifications
      await this.cancelAllNotifications();

      // Schedule notifications for all reminders
      for (const reminder of reminders) {
        if (!reminder.is_completed) {
          await this.scheduleReminderNotification(reminder);
        }
      }

      console.log(`Synced ${reminders.length} reminders`);
    } catch (error) {
      console.error('Error syncing reminders:', error);
    }
  }

  /**
   * Handle reminder notification tap
   */
  private async handleReminderNotificationTapped(reminderId: string): Promise<void> {
    try {
      // Update reminder as handled (optional)
      // await supabaseService.updateReminder(reminderId, { is_completed: true });
      console.log('Reminder notification handled:', reminderId);
    } catch (error) {
      console.error('Error handling reminder notification:', error);
    }
  }

  /**
   * Send immediate notification (for testing)
   */
  async sendImmediateNotification(payload: NotificationPayload): Promise<void> {
    try {
      await this.scheduleLocalNotification(payload, 1); // Send after 1 second
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  /**
   * Request permissions  
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { granted } = await Notifications.requestPermissionsAsync();
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default NotificationService;
