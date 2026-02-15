/**
 * Dashboard Screen
 * Shows overview of enquiries, status summary, and quick actions
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import {
  LoadingSpinner,
  ErrorMessage,
  SummaryCard,
  SectionHeader,
  Divider,
  EnquiryCard,
  EmptyState,
} from '../components';
import { supabaseService } from '../services/supabaseService';
import { DashboardSummary, Enquiry } from '../types';
import { DateUtils } from '../utils';

/**
 * Dashboard Screen Component
 */
export const DashboardScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcomingEnquiries, setUpcomingEnquiries] = useState<Enquiry[]>([]);

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setError(null);
      const [summaryData, enquiriesData] = await Promise.all([
        supabaseService.getDashboardSummary(),
        supabaseService.getEnquiries(undefined, 5, 0),
      ]);

      setSummary(summaryData);
      
      // Get enquiries with upcoming follow-ups
      const upcoming = enquiriesData.filter(e => {
        if (!e.next_follow_up) return false;
        const daysUntil = DateUtils.daysUntilDate(e.next_follow_up);
        return daysUntil >= 0 && daysUntil <= 7;
      });
      
      setUpcomingEnquiries(upcoming);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner visible={true} message="Loading Dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back!</Text>
      </View>

      {/* Summary Cards */}
      {summary && (
        <>
          <SectionHeader title="Overview" />
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryScroll}
          >
            <SummaryCard
              title="Total Enquiries"
              value={summary.total_enquiries}
              color={COLORS.secondary}
            />
            <SummaryCard
              title="New"
              value={summary.new_count}
              icon="new"
              color={COLORS.secondary}
              onPress={() =>
                navigation.navigate('EnquiryList', { filterStatus: 'new' })
              }
            />
            <SummaryCard
              title="In Progress"
              value={summary.in_progress_count}
              color={COLORS.accent}
              onPress={() =>
                navigation.navigate('EnquiryList', { filterStatus: 'in_progress' })
              }
            />
            <SummaryCard
              title="Quoted"
              value={summary.quoted_count}
              color="#9C27B0"
              onPress={() =>
                navigation.navigate('EnquiryList', { filterStatus: 'quoted' })
              }
            />
            <SummaryCard
              title="Won"
              value={summary.won_count}
              color={COLORS.success}
              onPress={() =>
                navigation.navigate('EnquiryList', { filterStatus: 'won' })
              }
            />
          </ScrollView>

          <Divider />

          {/* Pipeline Value */}
          <View style={styles.pipelineCard}>
            <Card style={styles.card}>
              <Card.Content style={styles.pipelineContent}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={32}
                  color={COLORS.primary}
                />
                <View>
                  <Text style={styles.pipelineLabel}>Total Pipeline Value</Text>
                  <Text style={styles.pipelineValue}>
                    ${summary.total_estimated_value.toLocaleString()}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        </>
      )}

      {/* Upcoming Follow-ups */}
      <SectionHeader
        title="Upcoming Follow-ups"
        subtitle={`${upcomingEnquiries.length} in next 7 days`}
      />

      {upcomingEnquiries.length > 0 ? (
        <View style={styles.enquiriesContainer}>
          {upcomingEnquiries.map((enquiry: any) => (
            <EnquiryCard
              key={enquiry.id}
              company={enquiry.company?.name || 'Unknown'}
              contact={enquiry.contact?.name}
              product={enquiry.product_interest}
              status={enquiry.status}
              value={enquiry.estimated_value}
              date={enquiry.next_follow_up ? DateUtils.getRelativeDateString(enquiry.next_follow_up) : 'No date'}
              onPress={() => navigation.navigate('EnquiryDetail', { enquiryId: enquiry.id })}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="🎯"
          title="No Follow-ups"
          description="All follow-ups are up to date"
        />
      )}

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddEnquiry')}
        >
          <MaterialCommunityIcons name="plus-circle" size={32} color={COLORS.primary} />
          <Text style={styles.actionLabel}>New Enquiry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EnquiryList')}
        >
          <MaterialCommunityIcons name="format-list-bulleted" size={32} color={COLORS.secondary} />
          <Text style={styles.actionLabel}>View All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // Export functionality
            console.log('Export action');
          }}
        >
          <MaterialCommunityIcons name="download" size={32} color={COLORS.accent} />
          <Text style={styles.actionLabel}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialCommunityIcons name="cog" size={32} color={COLORS.disabled} />
          <Text style={styles.actionLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing */}
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
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text_secondary,
    marginTop: SPACING.xs,
  },

  summaryScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },

  pipelineCard: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
  },
  card: {
    borderRadius: 12,
  },
  pipelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  pipelineLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_secondary,
  },
  pipelineValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },

  enquiriesContainer: {
    marginBottom: SPACING.lg,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    width: '48%',
    marginHorizontal: '1%',
    marginVertical: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text_primary,
    marginTop: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  bottomSpacing: {
    height: 100,
  },
});

export default DashboardScreen;
