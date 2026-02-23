import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

// Mock Clerk authentication
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
		isSignedIn: true,
		userId: 'test-user-id',
	}),
}));

// Mock environment variables
vi.mock('import.meta.env', () => ({
	VITE_API_URL: 'http://localhost:3000',
}), { virtual: true });

// Global test utilities
global.fetch = vi.fn();

// Mock window.confirm for tests
Object.defineProperty(window, 'confirm', {
	writable: true,
	value: vi.fn(() => true),
});

// Mock popover API for tests
Object.defineProperty(HTMLElement.prototype, 'showPopover', {
	writable: true,
	value: vi.fn(),
});

Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
	writable: true,
	value: vi.fn(),
});
