import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMemoizedComponent,
  shallowEqual,
  deepEqual,
  measurePerformance,
  createMemoizedSelector,
} from '../performance';
import React from 'react';

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('shallowEqual', () => {
    it('should return true for objects with same properties', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for objects with different properties', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 4 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different number of properties', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2, c: 3 };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for nested objects with same structure but different references', () => {
      const obj1 = { a: 1, b: { nested: true } };
      const obj2 = { a: 1, b: { nested: true } };
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('deepEqual', () => {
    it('should return true for identical primitive values', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('test', 'test')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
    });

    it('should return false for different primitive values', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('test', 'other')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
    });

    it('should return true for deeply nested objects with same structure and values', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 3 } } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for deeply nested objects with different values', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 4 } } };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(null, {})).toBe(false);
    });
  });

  describe('measurePerformance', () => {
    it('should measure execution time and log to console', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockFn = vi.fn();

      measurePerformance('test-operation', mockFn);

      expect(mockFn).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/test-operation took \d+(\.\d+)? milliseconds/)
      );

      consoleSpy.mockRestore();
    });

    it('should execute the provided function', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockFn = vi.fn(() => 'result');

      measurePerformance('test', mockFn);

      expect(mockFn).toHaveBeenCalledOnce();
      consoleSpy.mockRestore();
    });
  });

  describe('createMemoizedSelector', () => {
    it('should return cached result for same input', () => {
      const expensiveOperation = vi.fn((input: number) => input * 2);
      const selector = createMemoizedSelector(expensiveOperation);

      const result1 = selector(5);
      const result2 = selector(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveOperation).toHaveBeenCalledOnce();
    });

    it('should recalculate for different input', () => {
      const expensiveOperation = vi.fn((input: number) => input * 2);
      const selector = createMemoizedSelector(expensiveOperation);

      const result1 = selector(5);
      const result2 = selector(10);

      expect(result1).toBe(10);
      expect(result2).toBe(20);
      expect(expensiveOperation).toHaveBeenCalledTimes(2);
    });

    it('should use custom equality function', () => {
      const expensiveOperation = vi.fn((input: { value: number }) => input.value * 2);
      const customEqual = (a: { value: number }, b: { value: number }) => a.value === b.value;
      const selector = createMemoizedSelector(expensiveOperation, customEqual);

      const result1 = selector({ value: 5 });
      const result2 = selector({ value: 5 }); // Different object, same value

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveOperation).toHaveBeenCalledOnce();
    });
  });

  describe('createMemoizedComponent', () => {
    it('should create a memoized React component', () => {
      const TestComponent = ({ value }: { value: number }) => 
        React.createElement('div', null, value);

      const MemoizedComponent = createMemoizedComponent(TestComponent);

      expect(MemoizedComponent).toBeDefined();
      expect(typeof MemoizedComponent).toBe('object'); // React.memo returns an object
    });

    it('should use custom comparison function', () => {
      const TestComponent = ({ value }: { value: number }) => 
        React.createElement('div', null, value);

      const customCompare = (prevProps: any, nextProps: any) => 
        prevProps.value === nextProps.value;

      const MemoizedComponent = createMemoizedComponent(TestComponent, customCompare);

      expect(MemoizedComponent).toBeDefined();
      expect(typeof MemoizedComponent).toBe('object');
    });
  });
});

describe('Performance Utilities Integration', () => {
  it('should work together for complex scenarios', () => {
    // Create a complex data transformation with memoization
    const transformData = createMemoizedSelector(
      (data: Array<{ id: number; name: string }>) => 
        data.map(item => ({ ...item, upperName: item.name.toUpperCase() })),
      (a, b) => deepEqual(a, b) // Use deep equality for array comparison
    );

    const data1 = [{ id: 1, name: 'test' }];
    const data2 = [{ id: 1, name: 'test' }]; // Same content, different reference

    const result1 = transformData(data1);
    const result2 = transformData(data2);

    // Should return cached result due to deep equality
    expect(result1).toBe(result2);
    expect(result1[0].upperName).toBe('TEST');
  });
});