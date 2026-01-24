import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Home01Icon,
    ClipboardIcon,
    PackageIcon,
    UserMultipleIcon,
    Settings01Icon,
    ChartHistogramIcon,
    PackageIcon as InventoryIcon,
    Wrench01Icon,
    Calendar01Icon,
    ArrowLeft01Icon,
    ArrowDown01Icon,
    MoreHorizontalIcon,
    ArrowRight01Icon,
    Search01Icon,
    Cancel01Icon
} from '@hugeicons/core-free-icons';

/**
 * Represents a single breadcrumb item in the navigation hierarchy
 */
interface BreadcrumbItem {
    /** Display label for the breadcrumb */
    label: string;
    /** Navigation path for the breadcrumb */
    path: string;
    /** Optional icon object from Hugeicons */
    icon?: any;
    /** Whether this item is clickable (default: true for non-current items) */
    isClickable?: boolean;
    /** Additional metadata for the breadcrumb */
    metadata?: Record<string, any>;
}

/**
 * Represents an item in the navigation history
 */
interface NavigationHistory {
    /** The path that was visited */
    path: string;
    /** Display label for the visited page */
    label: string;
    /** Timestamp when the page was visited */
    timestamp: number;
    /** Optional icon for the history item */
    icon?: any;
}

/**
 * Props for the ModernBreadcrumbs component
 */
interface ModernBreadcrumbsProps {
    /** Action buttons to display on the right side */
    actions?: React.ReactNode;
    /** Custom back button component (overrides default) */
    backButton?: React.ReactNode;
    /** Callback function when search is performed */
    onSearch?: (value: string) => void;
    /** Custom search bar component (overrides default) */
    searchBar?: React.ReactNode;
    /** Custom breadcrumb items (overrides auto-generated ones) */
    customBreadcrumbs?: BreadcrumbItem[];
    /** Whether to show navigation history dropdown */
    showNavigationHistory?: boolean;
    /** Maximum number of items to keep in navigation history */
    maxHistoryItems?: number;
    /** Placeholder text for search input */
    searchPlaceholder?: string;
    /** Whether to enable keyboard navigation shortcuts */
    enableKeyboardNavigation?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** ARIA label for the breadcrumb navigation */
    'aria-label'?: string;
    /** Whether to show the search button */
    showSearchButton?: boolean;
    /** Additional search filter components */
    searchFilters?: React.ReactNode;
    /** Whether to show icons in breadcrumbs */
    showIcons?: boolean;
    /** Maximum number of breadcrumbs to show before truncating */
    maxBreadcrumbs?: number;
    /** Callback when breadcrumb is clicked */
    onBreadcrumbClick?: (item: BreadcrumbItem) => void;
    /** Whether the component is in a compact mode */
    compact?: boolean;
    /** Custom separator between breadcrumb items */
    separator?: React.ReactNode;
}

/**
 * Standard Shadcn-compatible Breadcrumbs
 */
