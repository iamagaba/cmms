/**
 * Professional Card Component Tests
 * 
 * Tests for the comprehensive card system including base cards,
 * metric cards, data cards, action cards, and container components.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfessionalCard, {
  MetricCard,
  DataCard,
  ActionCard,
  Container,
  CardGrid,
} from '../ProfessionalCard';

describe('ProfessionalCard', () => {
  it('renders basic card with content', () => {
    render(
      <ProfessionalCard>
        <p>Card content</p>
      </ProfessionalCard>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders card with title and subtitle', () => {
    render(
      <ProfessionalCard
        title="Test Title"
        subtitle="Test Subtitle"
      >
        <p>Card content</p>
      </ProfessionalCard>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders card with icon', () => {
    render(
      <ProfessionalCard
        icon="tabler:settings"
        title="Settings"
      >
        <p>Card content</p>
      </ProfessionalCard>
    );
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('handles interactive card clicks', () => {
    const handleClick = vi.fn();
    
    render(
      <ProfessionalCard
        interactive
        onClick={handleClick}
        title="Clickable Card"
      >
        <p>Click me</p>
      </ProfessionalCard>
    );
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading skeleton when loading', () => {
    render(
      <ProfessionalCard loading>
        <p>This should not be visible</p>
      </ProfessionalCard>
    );
    
    expect(screen.queryByText('This should not be visible')).not.toBeInTheDocument();
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(
      <ProfessionalCard variant="elevated" data-testid="card">
        <p>Content</p>
      </ProfessionalCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-md');
    
    rerender(
      <ProfessionalCard variant="outlined" data-testid="card">
        <p>Content</p>
      </ProfessionalCard>
    );
    
    expect(card).toHaveClass('border-2');
  });
});

describe('MetricCard', () => {
  it('renders metric value and label', () => {
    render(
      <MetricCard
        value="42"
        label="Total Assets"
      />
    );
    
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total Assets')).toBeInTheDocument();
  });

  it('renders change indicator with correct styling', () => {
    render(
      <MetricCard
        value="100"
        label="Work Orders"
        change={{
          value: '+12%',
          type: 'increase',
          label: 'vs last month'
        }}
      />
    );
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('renders with icon and theme', () => {
    render(
      <MetricCard
        value="85%"
        label="Efficiency"
        icon="tabler:chart-line"
        theme="success"
      />
    );
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Efficiency')).toBeInTheDocument();
  });
});

describe('DataCard', () => {
  const mockData = [
    { label: 'Active Assets', value: '150', icon: 'tabler:device-desktop' },
    { label: 'Pending Repairs', value: '23', icon: 'tabler:tools' },
    { label: 'Completed Today', value: '8', icon: 'tabler:check' },
  ];

  it('renders data items correctly', () => {
    render(
      <DataCard
        title="Asset Summary"
        data={mockData}
      />
    );
    
    expect(screen.getByText('Asset Summary')).toBeInTheDocument();
    expect(screen.getByText('Active Assets')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Pending Repairs')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('shows dividers between items when enabled', () => {
    const { container } = render(
      <DataCard
        data={mockData}
        showDividers={true}
      />
    );
    
    const dividers = container.querySelectorAll('.border-t');
    expect(dividers.length).toBeGreaterThan(0);
  });
});

describe('ActionCard', () => {
  it('renders title and description', () => {
    render(
      <ActionCard
        title="Create Work Order"
        description="Start a new maintenance task"
        primaryAction={{
          label: 'Create',
          onClick: vi.fn(),
        }}
      />
    );
    
    expect(screen.getByText('Create Work Order')).toBeInTheDocument();
    expect(screen.getByText('Start a new maintenance task')).toBeInTheDocument();
  });

  it('handles primary action click', () => {
    const handlePrimaryAction = vi.fn();
    
    render(
      <ActionCard
        title="Test Action"
        primaryAction={{
          label: 'Primary',
          onClick: handlePrimaryAction,
        }}
      />
    );
    
    const button = screen.getByText('Primary');
    fireEvent.click(button);
    
    expect(handlePrimaryAction).toHaveBeenCalledTimes(1);
  });

  it('handles secondary action click', () => {
    const handleSecondaryAction = vi.fn();
    
    render(
      <ActionCard
        title="Test Action"
        primaryAction={{
          label: 'Primary',
          onClick: vi.fn(),
        }}
        secondaryAction={{
          label: 'Secondary',
          onClick: handleSecondaryAction,
        }}
      />
    );
    
    const button = screen.getByText('Secondary');
    fireEvent.click(button);
    
    expect(handleSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('shows loading state for primary action', () => {
    render(
      <ActionCard
        title="Test Action"
        primaryAction={{
          label: 'Loading',
          onClick: vi.fn(),
          loading: true,
        }}
      />
    );
    
    const button = screen.getByText('Loading');
    expect(button).toBeDisabled();
  });
});

describe('Container', () => {
  it('renders with default props', () => {
    render(
      <Container data-testid="container">
        <p>Container content</p>
      </Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-4xl', 'mx-auto');
    expect(screen.getByText('Container content')).toBeInTheDocument();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(
      <Container size="sm" data-testid="container">
        <p>Content</p>
      </Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-2xl');
    
    rerender(
      <Container size="xl" data-testid="container">
        <p>Content</p>
      </Container>
    );
    
    expect(container).toHaveClass('max-w-7xl');
  });

  it('handles centering option', () => {
    const { rerender } = render(
      <Container centered={false} data-testid="container">
        <p>Content</p>
      </Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).not.toHaveClass('mx-auto');
    
    rerender(
      <Container centered={true} data-testid="container">
        <p>Content</p>
      </Container>
    );
    
    expect(container).toHaveClass('mx-auto');
  });
});

describe('CardGrid', () => {
  it('renders children in grid layout', () => {
    render(
      <CardGrid data-testid="grid">
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </CardGrid>
    );
    
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('grid');
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

  it('applies gap classes correctly', () => {
    const { rerender } = render(
      <CardGrid gap="sm" data-testid="grid">
        <div>Card</div>
      </CardGrid>
    );
    
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('gap-4');
    
    rerender(
      <CardGrid gap="lg" data-testid="grid">
        <div>Card</div>
      </CardGrid>
    );
    
    expect(grid).toHaveClass('gap-8');
  });
});

describe('Accessibility', () => {
  it('provides proper ARIA attributes for interactive cards', () => {
    render(
      <ProfessionalCard
        interactive
        onClick={vi.fn()}
        title="Interactive Card"
      >
        <p>Content</p>
      </ProfessionalCard>
    );
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('provides proper button semantics for action cards', () => {
    render(
      <ActionCard
        title="Action Card"
        primaryAction={{
          label: 'Action Button',
          onClick: vi.fn(),
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Action Button' });
    expect(button).toBeInTheDocument();
  });

  it('maintains semantic structure with headings', () => {
    render(
      <ProfessionalCard title="Card Title">
        <p>Content</p>
      </ProfessionalCard>
    );
    
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Card Title');
  });
});