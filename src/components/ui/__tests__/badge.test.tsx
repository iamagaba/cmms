import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, StatusBadge, PriorityBadge } from '../badge';

describe('Badge Component', () => {
  describe('Basic Badge Variants', () => {
    it('renders default variant', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });

    it('renders destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      expect(screen.getByText('Destructive')).toBeInTheDocument();
    });
  });

  describe('Status Variants', () => {
    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-emerald-200', 'bg-emerald-50', 'text-emerald-700');
    });

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-amber-200', 'bg-amber-50', 'text-amber-700');
    });

    it('renders error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-rose-200', 'bg-rose-50', 'text-rose-700');
    });

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-blue-200', 'bg-blue-50', 'text-blue-700');
    });
  });

  describe('Work Order Status Variants', () => {
    it('renders open variant', () => {
      render(<Badge variant="open">Open</Badge>);
      const badge = screen.getByText('Open');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-blue-200', 'bg-blue-50', 'text-blue-700');
    });

    it('renders in-progress variant', () => {
      render(<Badge variant="in-progress">In Progress</Badge>);
      const badge = screen.getByText('In Progress');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-amber-200', 'bg-amber-50', 'text-amber-700');
    });

    it('renders completed variant', () => {
      render(<Badge variant="completed">Completed</Badge>);
      const badge = screen.getByText('Completed');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-emerald-200', 'bg-emerald-50', 'text-emerald-700');
    });

    it('renders cancelled variant', () => {
      render(<Badge variant="cancelled">Cancelled</Badge>);
      const badge = screen.getByText('Cancelled');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-gray-200', 'bg-gray-50', 'text-gray-700');
    });
  });

  describe('Priority Variants', () => {
    it('renders critical variant with bold font', () => {
      render(<Badge variant="critical">Critical</Badge>);
      const badge = screen.getByText('Critical');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-rose-200', 'bg-rose-50', 'text-rose-700', 'font-bold');
    });

    it('renders high variant', () => {
      render(<Badge variant="high">High</Badge>);
      const badge = screen.getByText('High');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-orange-200', 'bg-orange-50', 'text-orange-700');
    });

    it('renders medium variant', () => {
      render(<Badge variant="medium">Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-amber-200', 'bg-amber-50', 'text-amber-700');
    });

    it('renders low variant', () => {
      render(<Badge variant="low">Low</Badge>);
      const badge = screen.getByText('Low');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-gray-200', 'bg-gray-50', 'text-gray-700');
    });
  });

  describe('StatusBadge Helper Component', () => {
    it('maps Open status to open variant', () => {
      render(<StatusBadge status="Open" />);
      const badge = screen.getByText('Open');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-blue-200', 'bg-blue-50', 'text-blue-700');
    });

    it('maps In Progress status to in-progress variant', () => {
      render(<StatusBadge status="In Progress" />);
      const badge = screen.getByText('In Progress');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-amber-200', 'bg-amber-50', 'text-amber-700');
    });

    it('maps Completed status to completed variant', () => {
      render(<StatusBadge status="Completed" />);
      const badge = screen.getByText('Completed');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-emerald-200', 'bg-emerald-50', 'text-emerald-700');
    });

    it('maps Cancelled status to cancelled variant', () => {
      render(<StatusBadge status="Cancelled" />);
      const badge = screen.getByText('Cancelled');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-gray-200', 'bg-gray-50', 'text-gray-700');
    });

    it('uses default variant for unknown status', () => {
      render(<StatusBadge status="Unknown" />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('PriorityBadge Helper Component', () => {
    it('maps Critical priority to critical variant', () => {
      render(<PriorityBadge priority="Critical" />);
      const badge = screen.getByText('Critical');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-rose-200', 'bg-rose-50', 'text-rose-700', 'font-bold');
    });

    it('maps High priority to high variant', () => {
      render(<PriorityBadge priority="High" />);
      const badge = screen.getByText('High');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-orange-200', 'bg-orange-50', 'text-orange-700');
    });

    it('maps Medium priority to medium variant', () => {
      render(<PriorityBadge priority="Medium" />);
      const badge = screen.getByText('Medium');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-amber-200', 'bg-amber-50', 'text-amber-700');
    });

    it('maps Low priority to low variant', () => {
      render(<PriorityBadge priority="Low" />);
      const badge = screen.getByText('Low');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border-gray-200', 'bg-gray-50', 'text-gray-700');
    });

    it('uses default variant for unknown priority', () => {
      render(<PriorityBadge priority="Unknown" />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('includes dark mode classes for status variants', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('dark:border-emerald-800');
      expect(badge.className).toContain('dark:bg-emerald-950');
      expect(badge.className).toContain('dark:text-emerald-400');
    });

    it('includes dark mode classes for priority variants', () => {
      const { container } = render(<Badge variant="critical">Critical</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('dark:border-rose-800');
      expect(badge.className).toContain('dark:bg-rose-950');
      expect(badge.className).toContain('dark:text-rose-400');
    });
  });

  describe('Styling', () => {
    it('uses rounded-md border radius', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('rounded-md');
    });

    it('uses px-2.5 horizontal padding', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('px-2.5');
    });

    it('includes focus ring styles', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('focus:ring-2');
      expect(badge.className).toContain('focus:ring-ring');
    });
  });
});
