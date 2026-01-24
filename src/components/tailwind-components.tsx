import React from 'react';

// Stack component - vertical flex container with gap
interface StackProps {
  children: React.ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  style?: React.CSSProperties;
}

const gapMap: Record<string, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignMap: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export const Stack: React.FC<StackProps> = ({ children, gap = 'md', className = '', align, style }) => {
  const gapClass = gapMap[gap] || 'gap-4';
  const alignClass = align ? alignMap[align] || '' : '';
  return <div className={`flex flex-col ${gapClass} ${alignClass} ${className}`} style={style}>{children}</div>;
};

// Grid component with responsive columns
interface GridProps {
  children: React.ReactNode;
  gutter?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

interface GridColProps {
  children: React.ReactNode;
  span?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number } | number;
  className?: string;
}

const gutterMap: Record<string, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

// Full class names for Tailwind to detect
const colSpanMap: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
};
const smColSpanMap: Record<number, string> = {
  1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4',
  5: 'sm:col-span-5', 6: 'sm:col-span-6', 7: 'sm:col-span-7', 8: 'sm:col-span-8',
  9: 'sm:col-span-9', 10: 'sm:col-span-10', 11: 'sm:col-span-11', 12: 'sm:col-span-12',
};
const mdColSpanMap: Record<number, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
  5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
  9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
};
const lgColSpanMap: Record<number, string> = {
  1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
  5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
  9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12',
};

export const Grid: React.FC<GridProps> & { Col: React.FC<GridColProps> } = ({ children, gutter = 'md', className = '' }) => {
  const gutterClass = gutterMap[gutter] || 'gap-4';
  return <div className={`grid grid-cols-12 ${gutterClass} ${className}`}>{children}</div>;
};

const GridCol: React.FC<GridColProps> = ({ children, span = 12, className = '' }) => {
  const classes: string[] = [];
  if (typeof span === 'number') {
    classes.push(colSpanMap[span] || 'col-span-12');
  } else {
    if (span.base) classes.push(colSpanMap[span.base] || 'col-span-12');
    if (span.sm) classes.push(smColSpanMap[span.sm] || '');
    if (span.md) classes.push(mdColSpanMap[span.md] || '');
    if (span.lg) classes.push(lgColSpanMap[span.lg] || '');
  }
  return <div className={`${classes.join(' ')} ${className}`}>{children}</div>;
};

Grid.Col = GridCol;

// Box component - basic div with style support
interface BoxProps {
  children: React.ReactNode;
  className?: string;
  px?: string;
  py?: string;
  pb?: string;
  pt?: string;
  style?: ((theme: any) => React.CSSProperties) | React.CSSProperties;
}

export const Box: React.FC<BoxProps> = ({ children, className = '', px, py, pb, pt, style }) => {
  let paddingClasses = '';
  if (px === 'xs') paddingClasses += 'px-1 ';
  else if (px === 'sm') paddingClasses += 'px-2 ';
  else if (px === 'md') paddingClasses += 'px-4 ';
  if (py === 'xs') paddingClasses += 'py-1 ';
  else if (py === 'sm') paddingClasses += 'py-2 ';
  else if (py === 'md') paddingClasses += 'py-4 ';
  if (pb === 'xs') paddingClasses += 'pb-1 ';
  else if (pb === 'sm') paddingClasses += 'pb-2 ';
  else if (pb === 'md') paddingClasses += 'pb-4 ';
  if (pt === 'xs') paddingClasses += 'pt-1 ';
  else if (pt === 'sm') paddingClasses += 'pt-2 ';
  else if (pt === 'md') paddingClasses += 'pt-4 ';

  const computedStyle = typeof style === 'function' ? style({
    colors: {
      gray: { 0: '#f9fafb', 1: '#f3f4f6', 2: '#e5e7eb' },
      blue: { 0: '#eff6ff', 6: '#2563eb', 7: '#1d4ed8' },
    },
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem' },
  }) : style;

  return <div className={`${paddingClasses}${className}`} style={computedStyle}>{children}</div>;
};

// Button component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'filled' | 'outline' | 'subtle' | 'light';
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
}

