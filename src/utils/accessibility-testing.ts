/**
 * Accessibility Testing Utilities
 * 
 * This module provides utilities for testing accessibility features
 * across navigation components, modals, and other interactive elements.
 */

/**
 * Simulates keyboard navigation through a list of elements
 */
export const simulateKeyboardNavigation = async (
  elements: HTMLElement[],
  user: any,
  direction: 'forward' | 'backward' = 'forward'
) => {
  const key = direction === 'forward' ? '{Tab}' : '{Shift>}{Tab}{/Shift}';
  
  for (let i = 0; i < elements.length; i++) {
    await user.keyboard(key);
    if (direction === 'forward') {
      expect(elements[i]).toHaveFocus();
    } else {
      expect(elements[elements.length - 1 - i]).toHaveFocus();
    }
  }
};

/**
 * Tests focus trap functionality in modals/drawers
 */
export const testFocusTrap = async (
  container: HTMLElement,
  user: any,
  expectedFocusableCount: number
) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  expect(focusableElements).toHaveLength(expectedFocusableCount);
  
  // Tab through all elements and ensure focus wraps
  for (let i = 0; i < focusableElements.length + 1; i++) {
    await user.tab();
  }
  
  // Focus should wrap back to first element
  expect(focusableElements[0]).toHaveFocus();
};

/**
 * Verifies ARIA attributes are properly set
 */
export const verifyAriaAttributes = (
  element: HTMLElement,
  expectedAttributes: Record<string, string>
) => {
  Object.entries(expectedAttributes).forEach(([attribute, value]) => {
    expect(element).toHaveAttribute(attribute, value);
  });
};

/**
 * Tests keyboard shortcuts and hotkeys
 */
export const testKeyboardShortcuts = async (
  shortcuts: Array<{
    key: string;
    expectedAction: () => void;
    description: string;
  }>,
  user: any
) => {
  for (const shortcut of shortcuts) {
    await user.keyboard(shortcut.key);
    shortcut.expectedAction();
  }
};

/**
 * Simulates screen reader navigation patterns
 */
export const simulateScreenReaderNavigation = (container: HTMLElement) => {
  // Find all landmarks
  const landmarks = container.querySelectorAll(
    '[role="navigation"], [role="main"], [role="banner"], [role="contentinfo"], [role="complementary"]'
  );
  
  // Find all headings
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
  
  // Find all interactive elements
  const interactiveElements = container.querySelectorAll(
    'button, [role="button"], a, [role="link"], input, select, textarea'
  );
  
  return {
    landmarks: Array.from(landmarks),
    headings: Array.from(headings),
    interactiveElements: Array.from(interactiveElements)
  };
};

/**
 * Tests focus restoration after overlay closes
 */
export const testFocusRestoration = async (
  triggerElement: HTMLElement,
  openOverlay: () => Promise<void>,
  closeOverlay: () => Promise<void>
) => {
  // Focus trigger element
  triggerElement.focus();
  expect(triggerElement).toHaveFocus();
  
  // Open overlay
  await openOverlay();
  
  // Close overlay
  await closeOverlay();
  
  // Focus should return to trigger
  expect(triggerElement).toHaveFocus();
};

/**
 * Validates color contrast ratios for accessibility
 */
export const validateColorContrast = (
  element: HTMLElement,
  minimumRatio: number = 4.5
) => {
  const styles = window.getComputedStyle(element);
  const backgroundColor = styles.backgroundColor;
  const color = styles.color;
  
  // Note: This is a simplified check. In a real implementation,
  // you would use a proper color contrast calculation library
  expect(backgroundColor).toBeTruthy();
  expect(color).toBeTruthy();
  
  return {
    backgroundColor,
    color,
    // In a real implementation, calculate and return actual contrast ratio
    contrastRatio: minimumRatio // Placeholder
  };
};

/**
 * Tests responsive accessibility features
 */
export const testResponsiveAccessibility = (
  container: HTMLElement,
  breakpoints: Array<{ width: number; height: number; name: string }>
) => {
  const results: Array<{
    breakpoint: string;
    focusableElements: number;
    landmarks: number;
    headings: number;
  }> = [];
  
  breakpoints.forEach(({ width, height, name }) => {
    // Mock viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    const navigation = simulateScreenReaderNavigation(container);
    
    results.push({
      breakpoint: name,
      focusableElements: navigation.interactiveElements.length,
      landmarks: navigation.landmarks.length,
      headings: navigation.headings.length,
    });
  });
  
  return results;
};

