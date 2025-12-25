import '@testing-library/jest-dom';

// Polyfills for jsdom environment used in vitest
if (typeof (window as any).matchMedia !== 'function') {
	(window as any).matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

// getComputedStyle is sometimes used by libraries in tests
if (typeof window.getComputedStyle !== 'function') {
	window.getComputedStyle = (_elt: Element) => ({
		getPropertyValue: (_prop: string) => '',
	} as any);
}

// ResizeObserver is used by Mantine components
if (typeof (window as any).ResizeObserver !== 'function') {
	(window as any).ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
