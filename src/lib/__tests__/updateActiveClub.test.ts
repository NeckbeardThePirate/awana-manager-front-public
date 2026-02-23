import { describe, it, expect, vi, beforeEach } from 'vitest';
import updateActiveClub from '../updateActiveClub';

describe('updateActiveClub', () => {
	const mockGetToken = vi.fn();
	const clubberId = '123';

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should successfully update club', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveClub(clubberId, '2', mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/update-clubber-club'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					clubId: '2',
					clubber_id: clubberId,
				}),
			})
		);
		expect(result).toBe(true);
	});

	it('should handle Cubbies club (id: 2)', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveClub(clubberId, '2', mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					clubId: '2',
				}),
			})
		);
		expect(result).toBe(true);
	});

	it('should handle Sparks club (id: 3)', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveClub(clubberId, '3', mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					clubId: '3',
				}),
			})
		);
		expect(result).toBe(true);
	});

	it('should handle T&T club (id: 4)', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveClub(clubberId, '4', mockGetToken);

		expect(result).toBe(true);
	});

	it('should handle Trek club (id: 5)', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveClub(clubberId, '5', mockGetToken);

		expect(result).toBe(true);
	});

	it('should return undefined when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const result = await updateActiveClub(clubberId, '2', mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBeUndefined();
	});

	it('should return undefined when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 500,
		});
		global.fetch = mockFetch;

		const result = await updateActiveClub(clubberId, '2', mockGetToken);

		expect(result).toBeUndefined();
	});

	it('should handle network errors gracefully', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		const result = await updateActiveClub(clubberId, '2', mockGetToken);

		expect(result).toBeUndefined();
	});

	it('should include authorization token in headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		await updateActiveClub(clubberId, '2', mockGetToken);

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