// Size map using shadcn/ui defaults
const sizeMap = {
  xs: 'h-7 px-2 py-1 text-xs',
  sm: 'h-8 px-3 py-1.5 text-sm',
  md: 'h-9 px-4 py-2 text-sm',
  lg: 'h-11 px-5 py-2.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  children, onClick, variant = 'filled', color = 'primary', size = 'md',
  leftSection, rightSection, disabled = false, className = '', fullWidth = false, loading = false
}) => {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;
  let variantClass = '';
  if (variant === 'filled') variantClass = 'bg-primary-600 text-white hover:bg-primary-700';
  else if (variant === 'outline') variantClass = 'border border-gray-300 text-gray-700 hover:bg-gray-50';
  else if (variant === 'subtle') variantClass = 'text-gray-600 hover:bg-gray-100';
  else if (variant === 'light') variantClass = 'bg-primary-50 text-primary-700 hover:bg-primary-100';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ${sizeClass} ${variantClass} ${widthClass} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && leftSection}
      {children}
      {rightSection}
    </button>
  );
};

// Tabs component
interface TabsProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  variant?: string;
  className?: string;
  styles?: any;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({ activeTab: '1', setActiveTab: () => { } });

export const Tabs: React.FC<TabsProps> & {
  List: React.FC<{ children: React.ReactNode }>;
  Tab: React.FC<{ value: string; children: React.ReactNode; leftSection?: React.ReactNode }>;
  Panel: React.FC<{ value: string; children: React.ReactNode; pt?: string }>;
} = ({ children, value, onChange, defaultValue = '1', className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) setActiveTab(value);
  }, [value]);

  const handleSetActiveTab = (newValue: string) => {
    setActiveTab(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex border-b border-gray-200 overflow-x-auto">{children}</div>
);

const TabsTab: React.FC<{ value: string; children: React.ReactNode; leftSection?: React.ReactNode }> = ({ value, children, leftSection }) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive ? 'border-primary-600 text-primary-700 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
      {leftSection}
      {children}
    </button>
  );
};

const TabsPanel: React.FC<{ value: string; children: React.ReactNode; pt?: string }> = ({ value, children, pt }) => {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== value) return null;
  const paddingClass = pt === 'xs' ? 'pt-1' : pt === 'sm' ? 'pt-2' : pt === 'md' ? 'pt-4' : '';
  return <div className={paddingClass}>{children}</div>;
};

Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;

// Alert component
interface AlertProps {
  children: React.ReactNode;
  color?: 'blue' | 'yellow' | 'red' | 'green';
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  withCloseButton?: boolean;
  onClose?: () => void;
}

const alertColorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  yellow: 'bg-amber-50 border-amber-200 text-amber-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
};

