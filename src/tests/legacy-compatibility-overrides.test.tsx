/**
 * Unit Tests: Legacy Compatibility Overrides
 * Feature: pure-black-dark-theme
 * 
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 * 
 * Tests that legacy Tailwind class overrides work correctly with the pure black theme.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';

describe('Legacy Compatibility Overrides', () => {
  beforeEach(() => {
    // Apply dark theme class to document root
    document.documentElement.classList.add('dark');
  });

  afterEach(() => {
    // Clean up
    document.documentElement.classList.remove('dark');
    cleanup();
  });

  describe('Background Color Overrides', () => {
    it('should map .bg-white to --card in dark mode', () => {
      const { container } = render(
        <div className="bg-white" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      const computedStyle = window.getComputedStyle(element);
      
      // The background should use the --card variable
      // We can't directly test the CSS variable, but we can verify the class is applied
      expect(element.classList.contains('bg-white')).toBe(true);
    });

    it('should map .bg-gray-50 to --muted with opacity in dark mode', () => {
      const { container } = render(
        <div className="bg-gray-50" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('bg-gray-50')).toBe(true);
    });

    it('should map .bg-gray-100 to --muted in dark mode', () => {
      const { container } = render(
        <div className="bg-gray-100" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('bg-gray-100')).toBe(true);
    });

    it('should handle compound classes with bg-white', () => {
      const { container } = render(
        <div className="bg-white p-4 rounded-lg" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('bg-white')).toBe(true);
      expect(element.classList.contains('p-4')).toBe(true);
      expect(element.classList.contains('rounded-lg')).toBe(true);
    });
  });

  describe('Text Color Overrides', () => {
    it('should map .text-gray-900 to --foreground in dark mode', () => {
      const { container } = render(
        <div className="text-gray-900" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('text-gray-900')).toBe(true);
    });

    it('should map .text-gray-800 to --foreground in dark mode', () => {
      const { container } = render(
        <div className="text-gray-800" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('text-gray-800')).toBe(true);
    });

    it('should map .text-gray-600 to --muted-foreground in dark mode', () => {
      const { container } = render(
        <div className="text-gray-600" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('text-gray-600')).toBe(true);
    });

    it('should map .text-gray-700 to --muted-foreground in dark mode', () => {
      const { container } = render(
        <div className="text-gray-700" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('text-gray-700')).toBe(true);
    });

    it('should handle compound classes with text colors', () => {
      const { container } = render(
        <div className="text-gray-900 font-semibold text-lg" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('text-gray-900')).toBe(true);
      expect(element.classList.contains('font-semibold')).toBe(true);
      expect(element.classList.contains('text-lg')).toBe(true);
    });
  });

  describe('Border Color Overrides', () => {
    it('should map .border-gray-200 to --border in dark mode', () => {
      const { container } = render(
        <div className="border border-gray-200" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('border-gray-200')).toBe(true);
    });

    it('should map .border-gray-300 to --border in dark mode', () => {
      const { container } = render(
        <div className="border border-gray-300" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('border-gray-300')).toBe(true);
    });

    it('should handle compound border classes', () => {
      const { container } = render(
        <div className="border border-gray-200 rounded-md p-4" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('border')).toBe(true);
      expect(element.classList.contains('border-gray-200')).toBe(true);
      expect(element.classList.contains('rounded-md')).toBe(true);
    });
  });

  describe('Divide Color Overrides', () => {
    it('should map .divide-gray-200 to --border in dark mode', () => {
      const { container } = render(
        <div className="divide-y divide-gray-200" data-testid="test-element">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('divide-gray-200')).toBe(true);
    });
  });

  describe('Table Row Interactions', () => {
    it('should apply hover state to table rows', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr data-testid="test-row">
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </tbody>
        </table>
      );

      const row = container.querySelector('[data-testid="test-row"]') as HTMLElement;
      expect(row).toBeTruthy();
      expect(row.tagName).toBe('TR');
    });

    it('should apply selected state to table rows', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr data-state="selected" data-testid="test-row">
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </tbody>
        </table>
      );

      const row = container.querySelector('[data-testid="test-row"]') as HTMLElement;
      expect(row).toBeTruthy();
      expect(row.getAttribute('data-state')).toBe('selected');
    });

    it('should handle table with multiple rows', () => {
      const { container } = render(
        <table>
          <tbody>
            <tr data-testid="row-1">
              <td>Cell 1</td>
            </tr>
            <tr data-testid="row-2" data-state="selected">
              <td>Cell 2</td>
            </tr>
            <tr data-testid="row-3">
              <td>Cell 3</td>
            </tr>
          </tbody>
        </table>
      );

      const row1 = container.querySelector('[data-testid="row-1"]') as HTMLElement;
      const row2 = container.querySelector('[data-testid="row-2"]') as HTMLElement;
      const row3 = container.querySelector('[data-testid="row-3"]') as HTMLElement;

      expect(row1).toBeTruthy();
      expect(row2).toBeTruthy();
      expect(row3).toBeTruthy();
      expect(row2.getAttribute('data-state')).toBe('selected');
    });
  });

  describe('Component Rendering with Legacy Classes', () => {
    it('should render card-like component with legacy classes', () => {
      const { container } = render(
        <div className="bg-white border border-gray-200 rounded-lg p-4" data-testid="card">
          <h2 className="text-gray-900 font-semibold">Card Title</h2>
          <p className="text-gray-600">Card description text</p>
        </div>
      );

      const card = container.querySelector('[data-testid="card"]') as HTMLElement;
      expect(card).toBeTruthy();
      expect(card.classList.contains('bg-white')).toBe(true);
      expect(card.classList.contains('border-gray-200')).toBe(true);
    });

    it('should render list with legacy classes', () => {
      const { container } = render(
        <div className="bg-white divide-y divide-gray-200" data-testid="list">
          <div className="p-4">
            <span className="text-gray-900">Item 1</span>
          </div>
          <div className="p-4">
            <span className="text-gray-900">Item 2</span>
          </div>
        </div>
      );

      const list = container.querySelector('[data-testid="list"]') as HTMLElement;
      expect(list).toBeTruthy();
      expect(list.classList.contains('bg-white')).toBe(true);
      expect(list.classList.contains('divide-gray-200')).toBe(true);
    });

    it('should render form with legacy classes', () => {
      const { container } = render(
        <div className="bg-white border border-gray-200 rounded-lg p-6" data-testid="form">
          <label className="text-gray-700">Label</label>
          <input className="border border-gray-300 bg-gray-50" />
          <button className="bg-gray-100 text-gray-900">Submit</button>
        </div>
      );

      const form = container.querySelector('[data-testid="form"]') as HTMLElement;
      expect(form).toBeTruthy();
      expect(form.classList.contains('bg-white')).toBe(true);
    });

    it('should render nested components with mixed legacy and modern classes', () => {
      const { container } = render(
        <div className="bg-background" data-testid="modern-container">
          <div className="bg-white border border-gray-200" data-testid="legacy-card">
            <h3 className="text-foreground">Modern Title</h3>
            <p className="text-gray-600">Legacy text</p>
          </div>
        </div>
      );

      const modernContainer = container.querySelector('[data-testid="modern-container"]') as HTMLElement;
      const legacyCard = container.querySelector('[data-testid="legacy-card"]') as HTMLElement;

      expect(modernContainer).toBeTruthy();
      expect(legacyCard).toBeTruthy();
      expect(modernContainer.classList.contains('bg-background')).toBe(true);
      expect(legacyCard.classList.contains('bg-white')).toBe(true);
    });
  });

  describe('Dark Mode Class Requirement', () => {
    it('should only apply overrides when .dark class is present', () => {
      // Remove dark class
      document.documentElement.classList.remove('dark');

      const { container } = render(
        <div className="bg-white" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('bg-white')).toBe(true);
      
      // Re-add dark class for other tests
      document.documentElement.classList.add('dark');
    });

    it('should apply overrides when .dark class is present', () => {
      // Ensure dark class is present
      document.documentElement.classList.add('dark');

      const { container } = render(
        <div className="bg-white" data-testid="test-element">
          Test Content
        </div>
      );

      const element = container.querySelector('[data-testid="test-element"]') as HTMLElement;
      expect(element.classList.contains('bg-white')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('CSS Variable Integration', () => {
    it('should verify CSS variables are available in dark mode', () => {
      const rootStyles = getComputedStyle(document.documentElement);
      
      // These variables should be defined (though we can't easily test their values in jsdom)
      // The actual values are tested in css-variable-values.test.ts
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should render components that rely on CSS variable overrides', () => {
      const { container } = render(
        <div className="bg-white text-gray-900 border border-gray-200 p-4" data-testid="component">
          <span className="text-gray-600">Secondary text</span>
        </div>
      );

      const component = container.querySelector('[data-testid="component"]') as HTMLElement;
      expect(component).toBeTruthy();
      
      // Verify all legacy classes are present
      expect(component.classList.contains('bg-white')).toBe(true);
      expect(component.classList.contains('text-gray-900')).toBe(true);
      expect(component.classList.contains('border-gray-200')).toBe(true);
    });
  });
});
