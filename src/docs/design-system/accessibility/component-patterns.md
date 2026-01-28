# Accessible Component Patterns

This guide provides specific accessibility implementation patterns for common CMMS interface components.

## Form Components

### Text Input with Validation

```typescript
interface AccessibleInputProps {
  label: string;
  id?: string;
  required?: boolean;
  error?: string;
  help?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  id,
  required = false,
  error,
  help,
  type = 'text',
  ...props
}) => {
  const inputId = id || useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  
  const describedBy = [
    help && helpId,
    error && errorId
  ].filter(Boolean).join(' ');
  
  return (
    <div className="form-field">
      <label 
        htmlFor={inputId}
        className="form-label"
      >
        {label}
        {required && (
          <span className="required-indicator" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <input
        id={inputId}
        type={type}
        className={`form-input ${error ? 'form-input--error' : ''}`}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      
      {help && (
        <div id={helpId} className="form-help">
          {help}
        </div>
      )}
      
      {error && (
        <div 
          id={errorId} 
          className="form-error" 
          role="alert"
          aria-live="polite"
        >
          <Icon name="alert-circle" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
};
```

### Select Dropdown with Search

```typescript
const AccessibleSelect: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  searchable = false,
  placeholder = "Select an option",
  error,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const selectId = useId();
  const listboxId = `${selectId}-listbox`;
  const errorId = error ? `${selectId}-error` : undefined;
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(filteredOptions[focusedIndex]);
          setIsOpen(false);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <div className="select-container">
      <label htmlFor={selectId} className="form-label">
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      
      <div className="select-wrapper">
        <button
          id={selectId}
          type="button"
          className={`select-trigger ${error ? 'select-trigger--error' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${selectId}-label`}
          aria-describedby={errorId}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className="select-value">
            {value?.label || placeholder}
          </span>
          <Icon 
            name={isOpen ? 'chevron-up' : 'chevron-down'} 
            aria-hidden="true"
          />
        </button>
        
        {isOpen && (
          <div className="select-dropdown">
            {searchable && (
              <div className="select-search">
                <input
                  type="text"
                  className="select-search-input"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search options"
                />
              </div>
            )}
            
            <ul
              id={listboxId}
              role="listbox"
              className="select-options"
              aria-labelledby={selectId}
            >
              {filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  className={`select-option ${
                    index === focusedIndex ? 'select-option--focused' : ''
                  } ${
                    value?.value === option.value ? 'select-option--selected' : ''
                  }`}
                  aria-selected={value?.value === option.value}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </li>
              ))}
              
              {filteredOptions.length === 0 && (
                <li className="select-no-options" role="option" aria-disabled="true">
                  No options found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
```

### Checkbox Group

```typescript
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  legend,
  options,
  value = [],
  onChange,
  error,
  required = false
}) => {
  const groupId = useId();
  const errorId = error ? `${groupId}-error` : undefined;
  
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };
  
  return (
    <fieldset 
      className="checkbox-group"
      aria-describedby={errorId}
      aria-invalid={!!error}
    >
      <legend className="checkbox-group-legend">
        {legend}
        {required && <span aria-label="required"> *</span>}
      </legend>
      
      <div className="checkbox-options" role="group">
        {options.map((option) => (
          <label key={option.value} className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              value={option.value}
              checked={value.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              aria-describedby={option.description ? `${option.value}-desc` : undefined}
            />
            <span className="checkbox-indicator" aria-hidden="true" />
            <span className="checkbox-text">
              {option.label}
            </span>
            {option.description && (
              <span 
                id={`${option.value}-desc`}
                className="checkbox-description"
              >
                {option.description}
              </span>
            )}
          </label>
        ))}
      </div>
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </fieldset>
  );
};
```

## Navigation Components

### Accessible Sidebar Navigation

```typescript
const SidebarNavigation: React.FC<SidebarProps> = ({
  items,
  currentPath,
  collapsed = false,
  onToggle
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = index < items.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        // Focus the next item
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : items.length - 1;
        setFocusedIndex(prevIndex);
        // Focus the previous item
        break;
        
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        // Focus first item
        break;
        
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        // Focus last item
        break;
    }
  };
  
  return (
    <nav 
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-expanded={!collapsed}
        >
          <Icon name={collapsed ? 'menu' : 'x'} />
        </button>
        
        {!collapsed && (
          <h2 className="sidebar-title">
            Fleet CMMS
          </h2>
        )}
      </div>
      
      <ul className="sidebar-menu" role="menubar">
        {items.map((item, index) => (
          <li key={item.id} role="none">
            <Link
              to={item.path}
              className={`sidebar-link ${
                currentPath === item.path ? 'sidebar-link--active' : ''
              }`}
              role="menuitem"
              aria-current={currentPath === item.path ? 'page' : undefined}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              <Icon 
                name={item.icon} 
                className="sidebar-icon"
                aria-hidden="true"
              />
              
              {!collapsed && (
                <span className="sidebar-text">
                  {item.label}
                </span>
              )}
              
              {item.badge && !collapsed && (
                <span 
                  className="sidebar-badge"
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
            
            {item.submenu && !collapsed && (
              <ul className="sidebar-submenu" role="group">
                {item.submenu.map((subitem) => (
                  <li key={subitem.id} role="none">
                    <Link
                      to={subitem.path}
                      className={`sidebar-sublink ${
                        currentPath === subitem.path ? 'sidebar-sublink--active' : ''
                      }`}
                      role="menuitem"
                      aria-current={currentPath === subitem.path ? 'page' : undefined}
                    >
                      {subitem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### Breadcrumb Navigation

```typescript
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/'
}) => {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={item.id} className="breadcrumb-item">
            {index < items.length - 1 ? (
              <Link 
                to={item.path}
                className="breadcrumb-link"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className="breadcrumb-current"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
            
            {index < items.length - 1 && (
              <span 
                className="breadcrumb-separator"
                aria-hidden="true"
              >
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
```

## Data Display Components

### Accessible Data Table

```typescript
const AccessibleDataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  caption,
  sortable = true,
  selectable = false,
  onSort,
  onSelect
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    const direction = 
      sortConfig?.key === columnKey && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';
    
    const newSortConfig = { key: columnKey, direction };
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
    onSelect?.(Array.from(selectedRows));
  };
  
  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
    onSelect?.(Array.from(newSelection));
  };
  
  return (
    <div className="table-container" role="region" aria-labelledby="table-caption">
      <table className="data-table" role="table">
        {caption && (
          <caption id="table-caption" className="table-caption">
            {caption}
            {selectedRows.size > 0 && (
              <span className="selection-summary">
                {selectedRows.size} of {data.length} rows selected
              </span>
            )}
          </caption>
        )}
        
        <thead>
          <tr role="row">
            {selectable && (
              <th role="columnheader" className="select-column">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                  <span className="checkbox-indicator" aria-hidden="true" />
                </label>
              </th>
            )}
            
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                className={`table-header ${sortable ? 'sortable' : ''}`}
                aria-sort={
                  sortConfig?.key === column.key
                    ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                }
                tabIndex={sortable ? 0 : undefined}
                onClick={() => sortable && handleSort(column.key)}
                onKeyDown={(e) => {
                  if (sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(column.key);
                  }
                }}
              >
                <div className="header-content">
                  {column.label}
                  {sortable && (
                    <span className="sort-indicator" aria-hidden="true">
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id} 
              role="row"
              className={selectedRows.has(row.id) ? 'selected' : ''}
            >
              {selectable && (
                <td role="gridcell" className="select-column">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                    <span className="checkbox-indicator" aria-hidden="true" />
                  </label>
                </td>
              )}
              
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  role="gridcell"
                  className="table-cell"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
          
          {data.length === 0 && (
            <tr role="row">
              <td 
                role="gridcell" 
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="empty-state"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
```

### Status Badge Component

```typescript
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  icon,
  size = 'medium'
}) => {
  const statusConfig = {
    success: { color: 'green', ariaLabel: 'Success status' },
    warning: { color: 'yellow', ariaLabel: 'Warning status' },
    error: { color: 'red', ariaLabel: 'Error status' },
    info: { color: 'blue', ariaLabel: 'Information status' },
    pending: { color: 'gray', ariaLabel: 'Pending status' }
  };
  
  const config = statusConfig[status];
  
  return (
    <span
      className={`status-badge status-badge--${status} status-badge--${size}`}
      role="status"
      aria-label={`${config.ariaLabel}: ${label}`}
    >
      {icon && (
        <Icon 
          name={icon} 
          className="status-icon"
          aria-hidden="true"
        />
      )}
      <span className="status-text">
        {label}
      </span>
    </span>
  );
};
```

## Modal and Overlay Components

### Accessible Modal Dialog

```typescript
const AccessibleModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  
  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Find focusable elements within modal
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      setFocusableElements(Array.from(focusable || []));
      
      // Focus the first focusable element or the modal itself
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        modalRef.current?.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
      
      // Restore body scroll
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Keyboard event handling
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
        return;
      }
      
      if (e.key === 'Tab') {
        // Trap focus within modal
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusableElements, onClose, closeOnEscape]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`modal-content modal-content--${size}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="x" aria-hidden="true" />
          </button>
        </header>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### Toast Notification

```typescript
const ToastNotification: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const typeConfig = {
    success: { icon: 'check-circle', ariaLabel: 'Success notification' },
    error: { icon: 'alert-circle', ariaLabel: 'Error notification' },
    warning: { icon: 'alert-triangle', ariaLabel: 'Warning notification' },
    info: { icon: 'info', ariaLabel: 'Information notification' }
  };
  
  const config = typeConfig[type];
  
  return (
    <div
      className={`toast toast--${type} ${isVisible ? 'toast--visible' : 'toast--hidden'}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-label={config.ariaLabel}
    >
      <div className="toast-content">
        <Icon 
          name={config.icon} 
          className="toast-icon"
          aria-hidden="true"
        />
        
        <div className="toast-message">
          {message}
        </div>
        
        {action && (
          <button
            className="toast-action"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
        
        <button
          className="toast-close"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          aria-label="Close notification"
        >
          <Icon name="x" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
```

## Loading and Feedback Components

### Loading Spinner with Announcements

```typescript
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  label = 'Loading',
  overlay = false,
  progress
}) => {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    // Announce loading state changes
    if (progress !== undefined) {
      setAnnouncement(`Loading ${Math.round(progress)}% complete`);
    } else {
      setAnnouncement(`${label}...`);
    }
  }, [progress, label]);
  
  const spinner = (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div 
        className="spinner-circle"
        role="progressbar"
        aria-label={label}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      
      {progress !== undefined && (
        <div className="progress-text" aria-hidden="true">
          {Math.round(progress)}%
        </div>
      )}
      
      {/* Screen reader announcement */}
      <div 
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
    </div>
  );
  
  if (overlay) {
    return (
      <div className="loading-overlay" aria-hidden="true">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};
```

### Skeleton Loading Pattern

```typescript
const SkeletonLoader: React.FC<SkeletonProps> = ({
  type = 'text',
  lines = 1,
  width,
  height,
  className
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="skeleton-line"
            style={{
              width: index === lines - 1 ? '60%' : '100%'
            }}
            aria-hidden="true"
          />
        ));
        
      case 'card':
        return (
          <div className="skeleton-card" aria-hidden="true">
            <div className="skeleton-header" />
            <div className="skeleton-content">
              <div className="skeleton-line" />
              <div className="skeleton-line" style={{ width: '80%' }} />
              <div className="skeleton-line" style={{ width: '60%' }} />
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div className="skeleton-table" aria-hidden="true">
            <div className="skeleton-table-header">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="skeleton-table-cell" />
              ))}
            </div>
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <div key={rowIndex} className="skeleton-table-row">
                {Array.from({ length: 4 }, (_, cellIndex) => (
                  <div key={cellIndex} className="skeleton-table-cell" />
                ))}
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <div
            className="skeleton-block"
            style={{ width, height }}
            aria-hidden="true"
          />
        );
    }
  };
  
  return (
    <div className={`skeleton-container ${className || ''}`}>
      <div 
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        Loading content...
      </div>
      {renderSkeleton()}
    </div>
  );
};
```

These patterns provide comprehensive accessibility implementations for common CMMS interface components, ensuring WCAG 2.1 AA compliance while maintaining usability and performance.