export const Alert: React.FC<AlertProps> = ({ children, color = 'blue', title, icon, className = '', style, withCloseButton, onClose }) => (
  <div className={`border rounded-lg p-4 ${alertColorMap[color]} ${className}`} style={style}>
    <div className="flex gap-3">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {withCloseButton && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

// Skeleton component
interface SkeletonProps {
  height?: number | string;
  width?: string;
  radius?: string;
  mt?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ height = 20, width = '100%', radius = 'md', mt, className = '' }) => {
  const radiusClass = radius === 'xl' ? 'rounded-xl' : radius === 'lg' ? 'rounded-lg' : 'rounded-md';
  const marginTop = mt ? `mt-${mt}` : '';
  return (
    <div
      className={`bg-gray-200 animate-pulse ${radiusClass} ${marginTop} ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width }}
    />
  );
};

// Text component
interface TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  c?: 'dimmed' | string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  fw?: number;
  className?: string;
  ta?: 'left' | 'center' | 'right';
  mt?: 'xs' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

const textSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const textWeightMap = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const marginTopMap: Record<string, string> = {
  xs: 'mt-1',
  sm: 'mt-2',
  md: 'mt-4',
  lg: 'mt-6',
};

export const Text: React.FC<TextProps> = ({ children, size = 'md', color, c, weight = 'normal', fw, className = '', ta, mt, style }) => {
  const sizeClass = textSizeMap[size] || 'text-base';
  let weightClass = textWeightMap[weight] || 'font-normal';
  if (fw) {
    if (fw >= 700) weightClass = 'font-bold';
    else if (fw >= 600) weightClass = 'font-semibold';
    else if (fw >= 500) weightClass = 'font-medium';
    else weightClass = 'font-normal';
  }
  const alignClass = ta === 'center' ? 'text-center' : ta === 'right' ? 'text-right' : '';
  const marginClass = mt ? marginTopMap[mt] || '' : '';

  let colorClass = 'text-gray-700';
  if (c === 'dimmed') colorClass = 'text-gray-500';
  else if (color) colorClass = `text-${color}`;

  return <p className={`${sizeClass} ${weightClass} ${colorClass} ${alignClass} ${marginClass} ${className}`} style={style}>{children}</p>;
};

// Title component
interface TitleProps {
  children: React.ReactNode;
  order?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  ta?: 'left' | 'center' | 'right';
}

export const Title: React.FC<TitleProps> = ({ children, order = 1, className = '', ta }) => {
  const sizeClasses = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-bold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-semibold',
    5: 'text-base font-semibold',
    6: 'text-sm font-semibold',
  };
  const alignClass = ta === 'center' ? 'text-center' : ta === 'right' ? 'text-right' : '';
  const Tag = `h${order}` as keyof JSX.IntrinsicElements;
  return <Tag className={`text-gray-900 ${sizeClasses[order]} ${alignClass} ${className}`}>{children}</Tag>;
};

// ActionIcon component
interface ActionIconProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'subtle' | 'light';
  color?: string;
  className?: string;
}

const actionIconSizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export const ActionIcon: React.FC<ActionIconProps> = ({
  children, onClick, size = 'md', variant = 'subtle', color = 'gray', className = ''
}) => {
  const sizeClass = actionIconSizeMap[size] || actionIconSizeMap.md;
  let variantClass = '';
  if (variant === 'filled') variantClass = 'bg-gray-600 text-white hover:bg-gray-700';
  else if (variant === 'outline') variantClass = 'border border-gray-300 text-gray-700 hover:bg-gray-50';
  else if (variant === 'subtle') variantClass = 'text-gray-600 hover:bg-gray-100';
  else if (variant === 'light') variantClass = 'bg-gray-50 text-gray-700 hover:bg-gray-100';

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg transition-colors ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};
// ThemeIcon component
interface ThemeIconProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  variant?: 'filled' | 'outline' | 'light';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const themeIconSizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const themeIconRadiusMap = {
  xs: 'rounded',
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-xl',
};

export const ThemeIcon: React.FC<ThemeIconProps> = ({
  children, size = 'md', color = 'primary', variant = 'filled', radius = 'md', className = ''
}) => {
  const sizeClass = themeIconSizeMap[size] || themeIconSizeMap.md;
  const radiusClass = themeIconRadiusMap[radius] || 'rounded-lg';

  let variantClass = '';
  if (color === 'blue') {
    if (variant === 'filled') variantClass = 'bg-blue-600 text-white';
    else if (variant === 'outline') variantClass = 'border border-blue-600 text-blue-600';
    else if (variant === 'light') variantClass = 'bg-blue-50 text-blue-700';
  } else {
    if (variant === 'filled') variantClass = 'bg-primary-600 text-white';
    else if (variant === 'outline') variantClass = 'border border-primary-600 text-primary-600';
    else if (variant === 'light') variantClass = 'bg-primary-50 text-primary-700';
  }

  return (
    <div className={`inline-flex items-center justify-center ${radiusClass} ${sizeClass} ${variantClass} ${className}`}>
      {children}
    </div>
  );
};

// SimpleGrid component
interface SimpleGridProps {
  children: React.ReactNode;
  cols?: number | { base?: number; sm?: number; md?: number; lg?: number };
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const SimpleGrid: React.FC<SimpleGridProps> = ({ children, cols = 1, spacing = 'md', className = '' }) => {
  const spacingClass = gutterMap[spacing] || 'gap-4';
  let colsClass = 'grid-cols-1';

  if (typeof cols === 'number') {
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
      5: 'grid-cols-5', 6: 'grid-cols-6',
    };
    colsClass = colsMap[cols] || 'grid-cols-1';
  } else {
    const classes: string[] = [];
    if (cols.base) classes.push(`grid-cols-${cols.base}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    colsClass = classes.join(' ') || 'grid-cols-1';
  }

  return <div className={`grid ${colsClass} ${spacingClass} ${className}`}>{children}</div>;
};

// Group component - horizontal flex container
interface GroupProps {
  children: React.ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'flex-start' | 'flex-end' | 'space-between';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  'flex-start': 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'flex-end': 'justify-end',
  between: 'justify-between',
  'space-between': 'justify-between',
  around: 'justify-around',
};

export const Group: React.FC<GroupProps> = ({ children, gap = 'md', justify, align, className = '' }) => {
  const gapClass = gapMap[gap] || 'gap-4';
  const justifyClass = justify ? justifyMap[justify] || '' : '';
  const alignClass = align ? alignMap[align] || '' : '';
  return <div className={`flex ${gapClass} ${justifyClass} ${alignClass} ${className}`}>{children}</div>;
};

// Loader component
interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const loaderSizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClass = loaderSizeMap[size] || loaderSizeMap.md;
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClass} ${className}`} />
  );
};

// Menu component
interface MenuProps {
  children: React.ReactNode;
  className?: string;
}

interface MenuTargetProps {
  children: React.ReactNode;
}

interface MenuDropdownProps {
  children: React.ReactNode;
}

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  leftSection?: React.ReactNode;
  className?: string;
}

export const Menu: React.FC<MenuProps> & {
  Target: React.FC<MenuTargetProps>;
  Dropdown: React.FC<MenuDropdownProps>;
  Item: React.FC<MenuItemProps>;
} = ({ children, className = '' }) => {
  return <div className={`relative inline-block ${className}`}>{children}</div>;
};

const MenuTarget: React.FC<MenuTargetProps> = ({ children }) => children as React.ReactElement;
const MenuDropdown: React.FC<MenuDropdownProps> = ({ children }) => (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
    {children}
  </div>
);
const MenuItem: React.FC<MenuItemProps> = ({ children, onClick, leftSection, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
  >
    {leftSection}
    {children}
  </button>
);

Menu.Target = MenuTarget;
Menu.Dropdown = MenuDropdown;
Menu.Item = MenuItem;

// Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withBorder?: boolean;
  shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const cardPaddingMap = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const cardShadowMap = {
  xs: 'shadow-sm',
  sm: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const cardRadiusMap = {
  xs: 'rounded',
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
};

export const Card: React.FC<CardProps> = ({ children, className = '', padding, p, withBorder = true, shadow, radius = 'md' }) => {
  const paddingClass = cardPaddingMap[p || padding || 'md'] || 'p-4';
  const borderClass = withBorder ? 'border border-gray-200' : '';
  const shadowClass = shadow ? cardShadowMap[shadow] || '' : '';
  const radiusClass = cardRadiusMap[radius] || 'rounded-lg';
  return <div className={`bg-white ${radiusClass} ${borderClass} ${shadowClass} ${paddingClass} ${className}`}>{children}</div>;
};

// Badge component
interface BadgeProps {
  children: React.ReactNode;
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
  variant?: 'filled' | 'outline' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeColorMap = {
  gray: { filled: 'bg-gray-600 text-white', outline: 'border-gray-600 text-gray-600', light: 'bg-gray-100 text-gray-800' },
  red: { filled: 'bg-red-600 text-white', outline: 'border-red-600 text-red-600', light: 'bg-red-100 text-red-800' },
  yellow: { filled: 'bg-yellow-600 text-white', outline: 'border-yellow-600 text-yellow-600', light: 'bg-yellow-100 text-yellow-800' },
  green: { filled: 'bg-green-600 text-white', outline: 'border-green-600 text-green-600', light: 'bg-green-100 text-green-800' },
  blue: { filled: 'bg-blue-600 text-white', outline: 'border-blue-600 text-blue-600', light: 'bg-blue-100 text-blue-800' },
  indigo: { filled: 'bg-indigo-600 text-white', outline: 'border-indigo-600 text-indigo-600', light: 'bg-indigo-100 text-indigo-800' },
  purple: { filled: 'bg-purple-600 text-white', outline: 'border-purple-600 text-purple-600', light: 'bg-purple-100 text-purple-800' },
  pink: { filled: 'bg-pink-600 text-white', outline: 'border-pink-600 text-pink-600', light: 'bg-pink-100 text-pink-800' },
};

const badgeSizeMap = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', variant = 'filled', size = 'sm', className = '' }) => {
  const sizeClass = badgeSizeMap[size] || badgeSizeMap.sm;
  const colorClass = badgeColorMap[color]?.[variant] || badgeColorMap.gray.filled;
  const borderClass = variant === 'outline' ? 'border' : '';

  return (
    <span className={`inline-flex items-center font-medium rounded ${sizeClass} ${colorClass} ${borderClass} ${className}`}>
      {children}
    </span>
  );
};

// Progress component
interface ProgressProps {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const progressSizeMap = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export const Progress: React.FC<ProgressProps> = ({ value, size = 'md', color = 'primary', className = '' }) => {
  const sizeClass = progressSizeMap[size] || progressSizeMap.md;
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClass} ${className}`}>
      <div
        className="bg-primary-600 h-full transition-all duration-300 ease-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