const ModernBreadcrumbs: React.FC<ModernBreadcrumbsProps> = ({
    actions,
    backButton,
    onSearch,
    searchBar,
    customBreadcrumbs,
    showNavigationHistory = true,
    maxHistoryItems = 10,
    searchPlaceholder = "Search...",
    enableKeyboardNavigation = true,
    className = '',
    'aria-label': ariaLabel = 'Breadcrumb navigation',
    showSearchButton = true,
    searchFilters,
    showIcons = true,
    maxBreadcrumbs = 5,
    onBreadcrumbClick,
    compact = false,
    separator
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const breadcrumbRef = useRef<HTMLElement>(null);

    // Generate breadcrumb items from current path or use custom ones
    const generateBreadcrumbItems = useCallback((): BreadcrumbItem[] => {
        if (customBreadcrumbs) {
            return customBreadcrumbs;
        }

        const pathnames = location.pathname.split('/').filter((x) => x);

        // Enhanced path-to-label mapping for better UX
        const pathLabelMap: Record<string, { label: string; icon?: any }> = {
            '': { label: 'Home', icon: Home01Icon },
            'dashboard': { label: 'Dashboard', icon: Home01Icon },
            'work-orders': { label: 'Work Orders', icon: ClipboardIcon },
            'assets': { label: 'Assets', icon: PackageIcon },
            'technicians': { label: 'Technicians', icon: UserMultipleIcon },
            'settings': { label: 'Settings', icon: Settings01Icon },
            'reports': { label: 'Reports', icon: ChartHistogramIcon },
            'inventory': { label: 'Inventory', icon: InventoryIcon },
            'maintenance': { label: 'Maintenance', icon: Wrench01Icon },
            'calendar': { label: 'Calendar', icon: Calendar01Icon },
        };

        const items: BreadcrumbItem[] = [
            {
                label: 'Home',
                path: '/',
                icon: showIcons ? Home01Icon : undefined,
                isClickable: location.pathname !== '/'
            }
        ];

        pathnames.forEach((value, index) => {
            const path = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const pathInfo = pathLabelMap[value] || {
                label: value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')
            };

            items.push({
                label: pathInfo.label,
                path,
                icon: showIcons && pathInfo.icon ? pathInfo.icon : undefined,
                isClickable: !isLast,
            });
        });

        return items;
    }, [location.pathname, customBreadcrumbs, showIcons]);

    const breadcrumbItems = generateBreadcrumbItems();

    // Extract pathnames for back button logic
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Update navigation history when location changes
    useEffect(() => {
        if (showNavigationHistory && location.pathname !== '/') {
            const currentPage = breadcrumbItems[breadcrumbItems.length - 1];
            if (currentPage) {
                setNavigationHistory(prev => {
                    const filtered = prev.filter(item => item.path !== location.pathname);
                    const newHistory = [
                        {
                            path: location.pathname,
                            label: currentPage.label,
                            timestamp: Date.now()
                        },
                        ...filtered
                    ].slice(0, maxHistoryItems);
                    return newHistory;
                });
            }
        }
    }, [location.pathname, showNavigationHistory, maxHistoryItems, breadcrumbItems]);

    // Handle search functionality
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch && searchValue.trim()) {
            onSearch(searchValue.trim());
            setSearchValue('');
            setShowSearch(false);
        }
    };

    const handleSearchToggle = () => {
        setShowSearch(!showSearch);
        if (!showSearch) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    };

    // Keyboard navigation - disabled to prevent interference with app navigation
    useEffect(() => {
        if (!enableKeyboardNavigation) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle Escape to close dropdowns
            if (e.key === 'Escape') {
                setShowSearch(false);
                setShowHistory(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [enableKeyboardNavigation]);

    // Enhanced responsive breadcrumb truncation
    const getVisibleBreadcrumbs = useCallback((): BreadcrumbItem[] => {
        if (breadcrumbItems.length <= 2) return breadcrumbItems;

        // Respect maxBreadcrumbs prop
        if (breadcrumbItems.length <= maxBreadcrumbs) return breadcrumbItems;

        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 640;
        const isTablet = screenWidth >= 640 && screenWidth < 1024;

        // Always show first (home) and last (current) items
        const first = breadcrumbItems[0];
        const last = breadcrumbItems[breadcrumbItems.length - 1];

        if (isMobile && breadcrumbItems.length > 3) {
            return [
                first,
                {
                    label: '...',
                    path: '',
                    icon: showIcons ? MoreHorizontalIcon : undefined,
                    isClickable: false
                },
                last
            ];
        } else if (isTablet && breadcrumbItems.length > 4) {
            const middleIndex = Math.floor(breadcrumbItems.length / 2);
            return [
                first,
                {
                    label: '...',
                    path: '',
                    icon: showIcons ? MoreHorizontalIcon : undefined,
                    isClickable: false
                },
                breadcrumbItems[middleIndex],
                last
            ];
        } else if (breadcrumbItems.length > maxBreadcrumbs) {
            const itemsToShow = maxBreadcrumbs - 2;
            const startIndex = breadcrumbItems.length - itemsToShow;

            return [
                first,
                {
                    label: '...',
                    path: '',
                    icon: showIcons ? MoreHorizontalIcon : undefined,
                    isClickable: false
                },
                ...breadcrumbItems.slice(startIndex)
            ];
        }

        return breadcrumbItems;
    }, [breadcrumbItems, maxBreadcrumbs, showIcons]);

    const [visibleBreadcrumbs, setVisibleBreadcrumbs] = useState<BreadcrumbItem[]>(getVisibleBreadcrumbs());

    // Update visible breadcrumbs on window resize
    useEffect(() => {
        const handleResize = () => {
            setVisibleBreadcrumbs(getVisibleBreadcrumbs());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [getVisibleBreadcrumbs]);

    // Update visible breadcrumbs when breadcrumb items change
    useEffect(() => {
        setVisibleBreadcrumbs(getVisibleBreadcrumbs());
    }, [getVisibleBreadcrumbs]);

    return (
        <header
            className={`w-full sticky top-0 ${compact ? 'px-3 py-2' : 'px-4 py-2.5'} ${className}`}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                zIndex: 40,
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid #e2e8f0`
            }}
            role="banner"
        >
            <div className="flex items-center justify-between gap-4">
                {/* Left section: Back button and breadcrumbs */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Back button with history dropdown */}
                    <div className="relative">
                        {backButton || (
                            <div className="flex items-center">
                                {pathnames.length > 0 && (
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        aria-label="Go back"
                                        title="Go back"
                                    >
                                        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                                    </button>
                                )}

                                {showNavigationHistory && navigationHistory.length > 0 && (
                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="p-1 ml-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        aria-label="Navigation history"
                                        title="Navigation history"
                                    >
                                        <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Navigation history dropdown */}
                        {showHistory && navigationHistory.length > 0 && (
                            <div
                                className="absolute top-full left-0 mt-1 py-2 bg-white rounded-md border shadow-lg min-w-48 z-50"
                                style={{
                                    borderColor: '#e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    borderRadius: '0.375rem',
                                    zIndex: 50
                                }}
                            >
                                <div
                                    className="px-3 py-1 text-xs font-medium border-b mb-1"
                                    style={{
                                        color: '#6b7280',
                                        borderColor: '#e2e8f0'
                                    }}
                                >
                                    Recent Pages
                                </div>
                                {navigationHistory.map((item, index) => (
                                    <button
                                        key={`${item.path}-${index}`}
                                        onClick={() => {
                                            navigate(item.path);
                                            setShowHistory(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset"
                                        style={{
                                            color: '#374151',
                                            transition: 'color 0.2s, background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div className="truncate">{item.label}</div>
                                        <div
                                            className="text-xs truncate"
                                            style={{ color: '#9ca3af' }}
                                        >
                                            {item.path}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Breadcrumb navigation */}
                    <nav
                        ref={breadcrumbRef}
                        className="flex items-center text-sm min-w-0"
                        aria-label={ariaLabel}
                        role="navigation"
                    >
                        <ol className="flex items-center space-x-1">
                            {/* Desktop: Show all breadcrumbs */}
                            <div className="hidden md:flex items-center space-x-1">
                                {breadcrumbItems.map((item, index) => {
                                    const isLast = index === breadcrumbItems.length - 1;
                                    const isEllipsis = item.label === '...';

                                    return (
                                        <li key={item.path || index} className="flex items-center">
                                            {index > 0 && (
                                                <span
                                                    className="mx-2 flex items-center"
                                                    style={{ color: '#9ca3af' }}
                                                    aria-hidden="true"
                                                >
                                                    {separator || <HugeiconsIcon icon={ArrowRight01Icon} size={16} />}
                                                </span>
                                            )}

                                            {isEllipsis ? (
                                                <button
                                                    type="button"
                                                    className="px-1 py-1 rounded transition-colors focus:outline-none focus:ring-2"
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '0.25rem',
                                                        transition: 'color 0.2s, background-color 0.2s'
                                                    }}
                                                    aria-label="Show hidden breadcrumb items"
                                                    title="Show hidden breadcrumb items"
                                                >
                                                    {item.icon && <HugeiconsIcon icon={item.icon} size={16} />}
                                                    {!item.icon && item.label}
                                                </button>
                                            ) : isLast ? (
                                                <span
                                                    className="font-medium flex items-center gap-1"
                                                    style={{ color: '#111827' }}
                                                    aria-current="page"
                                                    role="text"
                                                >
                                                    {item.icon && <HugeiconsIcon icon={item.icon} size={16} aria-hidden="true" />}
                                                    <span>{item.label}</span>
                                                </span>
                                            ) : (
                                                <Link
                                                    to={item.path}
                                                    className="hover:underline flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-1"
                                                    style={{
                                                        color: '#374151',
                                                        borderRadius: '0.25rem',
                                                        transition: 'color 0.2s, background-color 0.2s'
                                                    }}
                                                    onClick={(e) => {
                                                        if (onBreadcrumbClick) {
                                                            e.preventDefault();
                                                            onBreadcrumbClick(item);
                                                        }
                                                    }}
                                                    aria-label={`Navigate to ${item.label}`}
                                                >
                                                    {item.icon && <HugeiconsIcon icon={item.icon} size={16} aria-hidden="true" />}
                                                    <span>{item.label}</span>
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </div>

                            {/* Mobile: Show truncated breadcrumbs */}
                            <div className="flex md:hidden items-center space-x-1">
                                {visibleBreadcrumbs.map((item, index) => {
                                    const isLast = index === visibleBreadcrumbs.length - 1;
                                    const isEllipsis = item.label === '...';

                                    return (
                                        <li key={item.path || index} className="flex items-center">
                                            {index > 0 && (
                                                <span
                                                    className="mx-1 flex items-center"
                                                    style={{ color: '#9ca3af' }}
                                                    aria-hidden="true"
                                                >
                                                    {separator || <HugeiconsIcon icon={ArrowRight01Icon} size={16} />}
                                                </span>
                                            )}

                                            {isEllipsis ? (
                                                <button
                                                    type="button"
                                                    className="px-1 py-1 rounded transition-colors focus:outline-none focus:ring-2"
                                                    style={{
                                                        color: '#9ca3af',
                                                        borderRadius: '0.25rem',
                                                        transition: 'color 0.2s, background-color 0.2s'
                                                    }}
                                                    aria-label="Show hidden breadcrumb items"
                                                >
                                                    {item.icon && <HugeiconsIcon icon={item.icon} size={16} className="flex-shrink-0" />}
                                                    {!item.icon && <span className="truncate">{item.label}</span>}
                                                </button>
                                            ) : isLast ? (
                                                <span
                                                    className="font-medium flex items-center gap-1 truncate max-w-32"
                                                    style={{ color: '#111827' }}
                                                    aria-current="page"
                                                    title={item.label}
                                                    role="text"
                                                >
                                                    {item.icon && <HugeiconsIcon icon={item.icon} size={16} className="flex-shrink-0" aria-hidden="true" />}
                                                    <span className="truncate">{item.label}</span>
                                                </span>
                                            ) : (
                                                <Link
                                                    to={item.path}
                                                    className="hover:underline flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-1 truncate max-w-24"
                                                    style={{
                                                        color: '#374151',
                                                        borderRadius: '0.25rem',
                                                        transition: 'color 0.2s, background-color 0.2s'
                                                    }}
                                                    title={item.label}
                                                    onClick={(e) => {
                                                        if (onBreadcrumbClick) {
                                                            e.preventDefault();
                                                            onBreadcrumbClick(item);
                                                        }
                                                    }}
                                                    aria-label={`Navigate to ${item.label}`}
                                                >
                                                    {item.icon && <HugeiconsIcon icon={item.icon} size={16} className="flex-shrink-0" aria-hidden="true" />}
                                                    <span className="truncate">{item.label}</span>
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </div>
                        </ol>
                    </nav>
                </div>

                {/* Right section: Search and actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Search functionality */}
                    {(onSearch || searchBar) && (
                        <div className="relative">
                            {showSearch ? (
                                <div className="flex items-center gap-2">
                                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                                        <div className="relative">
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                placeholder={searchPlaceholder}
                                                className="w-48 sm:w-64 px-3 py-2 pl-9 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all"
                                                style={{
                                                    borderColor: '#e2e8f0',
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '0.375rem'
                                                }}
                                                aria-label={`Search ${searchPlaceholder.toLowerCase()}`}
                                            />
                                            <HugeiconsIcon
                                                icon={Search01Icon}
                                                size={16}
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                                                style={{ color: '#9ca3af' }}
                                            />
                                        </div>
                                        {searchFilters && (
                                            <div className="ml-2">
                                                {searchFilters}
                                            </div>
                                        )}
                                    </form>
                                    <button
                                        type="button"
                                        onClick={() => setShowSearch(false)}
                                        className="p-2 rounded-md transition-colors focus:outline-none focus:ring-2"
                                        style={{
                                            color: '#9ca3af',
                                            borderRadius: '0.375rem'
                                        }}
                                        aria-label="Close search"
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {searchBar || (showSearchButton && (
                                        <button
                                            onClick={handleSearchToggle}
                                            className="p-2 rounded-md transition-colors focus:outline-none focus:ring-2"
                                            style={{
                                                color: '#374151',
                                                backgroundColor: 'transparent',
                                                borderRadius: '0.375rem'
                                            }}
                                            aria-label="Open search"
                                        >
                                            <HugeiconsIcon icon={Search01Icon} size={20} />
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ModernBreadcrumbs;
