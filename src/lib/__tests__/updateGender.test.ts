import { describe, it, expect, vi, beforeEach } from 'vitest';
import updateGender from '../updateGender';

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
	VITE_API_URL: 'http://localhost:3000',
}), { virtual: true });

describe('updateGender', () => {
	const mockGetToken = vi.fn();
	const clubberId = '123';
	const gender = 'Male';

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should successfully update gender', async () => {
		// Mock fetch for this test
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateGender(clubberId, gender, mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBe(true);
	});

	it('should return undefined when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const result = await updateGender(clubberId, gender, mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBeUndefined();
	});

	it('should handle different gender values', async () => {
		// Mock fetch for this test
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateGender(clubberId, 'Female', mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBe(true);
	});
});
