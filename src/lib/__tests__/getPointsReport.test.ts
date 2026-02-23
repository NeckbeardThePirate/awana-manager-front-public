import { describe, it, expect, vi, beforeEach } from 'vitest';
import getPointsReport from '../getPointsReport';

describe('getPointsReport', () => {
	const mockGetToken = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should successfully fetch points report with teamsResponse format', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				teamsResponse: { red: 10, yellow: 20, blue: 15, green: 25 },
			}),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toEqual([
			{ team: 'red', points: 10 },
			{ team: 'yellow', points: 20 },
			{ team: 'blue', points: 15 },
			{ team: 'green', points: 25 },
			{ team: 'no_team', points: 0 },
		]);
	});

	it('should handle array teams format', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				teams: [
					{ team: 'red', points: 5 },
					{ team: 'blue', points: 10 },
				],
			}),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toEqual([
			{ team: 'red', points: 5 },
			{ team: 'blue', points: 10 },
		]);
	});

	it('should handle direct array response', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve([
				{ team: 'red', points: 7 },
				{ team: 'green', points: 12 },
			]),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toEqual([
			{ team: 'red', points: 7 },
			{ team: 'green', points: 12 },
		]);
	});

	it('should handle root level team keys format', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				red: 3,
				yellow: 6,
				blue: 9,
				green: 12,
			}),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toEqual([
			{ team: 'red', points: 3 },
			{ team: 'yellow', points: 6 },
			{ team: 'blue', points: 9 },
			{ team: 'green', points: 12 },
		]);
	});

	it('should default missing team points to 0', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				teamsResponse: { red: 10, green: 25 }, // missing yellow and blue
			}),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toContainEqual({ team: 'yellow', points: 0 });
		expect(result).toContainEqual({ team: 'blue', points: 0 });
	});

	it('should include no_team in teamsResponse format', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				teamsResponse: { red: 5, yellow: 0, blue: 2, green: 1, no_team: 7 },
			}),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toContainEqual({ team: 'no_team', points: 7 });
	});

	it('should return null when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const result = await getPointsReport(mockGetToken);

		expect(mockGetToken).toHaveBeenCalledTimes(1);
		expect(result).toBeNull();
	});

	it('should return null when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 500,
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toBeNull();
	});

	it('should handle network errors gracefully', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toBeNull();
	});

	it('should include authorization token in headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ teamsResponse: {} }),
		});
		global.fetch = mockFetch;

		await getPointsReport(mockGetToken);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/points-report'),
			expect.objectContaining({
				method: 'GET',
				headers: expect.objectContaining({
					Authorization: 'Bearer mock-token',
				}),
			})
		);
	});

	it('should return null for empty response without team data', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({}),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toBeNull();
	});

	it('should handle nested points object format', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				red: { points: 15 },
				blue: { points: 20 },
			}),
		});
		global.fetch = mockFetch;

		const result = await getPointsReport(mockGetToken);

		expect(result).toContainEqual({ team: 'red', points: 15 });
		expect(result).toContainEqual({ team: 'blue', points: 20 });
	});
});
