import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportEntries from '../ReportEntries';
import { DayReport } from '../../hooks/useReports';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
	}),
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

describe('ReportEntries', () => {
	const mockReports: Record<string, DayReport> = {
		'report-1': {
			person_id: 123,
			progress_id: 1,
			section_id: 'unit1-section1',
			completed_dt: '1705300800000',
			reviewer_id: 'reviewer-1',
			book_id: 1,
			current_team: 'red',
		},
		'report-2': {
			person_id: 456,
			progress_id: 2,
			section_id: 'unit1-section2',
			completed_dt: '1705300900000',
			reviewer_id: 'reviewer-2',
			book_id: 2,
			current_team: 'blue',
		},
	};

	it('should render "Entries:" heading', () => {
		render(<ReportEntries reports={mockReports} />);

		expect(screen.getByText('Entries:')).toBeInTheDocument();
	});

	it('should render a card for each report', () => {
		render(<ReportEntries reports={mockReports} />);

		// Each report should show Loading... or some content
		const loadingElements = screen.getAllByText('Loading...');
		expect(loadingElements.length).toBeGreaterThan(0);
	});

	it('should handle empty reports', () => {
		render(<ReportEntries reports={{}} />);

		expect(screen.getByText('Entries:')).toBeInTheDocument();
		// No loading elements when there are no reports
		expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
	});

	it('should handle single report', () => {
		const singleReport: Record<string, DayReport> = {
			'report-1': mockReports['report-1'],
		};

		render(<ReportEntries reports={singleReport} />);

		expect(screen.getByText('Entries:')).toBeInTheDocument();
	});

	it('should render with correct styling', () => {
		render(<ReportEntries reports={mockReports} />);

		const container = screen.getByText('Entries:').parentElement;
		expect(container).toHaveClass('space-y-2');
	});
});
