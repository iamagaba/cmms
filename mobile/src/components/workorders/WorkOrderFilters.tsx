import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
    Modal,
    Portal,
    Button,
    Text,
    Chip,
    Divider,
    RadioButton,
    useTheme,
} from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialIcons'; // Not used in this component
import { WorkOrderFilters, WorkOrderSortOptions } from '@/services/workOrderService';

interface WorkOrderFiltersModalProps {
    visible: boolean;
    onDismiss: () => void;
    filters: WorkOrderFilters;
    sortOptions: WorkOrderSortOptions;
    onApplyFilters: (filters: WorkOrderFilters, sort: WorkOrderSortOptions) => void;
    onClearFilters: () => void;
}

export const WorkOrderFiltersModal: React.FC<WorkOrderFiltersModalProps> = ({
    visible,
    onDismiss,
    filters,
    sortOptions,
    onApplyFilters,
    onClearFilters,
}) => {
    const theme = useTheme();

    const [localFilters, setLocalFilters] = useState<WorkOrderFilters>(filters);
    const [localSort, setLocalSort] = useState<WorkOrderSortOptions>(sortOptions);

    const statusOptions = ['Open', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
    const priorityOptions = ['Emergency', 'High', 'Medium', 'Low'];
    const sortFieldOptions = [
        { value: 'priority', label: 'Priority' },
        { value: 'appointmentDate', label: 'Appointment Date' },
        { value: 'createdAt', label: 'Created Date' },
        { value: 'distance', label: 'Distance' },
    ];

    const handleStatusToggle = (status: string) => {
        const currentStatuses = localFilters.status || [];
        const newStatuses = currentStatuses.includes(status)
            ? currentStatuses.filter(s => s !== status)
            : [...currentStatuses, status];

        setLocalFilters({
            ...localFilters,
            status: newStatuses.length > 0 ? newStatuses : undefined,
        });
    };

    const handlePriorityToggle = (priority: string) => {
        const currentPriorities = localFilters.priority || [];
        const newPriorities = currentPriorities.includes(priority)
            ? currentPriorities.filter(p => p !== priority)
            : [...currentPriorities, priority];

        setLocalFilters({
            ...localFilters,
            priority: newPriorities.length > 0 ? newPriorities : undefined,
        });
    };

    const handleApply = () => {
        onApplyFilters(localFilters, localSort);
        onDismiss();
    };

    const handleClear = () => {
        const clearedFilters: WorkOrderFilters = {};
        const defaultSort: WorkOrderSortOptions = { field: 'priority', direction: 'desc' };

        setLocalFilters(clearedFilters);
        setLocalSort(defaultSort);
        onClearFilters();
        onDismiss();
    };

    const hasActiveFilters = () => {
        return !!(
            localFilters.status?.length ||
            localFilters.priority?.length ||
            localFilters.searchQuery?.trim()
        );
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <Text variant="headlineSmall">Filter & Sort</Text>
                        <Button onPress={onDismiss} icon="close" mode="text">
                            Close
                        </Button>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Status Filter */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Status
                        </Text>
                        <View style={styles.chipContainer}>
                            {statusOptions.map(status => (
                                <Chip
                                    key={status}
                                    selected={localFilters.status?.includes(status)}
                                    onPress={() => handleStatusToggle(status)}
                                    style={styles.chip}>
                                    {status}
                                </Chip>
                            ))}
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Priority Filter */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Priority
                        </Text>
                        <View style={styles.chipContainer}>
                            {priorityOptions.map(priority => (
                                <Chip
                                    key={priority}
                                    selected={localFilters.priority?.includes(priority)}
                                    onPress={() => handlePriorityToggle(priority)}
                                    style={styles.chip}>
                                    {priority}
                                </Chip>
                            ))}
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Sort Options */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Sort By
                        </Text>
                        <RadioButton.Group
                            onValueChange={(value) =>
                                setLocalSort({ ...localSort, field: value as any })
                            }
                            value={localSort.field}>
                            {sortFieldOptions.map(option => (
                                <View key={option.value} style={styles.radioRow}>
                                    <RadioButton value={option.value} />
                                    <Text variant="bodyLarge" style={styles.radioLabel}>
                                        {option.label}
                                    </Text>
                                </View>
                            ))}
                        </RadioButton.Group>

                        <Text variant="titleMedium" style={[styles.sectionTitle, styles.sortDirectionTitle]}>
                            Sort Direction
                        </Text>
                        <RadioButton.Group
                            onValueChange={(value) =>
                                setLocalSort({ ...localSort, direction: value as 'asc' | 'desc' })
                            }
                            value={localSort.direction}>
                            <View style={styles.radioRow}>
                                <RadioButton value="asc" />
                                <Text variant="bodyLarge" style={styles.radioLabel}>
                                    Ascending
                                </Text>
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton value="desc" />
                                <Text variant="bodyLarge" style={styles.radioLabel}>
                                    Descending
                                </Text>
                            </View>
                        </RadioButton.Group>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            onPress={handleClear}
                            style={styles.actionButton}
                            disabled={!hasActiveFilters()}>
                            Clear All
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleApply}
                            style={styles.actionButton}>
                            Apply
                        </Button>
                    </View>
                </ScrollView>
            </Modal>
        </Portal>
    );
};

