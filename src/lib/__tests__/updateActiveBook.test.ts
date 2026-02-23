import { describe, it, expect, vi, beforeEach } from 'vitest';
import updateActiveBook from '../updateActiveBook';

describe('updateActiveBook', () => {
	const mockGetToken = vi.fn();
	const clubberId = '123';
	const bookName = 'Apple Seed';
	const bookId = '1';

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should successfully update book', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveBook(clubberId, bookName, bookId, mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/update-clubber-book'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					bookId: bookId,
					clubber_id: clubberId,
				}),
			})
		);
		expect(result).toBe(true);
	});

	it('should return undefined when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const result = await updateActiveBook(clubberId, bookName, bookId, mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBeUndefined();
	});

	it('should return undefined when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 500,
		});
		global.fetch = mockFetch;

		const result = await updateActiveBook(clubberId, bookName, bookId, mockGetToken);

		expect(result).toBeUndefined();
	});

	it('should handle network errors gracefully', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		const result = await updateActiveBook(clubberId, bookName, bookId, mockGetToken);

		expect(result).toBeUndefined();
	});

	it('should handle different book IDs', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		const result = await updateActiveBook(clubberId, 'Honey Comb', '2', mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					bookId: '2',
				}),
			})
		);
		expect(result).toBe(true);
	});

	it('should include authorization token in headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ success: true }),
		});
		global.fetch = mockFetch;

		await updateActiveBook(clubberId, bookName, bookId, mockGetToken);

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
