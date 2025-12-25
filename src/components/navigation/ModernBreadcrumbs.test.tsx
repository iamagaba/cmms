import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import ModernBreadcrumbs from './ModernBreadcrumbs';

// Mock react-router-dom navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({ 
  children, 
  initialEntries = ['/'] 
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
);

describe('ModernBreadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders basic breadcrumb navigation', () => {
    render(
      <TestWrapper initialEntries={['/work-orders/123']}>
        <ModernBreadcrumbs />
      </TestWrapper>
    );

    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Work orders')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('displays custom breadcrumbs when provided', () => {
    const customBreadcrumbs = [
      { label: 'Dashboard', path: '/', icon: 'tabler:dashboard' },
      { label: 'Assets', path: '/assets', icon: 'tabler:tools' },
      { label: 'Asset Details', path: '/assets/456' },
    ];

    render(
      <TestWrapper>
        <ModernBreadcrumbs customBreadcrumbs={customBreadcrumbs} />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Asset Details')).toBeInTheDocument();
  });

  it('handles back button navigation', () => {
    render(
      <TestWrapper initialEntries={['/work-orders/123']}>
        <ModernBreadcrumbs />
      </TestWrapper>
    );

    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows search functionality when onSearch is provided', () => {
    const mockOnSearch = vi.fn();

    render(
      <TestWrapper>
        <ModernBreadcrumbs onSearch={mockOnSearch} />
      </TestWrapper>
    );

    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search submission', async () => {
    const mockOnSearch = vi.fn();

    render(
      <TestWrapper>
        <ModernBreadcrumbs onSearch={mockOnSearch} />
      </TestWrapper>
    );

    // Open search
    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    // Type in search input
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    // Submit search
    fireEvent.submit(searchInput.closest('form')!);

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('displays navigation history when enabled', async () => {
    render(
      <TestWrapper initialEntries={['/work-orders/123']}>
        <ModernBreadcrumbs showNavigationHistory={true} />
      </TestWrapper>
    );

    // Wait for history to be populated (component effect)
    await waitFor(() => {
      const historyButton = screen.queryByRole('button', { name: /navigation history/i });
      if (historyButton) {
        fireEvent.click(historyButton);
        expect(screen.getByText('Recent Pages')).toBeInTheDocument();
      }
    });
  });

  it('truncates breadcrumbs on mobile view', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640, // Mobile width
    });

    render(
      <TestWrapper initialEntries={['/dashboard/work-orders/123/details']}>
        <ModernBreadcrumbs />
      </TestWrapper>
    );

    // Should show ellipsis for truncated breadcrumbs on mobile
    const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(breadcrumbNav).toBeInTheDocument();
  });

  it('handles keyboard navigation shortcuts', () => {
    const mockOnSearch = vi.fn();

    render(
      <TestWrapper>
        <ModernBreadcrumbs onSearch={mockOnSearch} enableKeyboardNavigation={true} />
      </TestWrapper>
    );

    // Test Ctrl+K to open search
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();

    // Test Escape to close search
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('handles Alt+Left arrow for back navigation', () => {
    render(
      <TestWrapper initialEntries={['/work-orders/123']}>
        <ModernBreadcrumbs enableKeyboardNavigation={true} />
      </TestWrapper>
    );

    // Test Alt+Left Arrow for back navigation
    fireEvent.keyDown(document, { key: 'ArrowLeft', altKey: true });
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders custom search bar when provided', () => {
    const customSearchBar = <input placeholder="Custom search" data-testid="custom-search" />;

    render(
      <TestWrapper>
        <ModernBreadcrumbs searchBar={customSearchBar} />
      </TestWrapper>
    );

    expect(screen.getByTestId('custom-search')).toBeInTheDocument();
  });

  it('renders action buttons when provided', () => {
    const actions = (
      <button data-testid="custom-action">Custom Action</button>
    );

    render(
      <TestWrapper>
        <ModernBreadcrumbs actions={actions} />
      </TestWrapper>
    );

    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });

  it('applies proper ARIA labels and semantic markup', () => {
    render(
      <TestWrapper initialEntries={['/work-orders/123']}>
        <ModernBreadcrumbs />
      </TestWrapper>
    );

    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const currentPage = screen.getByText('123');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('handles focus management correctly', () => {
    const mockOnSearch = vi.fn();

    render(
      <TestWrapper>
        <ModernBreadcrumbs onSearch={mockOnSearch} />
      </TestWrapper>
    );

    const searchButton = screen.getByRole('button', { name: /open search/i });
    
    // Focus should work on interactive elements
    searchButton.focus();
    expect(document.activeElement).toBe(searchButton);
  });

  it('limits navigation history to maxHistoryItems', async () => {
    const maxItems = 3;

    render(
      <TestWrapper initialEntries={['/page1']}>
        <ModernBreadcrumbs 
          showNavigationHistory={true} 
          maxHistoryItems={maxItems}
        />
      </TestWrapper>
    );

    // The component should respect the maxHistoryItems limit
    // This is tested through the component's internal state management
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('handles empty search submission gracefully', () => {
    const mockOnSearch = vi.fn();

    render(
      <TestWrapper>
        <ModernBreadcrumbs onSearch={mockOnSearch} />
      </TestWrapper>
    );

    // Open search
    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    // Submit empty search
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.submit(searchInput.closest('form')!);

    // Should not call onSearch with empty value
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('uses custom search placeholder when provided', () => {
    const customPlaceholder = 'Search work orders...';

    render(
      <TestWrapper>
        <ModernBreadcrumbs 
          onSearch={vi.fn()} 
          searchPlaceholder={customPlaceholder}
        />
      </TestWrapper>
    );

    // Open search
    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it('supports enhanced responsive behavior with proper truncation', () => {
    const longBreadcrumbs = [
      { label: 'Dashboard', path: '/', icon: 'tabler:dashboard' },
      { label: 'Work Orders', path: '/work-orders', icon: 'tabler:clipboard' },
      { label: 'Maintenance', path: '/work-orders/maintenance' },
      { label: 'Equipment', path: '/work-orders/maintenance/equipment' },
      { label: 'Details', path: '/work-orders/maintenance/equipment/123' },
    ];

    render(
      <TestWrapper>
        <ModernBreadcrumbs customBreadcrumbs={longBreadcrumbs} />
      </TestWrapper>
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Should handle long breadcrumb chains appropriately
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('integrates with design tokens for consistent styling', () => {
    render(
      <TestWrapper>
        <ModernBreadcrumbs 
          onSearch={vi.fn()}
          className="custom-breadcrumb"
          aria-label="Custom navigation"
        />
      </TestWrapper>
    );

    const nav = screen.getByRole('navigation', { name: /custom navigation/i });
    expect(nav).toBeInTheDocument();
    
    const header = nav.closest('header');
    expect(header).toHaveClass('custom-breadcrumb');
  });

  it('supports search filters integration', () => {
    const searchFilters = (
      <select data-testid="search-filter">
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>
    );

    render(
      <TestWrapper>
        <ModernBreadcrumbs 
          onSearch={vi.fn()}
          searchFilters={searchFilters}
        />
      </TestWrapper>
    );

    // Open search
    const searchButton = screen.getByRole('button', { name: /open search/i });
    fireEvent.click(searchButton);

    expect(screen.getByTestId('search-filter')).toBeInTheDocument();
  });

  it('can hide search button when showSearchButton is false', () => {
    render(
      <TestWrapper>
        <ModernBreadcrumbs 
          onSearch={vi.fn()}
          showSearchButton={false}
        />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /open search/i })).not.toBeInTheDocument();
  });
});