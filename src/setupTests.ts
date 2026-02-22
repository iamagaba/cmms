import '@testing-library/jest-dom';

// Import CSS to load theme variables
import './App.css';

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

// ResizeObserver is used by Mantine components
if (typeof (window as any).ResizeObserver !== 'function') {
	(window as any).ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
