/**
 * Professional CMMS Advanced Components
 * 
 * Centralized exports for all advanced components in Phase 4.
 * Provides comprehensive advanced functionality for desktop CMMS workflows.
 */

// Data Table System
export { default as ProfessionalDataTable } from './ProfessionalDataTable';
export type {
  ProfessionalDataTableProps,
  TableColumn,
  FilterConfig,
  BulkAction,
  ExportOption,
  SortConfig,
} from './ProfessionalDataTable';

// Form System
export { default as ProfessionalForm } from './ProfessionalForm';
export type {
  ProfessionalFormProps,
  FormConfig,
  FormSection,
  FormField,
  FieldType,
  ValidationRule,
  FieldOption,
} from './ProfessionalForm';

// Modal and Drawer System
export { default as ProfessionalModal, ProfessionalDrawer, ConfirmationDialog } from './ProfessionalModal';
export type {
  ModalProps,
  DrawerProps,
  ConfirmationDialogProps,
} from './ProfessionalModal';

// Chart and Visualization System
export {
  default as KPIChart,
  SimpleBarChart,
  SimplePieChart,
  Sparkline,
  MaintenanceMetrics,
} from './ProfessionalCharts';
export type {
  KPIChartProps,
  BarChartProps,
  PieChartProps,
  LineChartProps,
  ChartDataPoint,
  TimeSeriesDataPoint,
  ChartConfig,
  MaintenanceMetricsProps,
} from './ProfessionalCharts';

// Advanced Theme System
export { default as AdvancedThemeControls } from './AdvancedThemeControls';
export type { AdvancedThemeControlsProps } from './AdvancedThemeControls';