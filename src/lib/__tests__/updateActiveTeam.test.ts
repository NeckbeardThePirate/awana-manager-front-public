import { describe, it, expect, vi, beforeEach } from 'vitest';
import updateActiveTeam from '../updateActiveTeam';

describe('updateActiveTeam', () => {
	const mockGetToken = vi.fn();
	const clubberId = '123';

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should successfully update team to Yellow', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveTeam(clubberId, 'Yellow', mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/update-clubber-team'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					team: 'Yellow',
					clubber_id: clubberId,
				}),
			})
		);
		expect(result).toBe(true);
	});

	it('should successfully update team to Red', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveTeam(clubberId, 'Red', mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					team: 'Red',
				}),
			})
		);
		expect(result).toBe(true);
	});

	it('should successfully update team to Blue', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveTeam(clubberId, 'Blue', mockGetToken);

		expect(result).toBe(true);
	});

	it('should successfully update team to Green', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveTeam(clubberId, 'Green', mockGetToken);

		expect(result).toBe(true);
	});

	it('should return undefined when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const result = await updateActiveTeam(clubberId, 'Yellow', mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBeUndefined();
	});

	it('should return undefined when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 500,
		});
		global.fetch = mockFetch;

		const result = await updateActiveTeam(clubberId, 'Yellow', mockGetToken);

		expect(result).toBeUndefined();
	});

	it('should handle network errors gracefully', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		const result = await updateActiveTeam(clubberId, 'Yellow', mockGetToken);

		expect(result).toBeUndefined();
	});

	it('should include authorization token in headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		await updateActiveTeam(clubberId, 'Yellow', mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer mock-token',
				}),
			})
		);
	});
});
