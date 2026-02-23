import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useClubberReport, ClubberReportEntry } from '../useClubberReport';

describe('useClubberReport', () => {
	const mockGetToken = vi.fn();
	const clubberId = 123;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	const mockReportEntries: ClubberReportEntry[] = [
		{
			person_id: 123,
			progress_id: 1,
			section_id: 'unit1-section1',
			completed_dt: '1705300800000', // Jan 15, 2024
			reviewer_id: 'reviewer-1',
			book_id: 1,
			current_team: 'red',
		},
		{
			person_id: 123,
			progress_id: 2,
			section_id: 'unit1-section2',
			completed_dt: '1705300800000', // Same day
			reviewer_id: 'reviewer-1',
			book_id: 1,
			current_team: 'red',
		},
		{
			person_id: 123,
			progress_id: 3,
			section_id: 'unit2-section1',
			completed_dt: '1705387200000', // Jan 16, 2024
			reviewer_id: 'reviewer-2',
			book_id: 1,
			current_team: 'red',
		},
	];

	it('should start with loading state', () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve([]),
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useClubberReport(clubberId, mockGetToken));

		expect(result.current.loading).toBe(true);
		expect(result.current.data).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it('should fetch and group report data by date', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockReportEntries),
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useClubberReport(clubberId, mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).not.toBeNull();
		// Data should be grouped by date - we can't predict exact keys due to locale differences
		expect(Object.keys(result.current.data || {}).length).toBeGreaterThan(0);
		expect(result.current.error).toBeNull();
	});

	it('should set error when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		const { result } = renderHook(() => useClubberReport(clubberId, mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('No auth token available');
		expect(result.current.data).toBeNull();
	});

	it('should set error when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 404,
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useClubberReport(clubberId, mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toContain('Failed to fetch clubber report');
		expect(result.current.data).toBeNull();
	});

	it('should handle network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		const { result } = renderHook(() => useClubberReport(clubberId, mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('Network error');
		expect(result.current.data).toBeNull();
	});

	it('should call API with correct headers including clubber-id', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve([]),
		});
		global.fetch = mockFetch;

		renderHook(() => useClubberReport(clubberId, mockGetToken));

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalled();
		});

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('/clubber-report'),
			expect.objectContaining({
				method: 'GET',
				headers: expect.objectContaining({
					Authorization: 'Bearer mock-token',
					'clubber-id': '123',
				}),
			})
		);
	});

	it('should handle empty response', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve([]),
		});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useClubberReport(clubberId, mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.data).toEqual({});
		expect(result.current.error).toBeNull();
	});

	it('should provide refetch function', async () => {
		const mockFetch = vi.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockReportEntries),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve([]),
			});
		global.fetch = mockFetch;

		const { result } = renderHook(() => useClubberReport(clubberId, mockGetToken));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Initial data should be set
		expect(Object.keys(result.current.data || {}).length).toBeGreaterThan(0);

		// Trigger refetch
		await result.current.refetch();

		await waitFor(() => {
			expect(result.current.data).toEqual({});
		});
	});

	it('should not fetch when clubberId is falsy', async () => {
		const mockFetch = vi.fn();
		global.fetch = mockFetch;

		renderHook(() => useClubberReport(0, mockGetToken));

		// Give it time to potentially make a request
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(mockFetch).not.toHaveBeenCalled();
	});

	it('should refetch when clubberId changes', async () => {
		const mockFetch = vi.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve([mockReportEntries[0]]),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve([mockReportEntries[2]]),
			});
		global.fetch = mockFetch;

		const { result, rerender } = renderHook(
			({ id }) => useClubberReport(id, mockGetToken),
			{ initialProps: { id: 123 } }
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Change clubberId
		rerender({ id: 456 });

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});
	});
});
