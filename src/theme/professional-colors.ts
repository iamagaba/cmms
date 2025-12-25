/**
 * Professional CMMS Design System - Industrial Color Palette
 * 
 * This color system is specifically designed for maintenance management applications,
 * incorporating industrial themes while maintaining professional credibility.
 * 
 * Color Philosophy:
 * - Steel Blues: Reliability, precision, industrial machinery
 * - Safety Oranges: Alerts, warnings, high-priority items
 * - Machinery Grays: Neutral backgrounds, secondary elements
 * - Industrial Greens: Success states, operational status
 * - Warning Reds: Errors, critical issues, safety concerns
 */

// ============================================
// PRIMITIVE COLOR TOKENS
// ============================================

/**
 * Steel Blue - Primary Brand Color
 * Represents reliability, precision, and industrial strength
 */
export const steelBlue = {
  50: '#f0f7ff',
  100: '#e0efff',
  200: '#b9dfff',
  300: '#7cc8ff',
  400: '#36b0ff',
  500: '#0c96f1',
  600: '#0077ce',  // Primary brand color
  700: '#005fa6',
  800: '#035189',
  900: '#094372',
  950: '#062a4b',
} as const;

/**
 * Safety Orange - Alert and Warning Color
 * Used for high-priority items, warnings, and attention-grabbing elements
 */
export const safetyOrange = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',  // Primary safety orange
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
} as const;

/**
 * Machinery Gray - Neutral Color System
 * Professional grays inspired by industrial machinery and equipment
 */
export const machineryGray = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',  // Primary neutral
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const;

/**
 * Industrial Green - Success and Operational Status
 * Represents successful operations, completed tasks, and positive states
 */
export const industrialGreen = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',  // Primary success color
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
} as const;

/**
 * Warning Red - Error and Critical States
 * Used for errors, critical issues, and safety-related warnings
 */
export const warningRed = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',  // Primary error color
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
} as const;

/**
 * Maintenance Yellow - Caution and Pending States
 * Used for pending operations, maintenance schedules, and caution indicators
 */
export const maintenanceYellow = {
  50: '#fefce8',
  100: '#fef9c3',
  200: '#fef08a',
  300: '#fde047',
  400: '#facc15',
  500: '#eab308',  // Primary warning color
  600: '#ca8a04',
  700: '#a16207',
  800: '#854d0e',
  900: '#713f12',
  950: '#422006',
} as const;

// ============================================
// SEMANTIC COLOR TOKENS
// ============================================

/**
 * Primary Brand Colors
 * Main brand identity colors for the CMMS application
 */
export const primaryColors = {
  primary: steelBlue[600],
  primaryLight: steelBlue[500],
  primaryDark: steelBlue[700],
  primaryContrast: '#ffffff',
} as const;

/**
 * Semantic Status Colors
 * Colors that convey meaning and context in the application
 */
export const semanticColors = {
  // Success states
  success: industrialGreen[500],
  successLight: industrialGreen[400],
  successDark: industrialGreen[600],
  successBg: industrialGreen[50],
  successBorder: industrialGreen[200],
  
  // Warning states
  warning: maintenanceYellow[500],
  warningLight: maintenanceYellow[400],
  warningDark: maintenanceYellow[600],
  warningBg: maintenanceYellow[50],
  warningBorder: maintenanceYellow[200],
  
  // Error states
  error: warningRed[500],
  errorLight: warningRed[400],
  errorDark: warningRed[600],
  errorBg: warningRed[50],
  errorBorder: warningRed[200],
  
  // Info states
  info: steelBlue[500],
  infoLight: steelBlue[400],
  infoDark: steelBlue[600],
  infoBg: steelBlue[50],
  infoBorder: steelBlue[200],
  
  // Alert states (high priority)
  alert: safetyOrange[500],
  alertLight: safetyOrange[400],
  alertDark: safetyOrange[600],
  alertBg: safetyOrange[50],
  alertBorder: safetyOrange[200],
} as const;

/**
 * Work Order Status Colors
 * Specific colors for different work order states in maintenance workflows
 */
export const workOrderStatusColors = {
  // New work orders
  new: {
    color: steelBlue[600],
    bg: steelBlue[50],
    border: steelBlue[200],
    text: steelBlue[800],
  },
  
  // In progress work orders
  inProgress: {
    color: safetyOrange[500],
    bg: safetyOrange[50],
    border: safetyOrange[200],
    text: safetyOrange[800],
  },
  
  // On hold work orders
  onHold: {
    color: maintenanceYellow[500],
    bg: maintenanceYellow[50],
    border: maintenanceYellow[200],
    text: maintenanceYellow[800],
  },
  
  // Completed work orders
  completed: {
    color: industrialGreen[500],
    bg: industrialGreen[50],
    border: industrialGreen[200],
    text: industrialGreen[800],
  },
  
  // Cancelled work orders
  cancelled: {
    color: warningRed[500],
    bg: warningRed[50],
    border: warningRed[200],
    text: warningRed[800],
  },
  
  // Scheduled work orders
  scheduled: {
    color: machineryGray[500],
    bg: machineryGray[50],
    border: machineryGray[200],
    text: machineryGray[800],
  },
} as const;

