/**
 * Enquiry List Screen
 * Display enquiries with advanced filtering and search
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { Text, Button, Card, TextInput, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, STATUS_LABELS } from '../constants';
import {
  LoadingSpinner,
  ErrorMessage,
  SectionHeader,
  EnquiryCard,
  EmptyState,
  ModalHeader,
  Divider,
} from '../components';
import { supabaseService } from '../services/supabaseService';
import { Enquiry, EnquiryWithRelations, EnquiryFilterOptions, EnquiryStatus } from '../types';
import { ExportUtils, DateUtils } from '../utils';

const AVAILABLE_STATUSES: EnquiryStatus[] = ['new', 'in_progress', 'quoted', 'won', 'lost', 'on_hold'];

/**
 * Enquiry List Screen Component
 */
export const EnquiryListScreen = ({ navigation, route }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryWithRelations[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<EnquiryWithRelations[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<EnquiryFilterOptions>({
    status: route.params?.filterStatus ? [route.params.filterStatus] : undefined,
  });

  const [tempFilters, setTempFilters] = useState<EnquiryFilterOptions>(filters);

  // Load enquiries
  const loadEnquiries = async () => {
    try {
      setError(null);
      const data = await supabaseService.getEnquiries(filters, 100, 0);
      setEnquiries(data);
      applySearch(data, searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load enquiries';
      setError(errorMessage);
      console.error('Enquiry list error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (data: EnquiryWithRelations[], term: string) => {
    if (!term) {
      setFilteredEnquiries(data);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = data.filter((enquiry) => {
      const company = enquiry.company?.name?.toLowerCase() || '';
      const contact = enquiry.contact?.name?.toLowerCase() || '';
      const product = enquiry.product_interest?.toLowerCase() || '';

      return company.includes(lowerTerm) || contact.includes(lowerTerm) || product.includes(lowerTerm);
    });

    setFilteredEnquiries(filtered);
  };

  useEffect(() => {
    loadEnquiries();
  }, [filters]);

  useEffect(() => {
    applySearch(enquiries, searchTerm);
  }, [searchTerm, enquiries]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEnquiries();
    setRefreshing(false);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: undefined,
      owner: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      productInterest: undefined,
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setSearchTerm('');
    setShowFilters(false);
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setExporting(true);
      const exportData = await supabaseService.getEnquiriesForExport(filters);
      await ExportUtils.exportEnquiries(exportData, format);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner visible={true} message="Loading Enquiries..." />;
  }

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={24} color={COLORS.text_secondary} />
        <TextInput
          placeholder="Search by company, contact, product..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
          placeholderTextColor={COLORS.text_secondary}
        />
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <MaterialCommunityIcons name="filter" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(filters.status && filters.status.length > 0) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {filters.status.map((status) => (
            <Chip key={status} style={styles.filterChip} mode="flat">
              {STATUS_LABELS[status]}
            </Chip>
          ))}
          <Chip
            style={styles.clearFilterChip}
            mode="flat"
            onPress={handleResetFilters}
            icon="close"
          >
            Clear
          </Chip>
        </ScrollView>
      )}

      {/* Enquiries List */}
      {filteredEnquiries.length > 0 ? (
        <FlatList
          data={filteredEnquiries}
          renderItem={({ item }) => (
            <EnquiryCard
              company={item.company?.name || 'Unknown'}
              contact={item.contact?.name}
              product={item.product_interest}
              status={item.status}
              value={item.estimated_value}
              date={DateUtils.formatDate(item.enquiry_date)}
              onPress={() => navigation.navigate('EnquiryDetail', { enquiryId: item.id })}
            />
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListFooterComponent={<View style={styles.footer} />}
        />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.emptyContainer}
        >
          <EmptyState
            icon="📋"
            title="No Enquiries Found"
            description="Try adjusting your search or filters"
            actionLabel="Create Enquiry"
            onAction={() => navigation.navigate('AddEnquiry')}
          />
        </ScrollView>
      )}

      {/* Bottom Action Buttons */}
      {filteredEnquiries.length > 0 && (
        <View style={styles.bottomActions}>
          <Button
            mode="outlined"
            onPress={() => handleExport('csv')}
            disabled={exporting}
            icon="download"
          >
            CSV
          </Button>
          <Button
            mode="contained"
            onPress={() => handleExport('xlsx')}
            disabled={exporting}
            icon="download"
            style={styles.excelButton}
          >
            Excel
          </Button>
        </View>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.filterModal}>
          <ModalHeader
            title="Filters"
            onClose={() => setShowFilters(false)}
          />

          <ScrollView style={styles.filterContent}>
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.chipGroup}>
                {AVAILABLE_STATUSES.map((status) => (
                  <Chip
                    key={status}
                    mode={tempFilters.status?.includes(status) ? 'flat' : 'outlined'}
                    selected={tempFilters.status?.includes(status)}
                    onPress={() => {
                      const newStatuses = tempFilters.status?.includes(status)
                        ? tempFilters.status.filter((s) => s !== status)
                        : [...(tempFilters.status || []), status];

                      setTempFilters({
                        ...tempFilters,
                        status: newStatuses.length > 0 ? newStatuses : undefined,
                      });
                    }}
                    style={styles.filterChip}
                  >
                    {STATUS_LABELS[status]}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider />

            {/* More filters can be added here */}
          </ScrollView>

          {/* Filter Actions */}
          <View style={styles.filterActions}>
            <Button mode="outlined" onPress={handleResetFilters}>
              Reset
            </Button>
            <Button
              mode="contained"
              onPress={handleApplyFilters}
              style={styles.applyButton}
            >
              Apply
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    height: 40,
  },

  filtersScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  clearFilterChip: {
    marginRight: SPACING.md,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  excelButton: {
    flex: 1,
  },

  footer: {
    height: 100,
  },

  // Filter Modal Styles
  filterModal: {
    flex: 1,
    backgroundColor: COLORS.surface,
    marginTop: 40,
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text_primary,
    marginBottom: SPACING.md,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  filterActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  applyButton: {
    flex: 1,
  },
});

export default EnquiryListScreen;
