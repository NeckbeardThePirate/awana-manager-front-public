import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReports, DayReportsData } from '../useReports';

describe('useReports', () => {
	const mockGetToken = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	const mockReportsData: DayReportsData = {
		'2024-01-15': {
			reports: {
				'report-1': {
					person_id: 123,
					progress_id: 1,
					section_id: 'unit1-section1',
					completed_dt: '1705300800000',
					reviewer_id: 'reviewer-1',
					book_id: 1,
					current_team: 'red',
				},
			},
			scores: {
				red: 5,
				blue: 3,
				green: 7,
				yellow: 2,
			},
		},
	};

	it('should start with loading state', () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ dayReports: {} }),
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useReports(mockGetToken));

		expect(result.current.loading).toBe(true);
		expect(result.current.data).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it('should fetch and return reports data', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ dayReports: mockReportsData }),
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual(mockReportsData);
		expect(result.current.error).toBeNull();
	});

	it('should set error when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const { result } = renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('No auth token available');
		expect(result.current.data).toBeNull();
	});

	it('should set error when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 500,
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toContain('Failed to fetch reports');
		expect(result.current.data).toBeNull();
	});

	it('should handle network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		const { result } = renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Network error');
		expect(result.current.data).toBeNull();
	});

	it('should provide refetch function', async () => {
		const mockFetch = vi.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ dayReports: mockReportsData }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					dayReports: {
						'2024-01-16': {
							reports: {},
							scores: { red: 10, blue: 10, green: 10, yellow: 10 },
						},
					},
				}),
			});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual(mockReportsData);

		// Trigger refetch
		await result.current.refetch();

		await waitFor(() => {
			expect(result.current.data).toHaveProperty('2024-01-16');
		});
	});

	it('should call API with correct headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ dayReports: {} }),
		});
		global.fetch = mockFetch;

		renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalled();
		});

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/all-reports'),
			expect.objectContaining({
				method: 'GET',
				headers: expect.objectContaining({
					Authorization: 'Bearer mock-token',
				}),
			})
		);
	});

	it('should handle empty reports response', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ dayReports: {} }),
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual({});
		expect(result.current.error).toBeNull();
	});

	it('should correctly parse report data structure', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ dayReports: mockReportsData }),
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useReports(mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		const report = result.current.data?.['2024-01-15']?.reports?.['report-1'];
		expect(report).toBeDefined();
		expect(report?.person_id).toBe(123);
		expect(report?.current_team).toBe('red');
		expect(result.current.data?.['2024-01-15']?.scores.red).toBe(5);
	});
});
