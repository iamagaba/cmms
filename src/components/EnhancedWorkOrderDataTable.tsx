import React, { useState } from 'react';
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CircleIcon,
  Loading03Icon,
  CheckmarkCircle01Icon,
  PauseIcon,
  CancelCircleIcon,
  ArrowUp01Icon,
  MinusSignIcon,
  ArrowDown01Icon,
  ClipboardIcon,
  MoreVerticalIcon,
  ViewIcon,
  Edit01Icon,
  Delete01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Format relative time in compact format (1m ago, 2h ago, 3d ago, etc.)
const formatRelativeTime = (date: string | Date) => {
  const now = dayjs();
  const then = dayjs(date);
  const diffMinutes = now.diff(then, 'minute');
  const diffHours = now.diff(then, 'hour');
  const diffDays = now.diff(then, 'day');
  const diffMonths = now.diff(then, 'month');
  const diffYears = now.diff(then, 'year');

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

interface EnhancedWorkOrderDataTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  locations: Location[];
  customers: Customer[];
  vehicles: Vehicle[];
  profiles: Profile[];
  serviceCategories?: DiagnosticCategoryRow[];
  onEdit: (workOrder: WorkOrder) => void;
  onDelete: (workOrder: WorkOrder) => void;
  onUpdateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onViewDetails: (workOrderId: string) => void;
  loading?: boolean;
  selectedRecords?: WorkOrder[];
  onSelectedRecordsChange?: (records: WorkOrder[]) => void;
  enableBulkActions?: boolean;
  enableAdvancedFilters?: boolean;
  enableExport?: boolean;
  compactMode?: boolean;
  visibleColumns?: string[];
}

// Status configuration with colors and icons
const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: any; dot: string }> = {
  'Open': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CircleIcon, dot: 'bg-blue-500' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Loading03Icon, dot: 'bg-amber-500' },
  'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckmarkCircle01Icon, dot: 'bg-emerald-500' },
  'On Hold': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: PauseIcon, dot: 'bg-slate-400' },
  'Cancelled': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: CancelCircleIcon, dot: 'bg-red-500' },
};

// Priority configuration
const PRIORITY_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  'High': { color: 'text-red-600', icon: ArrowUp01Icon, label: 'High' },
  'Medium': { color: 'text-amber-600', icon: MinusSignIcon, label: 'Medium' },
  'Low': { color: 'text-emerald-600', icon: ArrowDown01Icon, label: 'Low' },
};

// Loading skeleton row
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-48" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-8" /></td>
  </tr>
);

// Default columns if none specified (removed 'actions')
const DEFAULT_COLUMNS = ['workOrderNumber', 'service', 'vehicleCustomer', 'status', 'priority', 'technician'];