// Select component
interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  data: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, data, placeholder, className = '' }) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {data.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
};

// Container component
interface ContainerProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const containerSizeMap = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export const Container: React.FC<ContainerProps> = ({ children, size = 'lg', className = '' }) => {
  const sizeClass = containerSizeMap[size] || containerSizeMap.lg;
  return <div className={`mx-auto px-4 ${sizeClass} ${className}`}>{children}</div>;
};

// Divider component
interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({ className = '', orientation = 'horizontal' }) => {
  const orientationClass = orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full';
  return <div className={`bg-gray-200 ${orientationClass} ${className}`} />;
};

// Tooltip component (basic implementation)
interface TooltipProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, label, className = '' }) => {
  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};


// Collapse component
interface CollapseProps {
  children: React.ReactNode;
  in: boolean;
  className?: string;
}

export const Collapse: React.FC<CollapseProps> = ({ children, in: isOpen, className = '' }) => {
  if (!isOpen) return null;
  return <div className={`animate-in fade-in duration-200 ${className}`}>{children}</div>;
};


// Modal component
interface ModalProps {
  children: React.ReactNode;
  opened: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const modalSizeMap = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal: React.FC<ModalProps> = ({ children, opened, onClose, title, size = 'md', className = '' }) => {
  if (!opened) return null;

  const sizeClass = modalSizeMap[size] || modalSizeMap.md;

  return (
    <div className="fixed inset-0 z-[1050] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm backdrop-saturate-150 transition-opacity" onClick={onClose} />

        {/* Modal content */}
        <div
          className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClass} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkbox component
interface CheckboxProps {
  children?: React.ReactNode;
  label?: string;
  value?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

interface CheckboxGroupProps {
  children: React.ReactNode;
  value?: string[];
  onChange?: (values: string[]) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> & {
  Group: React.FC<CheckboxGroupProps>;
} = ({ label, value, checked, onChange, disabled, className = '' }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
};

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ children, value = [], onChange, className = '' }) => {
  const handleChange = (checkboxValue: string, isChecked: boolean) => {
    if (!onChange) return;

    if (isChecked) {
      onChange([...value, checkboxValue]);
    } else {
      onChange(value.filter(v => v !== checkboxValue));
    }
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Checkbox) {
      const childValue = child.props.value;
      return React.cloneElement(child as React.ReactElement<CheckboxProps>, {
        checked: value.includes(childValue),
        onChange: (checked: boolean) => handleChange(childValue, checked),
      });
    }
    return child;
  });

