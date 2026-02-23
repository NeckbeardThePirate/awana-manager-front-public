import { describe, it, expect, vi, beforeEach } from 'vitest';
import getUpdatedClubberData from '../getUpdatedClubberData';

describe('getUpdatedClubberData', () => {
	const mockGetToken = vi.fn();
	const clubberId = '123';

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	const mockClubberData = {
		person_id: 123,
		first_name: 'John',
		last_name: 'Doe',
		club_id: 2,
		gender: 'Male',
		book_id: '1',
		team: 'Yellow',
	};

	it('should successfully fetch clubber data', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockClubberData),
		});
		global.fetch = mockFetch;

		const result = await getUpdatedClubberData(clubberId, mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/single-clubber'),
			expect.objectContaining({
				headers: expect.objectContaining({
					'clubber-id': clubberId,
				}),
			})
		);
		expect(result).toEqual(mockClubberData);
	});

	it('should return null when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const result = await getUpdatedClubberData(clubberId, mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBeNull();
	});

	it('should return null when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 404,
		});
		global.fetch = mockFetch;

		const result = await getUpdatedClubberData(clubberId, mockGetToken);

		expect(result).toBeNull();
	});

	it('should throw error on network failure', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		await expect(getUpdatedClubberData(clubberId, mockGetToken)).rejects.toThrow('Error updating clubbers');
	});

	it('should include authorization token in headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockClubberData),
		});
		global.fetch = mockFetch;

		await getUpdatedClubberData(clubberId, mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer mock-token',
				}),
			})
		);
	});

	it('should fetch different clubbers by ID', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ ...mockClubberData, person_id: 456 }),
		});
		global.fetch = mockFetch;

		const result = await getUpdatedClubberData('456', mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					'clubber-id': '456',
				}),
			})
		);
		expect(result?.person_id).toBe(456);
	});

	it('should return complete clubber data structure', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockClubberData),
		});
		global.fetch = mockFetch;

		const result = await getUpdatedClubberData(clubberId, mockGetToken);

		expect(result).toHaveProperty('person_id');
		expect(result).toHaveProperty('first_name');
		expect(result).toHaveProperty('last_name');
		expect(result).toHaveProperty('club_id');
		expect(result).toHaveProperty('gender');
		expect(result).toHaveProperty('book_id');
		expect(result).toHaveProperty('team');
	});
});