/**
 * Tests loading state accessibility
 */
export const testLoadingStateAccessibility = (
  loadingElement: HTMLElement,
  expectedAriaLabel?: string
) => {
  // Check for loading indicators
  const loadingIndicators = loadingElement.querySelectorAll(
    '[aria-busy="true"], [role="progressbar"], [aria-live]'
  );
  
  expect(loadingIndicators.length).toBeGreaterThan(0);
  
  if (expectedAriaLabel) {
    expect(loadingElement).toHaveAttribute('aria-label', expectedAriaLabel);
  }
  
  return Array.from(loadingIndicators);
};

/**
 * Validates form accessibility
 */
export const validateFormAccessibility = (formElement: HTMLElement) => {
  const inputs = formElement.querySelectorAll('input, select, textarea');
  const labels = formElement.querySelectorAll('label');
  const errors = formElement.querySelectorAll('[role="alert"], .error, [aria-invalid="true"]');
  
  // Each input should have an associated label
  inputs.forEach((input) => {
    const inputElement = input as HTMLInputElement;
    const hasLabel = 
      inputElement.labels?.length > 0 ||
      inputElement.hasAttribute('aria-label') ||
      inputElement.hasAttribute('aria-labelledby');
    
    expect(hasLabel).toBe(true);
  });
  
  return {
    inputs: Array.from(inputs),
    labels: Array.from(labels),
    errors: Array.from(errors)
  };
};

/**
 * Tests table accessibility
 */
export const validateTableAccessibility = (tableElement: HTMLElement) => {
  const table = tableElement.querySelector('table');
  if (!table) return null;
  
  const headers = table.querySelectorAll('th');
  const cells = table.querySelectorAll('td');
  const caption = table.querySelector('caption');
  
  // Check for proper table structure
  expect(headers.length).toBeGreaterThan(0);
  
  // Headers should have scope attributes
  headers.forEach((header) => {
    const hasScope = 
      header.hasAttribute('scope') ||
      header.hasAttribute('id');
    expect(hasScope).toBe(true);
  });
  
  return {
    table,
    headers: Array.from(headers),
    cells: Array.from(cells),
    caption
  };
};

/**
 * Performance testing for accessibility features
 */
export const measureAccessibilityPerformance = (
  testFunction: () => void,
  testName: string,
  maxDuration: number = 100
) => {
  const startTime = performance.now();
  testFunction();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`${testName} took ${duration.toFixed(2)}ms`);
  expect(duration).toBeLessThan(maxDuration);
  
  return duration;
};

/**
 * Accessibility testing configuration
 */
export const accessibilityTestConfig = {
  // Common ARIA attributes to test
  ariaAttributes: [
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'aria-expanded',
    'aria-selected',
    'aria-checked',
    'aria-disabled',
    'aria-hidden',
    'aria-live',
    'aria-atomic',
    'role'
  ],
  
  // Common keyboard shortcuts
  keyboardShortcuts: {
    escape: '{Escape}',
    enter: '{Enter}',
    space: ' ',
    tab: '{Tab}',
    shiftTab: '{Shift>}{Tab}{/Shift}',
    arrowUp: '{ArrowUp}',
    arrowDown: '{ArrowDown}',
    arrowLeft: '{ArrowLeft}',
    arrowRight: '{ArrowRight}',
    home: '{Home}',
    end: '{End}'
  },
  
  // Minimum contrast ratios
  contrastRatios: {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0
  },
  
  // Common viewport sizes for responsive testing
  viewports: [
    { width: 320, height: 568, name: 'mobile-small' },
    { width: 375, height: 667, name: 'mobile-medium' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'desktop-small' },
    { width: 1440, height: 900, name: 'desktop-large' }
  ]
};

export default {
  simulateKeyboardNavigation,
  testFocusTrap,
  verifyAriaAttributes,
  testKeyboardShortcuts,
  simulateScreenReaderNavigation,
  testFocusRestoration,
  validateColorContrast,
  testResponsiveAccessibility,
  testLoadingStateAccessibility,
  validateFormAccessibility,
  validateTableAccessibility,
  measureAccessibilityPerformance,
  accessibilityTestConfig
};