interface FilterChipBarProps {
    filters: WorkOrderFilters;
    sortOptions: WorkOrderSortOptions;
    onRemoveFilter: (filterType: string, value?: string) => void;
    onOpenFilters: () => void;
}

export const FilterChipBar: React.FC<FilterChipBarProps> = ({
    filters,
    sortOptions,
    onRemoveFilter,
    onOpenFilters,
}) => {
    const hasActiveFilters = !!(
        filters.status?.length ||
        filters.priority?.length ||
        filters.searchQuery?.trim()
    );

    if (!hasActiveFilters && sortOptions.field === 'priority' && sortOptions.direction === 'desc') {
        return null;
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipBar}
            contentContainerStyle={styles.chipBarContent}>

            {/* Sort chip */}
            {(sortOptions.field !== 'priority' || sortOptions.direction !== 'desc') && (
                <Chip
                    icon="sort"
                    onClose={() => onRemoveFilter('sort')}
                    style={styles.filterChip}>
                    Sort: {sortOptions.field} ({sortOptions.direction})
                </Chip>
            )}

            {/* Status chips */}
            {filters.status?.map(status => (
                <Chip
                    key={`status-${status}`}
                    onClose={() => onRemoveFilter('status', status)}
                    style={styles.filterChip}>
                    Status: {status}
                </Chip>
            ))}

            {/* Priority chips */}
            {filters.priority?.map(priority => (
                <Chip
                    key={`priority-${priority}`}
                    onClose={() => onRemoveFilter('priority', priority)}
                    style={styles.filterChip}>
                    Priority: {priority}
                </Chip>
            ))}

            {/* Search chip */}
            {filters.searchQuery?.trim() && (
                <Chip
                    onClose={() => onRemoveFilter('search')}
                    style={styles.filterChip}>
                    Search: {filters.searchQuery}
                </Chip>
            )}

            {/* Filter button */}
            <Button
                mode="outlined"
                icon="filter-list"
                onPress={onOpenFilters}
                style={styles.filterButton}
                compact>
                Filter
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    scrollView: {
        maxHeight: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    divider: {
        marginVertical: 8,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        marginBottom: 12,
        fontWeight: 'bold',
    },
    sortDirectionTitle: {
        marginTop: 16,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        marginRight: 8,
        marginBottom: 8,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    radioLabel: {
        marginLeft: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
    chipBar: {
        maxHeight: 50,
    },
    chipBarContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
    },
    filterChip: {
        marginRight: 8,
    },
    filterButton: {
        marginLeft: 8,
    },
});