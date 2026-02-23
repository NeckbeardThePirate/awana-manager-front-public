import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportsViewer from '../ReportsViewer';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
	}),
}));

// Mock useReports hook
vi.mock('../../hooks/useReports', () => ({
	useReports: vi.fn(),
}));

// Mock the cache contexts
vi.mock('../../contexts/ClubberCacheContext', () => ({
	useClubberCache: () => ({
		getClubber: vi.fn().mockResolvedValue(null),
	}),
}));

vi.mock('../../contexts/BookCacheContext', () => ({
	useBookCache: () => ({
		getBook: vi.fn().mockResolvedValue(null),
	}),
}));

vi.mock('../../contexts/SectionCacheContext', () => ({
	useSectionCache: () => ({
		getSection: vi.fn().mockResolvedValue(null),
	}),
}));

vi.mock('../../contexts/ReviewerCacheContext', () => ({
	useReviewerCache: () => ({
		getReviewer: vi.fn().mockResolvedValue(null),
	}),
}));

import { useReports } from '../../hooks/useReports';

describe('ReportsViewer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should show loading spinner when loading', () => {
		(useReports as any).mockReturnValue({
			data: null,
			loading: true,
			error: null,
		});

		render(<ReportsViewer />);

		// Should show loading spinner
		expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
	});

	it('should show error message when there is an error', () => {
		(useReports as any).mockReturnValue({
			data: null,
			loading: false,
			error: 'Failed to fetch reports',
		});

		render(<ReportsViewer />);

		expect(screen.getByText(/Error loading reports/)).toBeInTheDocument();
		expect(screen.getByText(/Failed to fetch reports/)).toBeInTheDocument();
	});

	it('should show "No reports available" when data is empty', () => {
		(useReports as any).mockReturnValue({
			data: {},
			loading: false,
			error: null,
		});

		render(<ReportsViewer />);

		expect(screen.getByText('No reports available.')).toBeInTheDocument();
	});

	it('should show "No reports available" when data is null', () => {
		(useReports as any).mockReturnValue({
			data: null,
			loading: false,
			error: null,
		});

		render(<ReportsViewer />);

		expect(screen.getByText('No reports available.')).toBeInTheDocument();
	});

	it('should render ReportDateList when data is available', () => {
		const mockData = {
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
				scores: { red: 5, blue: 3, green: 7, yellow: 2 },
			},
		};

		(useReports as any).mockReturnValue({
			data: mockData,
			loading: false,
			error: null,
		});

		render(<ReportsViewer />);

		expect(screen.getByText('Reports')).toBeInTheDocument();
		expect(screen.getByText('2024-01-15')).toBeInTheDocument();
	});

	it('should switch to ReportDetails when date is selected', async () => {
		const mockData = {
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
				scores: { red: 5, blue: 3, green: 7, yellow: 2 },
			},
		};

		(useReports as any).mockReturnValue({
			data: mockData,
			loading: false,
			error: null,
		});

		render(<ReportsViewer />);

		// Expand the date
		fireEvent.click(screen.getByText('2024-01-15'));

		// Click View Details
		fireEvent.click(screen.getByText('View Details'));

		await waitFor(() => {
			expect(screen.getByText('Report: 2024-01-15')).toBeInTheDocument();
		});
	});

	it('should go back to date list when back is clicked', async () => {
		const mockData = {
			'2024-01-15': {
				reports: {},
				scores: { red: 0, blue: 0, green: 0, yellow: 0 },
			},
		};

		(useReports as any).mockReturnValue({
			data: mockData,
			loading: false,
			error: null,
		});

		render(<ReportsViewer />);

		// Navigate to details
		fireEvent.click(screen.getByText('2024-01-15'));
		fireEvent.click(screen.getByText('View Details'));

		await waitFor(() => {
			expect(screen.getByText('Report: 2024-01-15')).toBeInTheDocument();
		});

		// Click back
		fireEvent.click(screen.getByText('← Back to dates'));

		await waitFor(() => {
			expect(screen.getByText('Reports')).toBeInTheDocument();
		});
	});
});