/**
 * Priority Level Colors
 * Visual hierarchy for different priority levels in maintenance operations
 */
export const priorityColors = {
  critical: {
    color: warningRed[600],
    bg: warningRed[50],
    border: warningRed[300],
    text: warningRed[900],
    icon: warningRed[600],
  },
  
  high: {
    color: safetyOrange[600],
    bg: safetyOrange[50],
    border: safetyOrange[300],
    text: safetyOrange[900],
    icon: safetyOrange[600],
  },
  
  medium: {
    color: maintenanceYellow[600],
    bg: maintenanceYellow[50],
    border: maintenanceYellow[300],
    text: maintenanceYellow[900],
    icon: maintenanceYellow[600],
  },
  
  low: {
    color: machineryGray[500],
    bg: machineryGray[50],
    border: machineryGray[300],
    text: machineryGray[800],
    icon: machineryGray[500],
  },
  
  routine: {
    color: industrialGreen[500],
    bg: industrialGreen[50],
    border: industrialGreen[300],
    text: industrialGreen[800],
    icon: industrialGreen[500],
  },
} as const;

/**
 * Asset Status Colors
 * Colors for different asset operational states
 */
export const assetStatusColors = {
  operational: {
    color: industrialGreen[500],
    bg: industrialGreen[50],
    border: industrialGreen[200],
    text: industrialGreen[800],
  },
  
  maintenance: {
    color: maintenanceYellow[500],
    bg: maintenanceYellow[50],
    border: maintenanceYellow[200],
    text: maintenanceYellow[800],
  },
  
  outOfService: {
    color: warningRed[500],
    bg: warningRed[50],
    border: warningRed[200],
    text: warningRed[800],
  },
  
  retired: {
    color: machineryGray[400],
    bg: machineryGray[50],
    border: machineryGray[200],
    text: machineryGray[700],
  },
} as const;

// ============================================
// DATA VISUALIZATION COLORS
// ============================================

/**
 * Chart Color Palette
 * Carefully selected colors for data visualization that maintain accessibility
 * and provide clear distinction between data series
 */
export const chartColors = {
  primary: [
    steelBlue[500],
    safetyOrange[500],
    industrialGreen[500],
    maintenanceYellow[500],
    warningRed[500],
    machineryGray[500],
  ],
  
  extended: [
    steelBlue[500],
    safetyOrange[500],
    industrialGreen[500],
    maintenanceYellow[500],
    warningRed[500],
    machineryGray[500],
    steelBlue[400],
    safetyOrange[400],
    industrialGreen[400],
    maintenanceYellow[400],
    warningRed[400],
    machineryGray[400],
  ],
  
  // Gradient colors for advanced visualizations
  gradients: {
    steelBlue: [steelBlue[200], steelBlue[600]],
    safetyOrange: [safetyOrange[200], safetyOrange[600]],
    industrialGreen: [industrialGreen[200], industrialGreen[600]],
    maintenanceYellow: [maintenanceYellow[200], maintenanceYellow[600]],
    warningRed: [warningRed[200], warningRed[600]],
  },
} as const;

// ============================================
// NEUTRAL COLORS
// ============================================

/**
 * Neutral Color System
 * Professional grays for backgrounds, borders, and text
 */
export const neutralColors = {
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: machineryGray[50],
    tertiary: machineryGray[100],
    elevated: '#ffffff',
  },
  
  // Surface colors
  surface: {
    primary: '#ffffff',
    secondary: machineryGray[50],
    tertiary: machineryGray[100],
    overlay: 'rgba(15, 23, 42, 0.8)', // machineryGray[900] with opacity
  },
  
  // Border colors
  border: {
    primary: machineryGray[200],
    secondary: machineryGray[300],
    focus: steelBlue[500],
    error: warningRed[300],
  },
  
  // Text colors
  text: {
    primary: machineryGray[900],
    secondary: machineryGray[700],
    tertiary: machineryGray[500],
    disabled: machineryGray[400],
    inverse: '#ffffff',
  },
} as const;

// ============================================
// EXPORTS
// ============================================

export const professionalColors = {
  // Primitive colors
  steelBlue,
  safetyOrange,
  machineryGray,
  industrialGreen,
  warningRed,
  maintenanceYellow,
  
  // Semantic colors
  primary: primaryColors,
  semantic: semanticColors,
  workOrderStatus: workOrderStatusColors,
  priority: priorityColors,
  assetStatus: assetStatusColors,
  
  // Visualization colors
  chart: chartColors,
  
  // Neutral colors
  neutral: neutralColors,
} as const;

export default professionalColors;