export function EnhancedWorkOrderDataTable({
  workOrders,
  technicians,
  vehicles,
  customers,
  serviceCategories,
  onEdit,
  onDelete,
  onViewDetails,
  loading = false,
  visibleColumns = DEFAULT_COLUMNS,
}: EnhancedWorkOrderDataTableProps) {

  // State for the 3-dot menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalPages = Math.ceil(workOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWorkOrders = workOrders.slice(startIndex, endIndex);

  // Reset to page 1 when workOrders change (e.g., filters applied)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [workOrders.length]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add pages around current
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Helper to check if column is visible
  const isColumnVisible = (columnKey: string) => visibleColumns.includes(columnKey);

  // Helper to get vehicle info
  const getVehicleInfo = (vehicleId?: string | null) => {
    if (!vehicleId) return null;
    return vehicles?.find(v => v.id === vehicleId);
  };

  // Helper to get customer info
  const getCustomerInfo = (customerId?: string | null) => {
    if (!customerId) return null;
    return customers?.find(c => c.id === customerId);
  };

  // Helper to get technician info
  const getTechnicianInfo = (techId?: string | null) => {
    if (!techId) return null;
    return technicians?.find(t => t.id === techId);
  };

  // Helper to get service category info
  const getServiceCategoryInfo = (serviceId?: string | null) => {
    if (!serviceId) return null;
    return serviceCategories?.find(c => c.id === serviceId);
  };

  // Close menu when clicking outside
  const closeMenu = () => setOpenMenuId(null);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <HugeiconsIcon icon={ClipboardIcon} size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No work orders found</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          There are no work orders matching your criteria. Try adjusting your filters or create a new work order.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 h-full flex flex-col">
      {/* Click outside to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={closeMenu} />
      )}

      <div className="flex-1">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {isColumnVisible('workOrderNumber') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">Work Order</th>
              )}
              {isColumnVisible('service') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">Issue</th>
              )}
              {isColumnVisible('vehicleCustomer') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-44">Vehicle / Customer</th>
              )}
              {isColumnVisible('status') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Status</th>
              )}
              {isColumnVisible('priority') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Priority</th>
              )}
              {isColumnVisible('technician') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">Technician</th>
              )}
              {isColumnVisible('createdAt') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Created</th>
              )}
              {isColumnVisible('scheduledDate') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Scheduled</th>
              )}
              {isColumnVisible('dueDate') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Due Date</th>
              )}
              {isColumnVisible('channel') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Channel</th>
              )}
              {isColumnVisible('customerName') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">Customer</th>
              )}
              {isColumnVisible('location') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">Location</th>
              )}
              {/* 3-dot menu column - always visible, minimal width */}
              <th className="w-10 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedWorkOrders.map((wo) => {
              const statusConfig = STATUS_CONFIG[wo.status || 'Open'] || STATUS_CONFIG['Open'];
              const priorityConfig = PRIORITY_CONFIG[wo.priority || 'Medium'] || PRIORITY_CONFIG['Medium'];
              const vehicle = getVehicleInfo(wo.vehicleId);
              const customer = getCustomerInfo(wo.customerId);
              const technician = getTechnicianInfo(wo.assignedTechnicianId);
              const isMenuOpen = openMenuId === wo.id;

              return (
                <tr
                  key={wo.id}
                  onClick={() => onViewDetails(wo.id)}
                  className="group hover:bg-primary-50/50 cursor-pointer transition-colors duration-150"
                >
                  {/* Work Order Number - Shows license plate as main identifier */}
                  {isColumnVisible('workOrderNumber') && (
                    <td className="px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary-600 group-hover:text-primary-700 truncate">
                          {vehicle?.license_plate || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {wo.workOrderNumber || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
                        </p>
                      </div>
                    </td>
                  )}

                  {/* Issue Description - 2 line clamp */}
                  {isColumnVisible('service') && (
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium text-gray-900 capitalize line-clamp-2" title={getServiceCategoryInfo(wo.service)?.label || getServiceCategoryInfo(wo.service)?.name || wo.service || wo.initialDiagnosis || 'General Service'}>
                        {getServiceCategoryInfo(wo.service)?.label || getServiceCategoryInfo(wo.service)?.name || wo.service || wo.initialDiagnosis || 'General Service'}
                      </p>
                    </td>
                  )}

                  {/* Vehicle / Customer - Shows vehicle make/model and customer name */}
                  {isColumnVisible('vehicleCustomer') && (
                    <td className="px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'N/A' : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {customer?.name || wo.customerName || '—'}
                        </p>
                      </div>
                    </td>
                  )}

                  {/* Status - Shows full status text with colored badge */}
                  {isColumnVisible('status') && (
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        <span>{wo.status || 'Open'}</span>
                      </span>
                    </td>
                  )}

                  {/* Priority */}
                  {isColumnVisible('priority') && (
                    <td className="px-4 py-2.5">
                      <div className={`inline-flex items-center gap-1 ${priorityConfig.color}`}>
                        <HugeiconsIcon icon={priorityConfig.icon} size={14} />
                        <span className="text-xs font-medium">{wo.priority || 'Medium'}</span>
                      </div>
                    </td>
                  )}

                  {/* Technician */}
                  {isColumnVisible('technician') && (
                    <td className="px-4 py-2.5">
                      {technician ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-primary-700">
                              {technician.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700 truncate">{technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                  )}

                  {/* Created Date - Relative time format */}
                  {isColumnVisible('createdAt') && (
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-gray-700" title={dayjs(wo.created_at).format('MMM D, YYYY h:mm A')}>
                        {formatRelativeTime(wo.created_at)}
                      </span>
                    </td>
                  )}

                  {/* Scheduled Date */}
                  {isColumnVisible('scheduledDate') && (
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-gray-700">
                        {wo.scheduledDate ? dayjs(wo.scheduledDate).format('MMM D, YYYY') : '—'}
                      </span>
                    </td>
                  )}

                  {/* Due Date */}
                  {isColumnVisible('dueDate') && (
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-gray-700">
                        {wo.dueDate ? dayjs(wo.dueDate).format('MMM D, YYYY') : '—'}
                      </span>
                    </td>
                  )}

                  {/* Channel */}
                  {isColumnVisible('channel') && (
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-gray-700 truncate block">{wo.channel || '—'}</span>
                    </td>
                  )}

                  {/* Customer Name */}
                  {isColumnVisible('customerName') && (
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-gray-700 truncate block">{wo.customerName || customer?.name || '—'}</span>
                    </td>
                  )}

                  {/* Location */}
                  {isColumnVisible('location') && (
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-gray-700 truncate block" title={wo.customerAddress || ''}>
                        {wo.customerAddress || '—'}
                      </span>
                    </td>
                  )}

                  {/* 3-dot Actions Menu */}
                  <td className="px-2 py-2.5 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : wo.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(wo.id);
                            closeMenu();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HugeiconsIcon icon={ViewIcon} size={16} className="text-gray-500" />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(wo);
                            closeMenu();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HugeiconsIcon icon={Edit01Icon} size={16} className="text-gray-500" />
                          Edit
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(wo);
                            closeMenu();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex-none px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Showing X-Y of Z */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, workOrders.length)}</span> of <span className="font-medium">{workOrders.length}</span> work orders
            </p>
          </div>

          {/* Center: Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[32px] px-2 py-1 text-sm rounded transition-colors ${currentPage === page
                        ? 'bg-primary-600 text-white font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 py-1 text-sm text-gray-400">
                      {page}
                    </span>
                  )
                ))}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
              </button>
            </div>
          )}

          {/* Right: Items per page selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="items-per-page" className="text-sm text-gray-600 whitespace-nowrap">
              Per page:
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
