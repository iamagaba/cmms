/**
 * Icon Sizing Reference
 * 
 * Standardized icon sizes for consistent visual hierarchy across the application.
 * All icons should use these Tailwind classes instead of inline size props.
 * 
 * Usage:
 * ```tsx
 * import { ICON_SIZES } from '@/components/ui/icon-reference';
 * import { Home } from 'lucide-react';
 * 
 * // Standard size (20px) - most common
 * <Home className={ICON_SIZES.md} />
 * 
 * // Small size (16px) - buttons, inline labels
 * <Home className={ICON_SIZES.sm} />
 * 
 * // Large size (24px) - page titles, headers
 * <Home className={ICON_SIZES.lg} />
 * ```
 */

export const ICON_SIZES = {
  /**
   * Extra Small - 12px
   * Use for: Tiny indicators, dense UI elements
   */
  xs: 'w-3 h-3',
  
  /**
   * Small - 16px
   * Use for: Buttons, inline labels, small badges, table cells
   * Most common in compact UI elements
   */
  sm: 'w-4 h-4',
  
  /**
   * Medium - 20px (DEFAULT)
   * Use for: Card headers, navigation items, form labels
   * This is the standard size for most icons
   */
  md: 'w-5 h-5',
  
  /**
   * Large - 24px
   * Use for: Page titles, section headers, prominent actions
   */
  lg: 'w-6 h-6',
  
  /**
   * Extra Large - 32px
   * Use for: Hero sections, empty states, large feature cards
   */
  xl: 'w-8 h-8',
  
  /**
   * 2X Large - 40px
   * Use for: Login pages, splash screens, major empty states
   */
  '2xl': 'w-10 h-10',
} as const;

/**
 * Icon size type for TypeScript
 */
export type IconSize = keyof typeof ICON_SIZES;

/**
 * Helper function to get icon size class
 */
export function getIconSize(size: IconSize = 'md'): string {
  return ICON_SIZES[size];
}

/**
 * Context-based icon size recommendations
 */
export const ICON_CONTEXT = {
  // Buttons
  button: ICON_SIZES.sm,           // 16px - compact and aligned with text
  buttonLarge: ICON_SIZES.md,      // 20px - for larger buttons
  
  // Navigation
  sidebar: ICON_SIZES.md,          // 20px - clear and readable
  bottomNav: ICON_SIZES.md,        // 20px - touch-friendly
  breadcrumb: ICON_SIZES.sm,       // 16px - subtle navigation aid
  
  // Headers
  pageTitle: ICON_SIZES.lg,        // 24px - prominent page identifier
  cardTitle: ICON_SIZES.md,        // 20px - section headers
  sectionTitle: ICON_SIZES.md,     // 20px - subsection headers
  
  // Tables & Lists
  tableCell: ICON_SIZES.sm,        // 16px - compact data display
  listItem: ICON_SIZES.md,         // 20px - clear list indicators
  
  // Forms
  inputIcon: ICON_SIZES.md,        // 20px - clear input affordance
  formLabel: ICON_SIZES.sm,        // 16px - subtle label enhancement
  
  // Status & Badges
  badge: ICON_SIZES.sm,            // 16px - inline with badge text
  statusIndicator: ICON_SIZES.sm,  // 16px - compact status display
  
  // Empty States
  emptyState: ICON_SIZES.xl,       // 32px - prominent empty state
  emptyStateLarge: ICON_SIZES['2xl'], // 40px - major empty state
  
  // Dialogs & Modals
  dialogIcon: ICON_SIZES.lg,       // 24px - clear modal identifier
  alertIcon: ICON_SIZES.md,        // 20px - inline alert indicator
} as const;

/**
 * Example component showing all icon sizes
 * Useful for design system documentation
 */
export function IconSizeReference() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Icon Size Reference</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Standardized icon sizes for consistent visual hierarchy
        </p>
      </div>
      
      <div className="space-y-4">
        {Object.entries(ICON_SIZES).map(([size, className]) => (
          <div key={size} className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium">{size}</div>
            <div className="w-16 text-xs text-muted-foreground">
              {className.replace('w-', '').replace(' h-', '').split(' ')[0]}
            </div>
            <div className="flex items-center gap-2">
              <div className={`${className} bg-primary rounded flex items-center justify-center`}>
                <div className="w-1/2 h-1/2 bg-primary-foreground rounded-full" />
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                className="{className}"
              </code>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-base font-semibold mb-4">Context-Based Usage</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(ICON_CONTEXT).map(([context, className]) => (
            <div key={context} className="flex items-center gap-3 text-sm">
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {context}
              </code>
              <span className="text-muted-foreground">→</span>
              <span className="text-xs">{className}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