  return <div className={`space-y-2 ${className}`}>{childrenWithProps}</div>;
};

Checkbox.Group = CheckboxGroup;

// MultiSelect component
interface MultiSelectProps {
  data: Array<{ value: string; label: string }>;
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  data,
  value = [],
  onChange,
  placeholder = 'Select items...',
  label,
  searchable = true,
  clearable = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredData = searchable
    ? data.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : data;

  const handleToggle = (itemValue: string) => {
    if (!onChange) return;

    if (value.includes(itemValue)) {
      onChange(value.filter(v => v !== itemValue));
    } else {
      onChange([...value, itemValue]);
    }
  };

  const handleClear = () => {
    onChange?.([]);
  };

  const selectedLabels = data
    .filter(item => value.includes(item.value))
    .map(item => item.label)
    .join(', ');

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <span className={value.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
            {value.length === 0 ? placeholder : selectedLabels}
          </span>
        </button>

        {clearable && value.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="py-1">
              {filteredData.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No items found</div>
              ) : (
                filteredData.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(item.value)}
                      onChange={() => handleToggle(item.value)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Paper component - similar to Card but with different styling options
interface PaperProps {
  children: React.ReactNode;
  className?: string;
  p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withBorder?: boolean;
}

export const Paper: React.FC<PaperProps> = ({
  children,
  className = '',
  p = 'md',
  shadow,
  radius = 'md',
  withBorder = false
}) => {
  const paddingClass = cardPaddingMap[p] || 'p-4';
  const shadowClass = shadow ? cardShadowMap[shadow] || '' : '';
  const radiusClass = cardRadiusMap[radius] || 'rounded-lg';
  const borderClass = withBorder ? 'border border-gray-200' : '';

  return (
    <div className={`bg-white ${radiusClass} ${shadowClass} ${borderClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};