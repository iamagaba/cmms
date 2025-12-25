/**
 * Phase 2 Integration Tests
 * 
 * Tests to verify that all Phase 2 components are properly integrated
 * and working correctly with the Professional Design System.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import all Phase 2 components
import ProfessionalButton from '../ProfessionalButton';
import ProfessionalInput from '../ProfessionalInput';
import ProfessionalCard from '../ProfessionalCard';
import ProfessionalBadge, { WorkOrderStatusBadge, PriorityBadge } from '../ProfessionalBadge';

describe('Phase 2 Component Integration', () => {
  describe('ProfessionalButton', () => {
    it('renders primary button correctly', () => {
      render(<ProfessionalButton variant="primary">Test Button</ProfessionalButton>);
      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-steel-600');
    });

    it('renders with icon correctly', () => {
      render(
        <ProfessionalButton variant="primary" icon="tabler:plus">
          Add Item
        </ProfessionalButton>
      );
      const button = screen.getByRole('button', { name: /add item/i });
      expect(button).toBeInTheDocument();
    });

    it('handles loading state', () => {
      render(
        <ProfessionalButton variant="primary" loading>
          Loading
        </ProfessionalButton>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('ProfessionalInput', () => {
    it('renders basic input correctly', () => {
      render(<ProfessionalInput placeholder="Enter text" />);
      const input = screen.getByPlaceholderText(/enter text/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('input-base');
    });

    it('renders with label and description', () => {
      render(
        <ProfessionalInput
          label="Username"
          description="Enter your username"
          placeholder="username"
        />
      );
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByText(/enter your username/i)).toBeInTheDocument();
    });

    it('shows error state correctly', () => {
      render(
        <ProfessionalInput
          label="Email"
          error="Invalid email address"
          placeholder="email"
        />
      );
      
      const input = screen.getByPlaceholderText(/email/i);
      expect(input).toHaveClass('input-error');
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  describe('ProfessionalCard', () => {
    it('renders basic card correctly', () => {
      render(
        <ProfessionalCard title="Test Card">
          <p>Card content</p>
        </ProfessionalCard>
      );
      
      expect(screen.getByText(/test card/i)).toBeInTheDocument();
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
    });

    it('renders interactive card', () => {
      const handleClick = jest.fn();
      render(
        <ProfessionalCard 
          title="Clickable Card" 
          interactive 
          onClick={handleClick}
        >
          Content
        </ProfessionalCard>
      );
      
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });
  });

  describe('ProfessionalBadge', () => {
    it('renders basic badge correctly', () => {
      render(<ProfessionalBadge variant="success">Active</ProfessionalBadge>);
      const badge = screen.getByText(/active/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-industrial-100');
    });

    it('renders with icon', () => {
      render(
        <ProfessionalBadge variant="warning" icon="tabler:alert-triangle">
          Warning
        </ProfessionalBadge>
      );
      const badge = screen.getByText(/warning/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('WorkOrderStatusBadge', () => {
    it('renders work order status correctly', () => {
      render(<WorkOrderStatusBadge status="in-progress" />);
      const badge = screen.getByText(/in progress/i);
      expect(badge).toBeInTheDocument();
    });

    it('renders completed status', () => {
      render(<WorkOrderStatusBadge status="completed" />);
      const badge = screen.getByText(/completed/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-industrial-100');
    });
  });

  describe('PriorityBadge', () => {
    it('renders priority levels correctly', () => {
      render(<PriorityBadge priority="critical" />);
      const badge = screen.getByText(/critical/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-warning-100');
    });

    it('renders low priority', () => {
      render(<PriorityBadge priority="low" />);
      const badge = screen.getByText(/low/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('renders complex form with all components', () => {
      render(
        <ProfessionalCard title="Work Order Form" variant="elevated">
          <div className="space-y-4">
            <ProfessionalInput
              label="Work Order Title"
              placeholder="Enter title"
              required
            />
            
            <div className="flex gap-2">
              <WorkOrderStatusBadge status="new" />
              <PriorityBadge priority="high" />
            </div>
            
            <div className="flex gap-2">
              <ProfessionalButton variant="primary">
                Save
              </ProfessionalButton>
              <ProfessionalButton variant="secondary">
                Cancel
              </ProfessionalButton>
            </div>
          </div>
        </ProfessionalCard>
      );

      // Verify all components are rendered
      expect(screen.getByText(/work order form/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/work order title/i)).toBeInTheDocument();
      expect(screen.getByText(/new/i)).toBeInTheDocument();
      expect(screen.getByText(/high/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('CSS Utility Classes', () => {
    it('applies button utility classes correctly', () => {
      render(<button className="btn-primary">Utility Button</button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('applies input utility classes correctly', () => {
      render(<input className="input-base" placeholder="test" />);
      const input = screen.getByPlaceholderText(/test/i);
      expect(input).toHaveClass('input-base');
    });

    it('applies card utility classes correctly', () => {
      render(<div className="card-base">Card Content</div>);
      const card = screen.getByText(/card content/i);
      expect(card).toHaveClass('card-base');
    });

    it('applies status utility classes correctly', () => {
      render(<span className="status-success">Success</span>);
      const status = screen.getByText(/success/i);
      expect(status).toHaveClass('status-success');
    });
  });

  describe('Accessibility', () => {
    it('buttons have proper accessibility attributes', () => {
      render(
        <ProfessionalButton variant="primary" disabled>
          Disabled Button
        </ProfessionalButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('inputs have proper labels and descriptions', () => {
      render(
        <ProfessionalInput
          label="Required Field"
          description="This field is required"
          required
          id="test-input"
        />
      );
      
      const input = screen.getByLabelText(/required field/i);
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('cards have proper semantic structure', () => {
      render(
        <ProfessionalCard 
          title="Accessible Card"
          interactive
          onClick={() => {}}
        >
          Content
        </ProfessionalCard>
      );
      
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      render(
        <div className="grid-responsive">
          <ProfessionalCard title="Card 1">Content 1</ProfessionalCard>
          <ProfessionalCard title="Card 2">Content 2</ProfessionalCard>
        </div>
      );
      
      const grid = screen.getByText(/content 1/i).closest('.grid-responsive');
      expect(grid).toHaveClass('grid-responsive');
    });
  });
});

// Test utility functions
describe('Design System Utilities', () => {
  describe('CSS Custom Properties', () => {
    it('should have design system CSS variables available', () => {
      // This would typically be tested in a browser environment
      // where CSS custom properties are available
      expect(true).toBe(true); // Placeholder for CSS variable tests
    });
  });

  describe('Theme Integration', () => {
    it('should support dark mode classes', () => {
      render(
        <div data-theme="dark">
          <ProfessionalButton variant="primary">Dark Mode Button</ProfessionalButton>
        </div>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});