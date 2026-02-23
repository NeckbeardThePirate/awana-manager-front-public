import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportDetails from '../ReportDetails';
import { ReportBlock } from '../../hooks/useReports';

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

describe('ReportDetails', () => {
	const mockOnBack = vi.fn();
	const mockReportBlock: ReportBlock = {
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
			red: 10,
			blue: 15,
			green: 20,
			yellow: 5,
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render back button', () => {
		render(
			<ReportDetails
				date="2024-01-15"
				reportBlock={mockReportBlock}
				onBack={mockOnBack}
			/>
		);

		expect(screen.getByText('← Back to dates')).toBeInTheDocument();
	});

	it('should render report date in heading', () => {
		render(
			<ReportDetails
				date="2024-01-15"
				reportBlock={mockReportBlock}
				onBack={mockOnBack}
			/>
		);

		expect(screen.getByText('Report: 2024-01-15')).toBeInTheDocument();
	});

	it('should call onBack when back button is clicked', () => {
		render(
			<ReportDetails
				date="2024-01-15"
				reportBlock={mockReportBlock}
				onBack={mockOnBack}
			/>
		);

		fireEvent.click(screen.getByText('← Back to dates'));

		expect(mockOnBack).toHaveBeenCalledTimes(1);
	});

	it('should render TeamScores component', () => {
		render(
			<ReportDetails
				date="2024-01-15"
				reportBlock={mockReportBlock}
				onBack={mockOnBack}
			/>
		);

		// TeamScores should render the team scores with display formatting
		expect(screen.getByText('Red')).toBeInTheDocument();
		expect(screen.getByText('Blue')).toBeInTheDocument();
		expect(screen.getByText('Green')).toBeInTheDocument();
		expect(screen.getByText('Yellow')).toBeInTheDocument();
	});

	it('should render ReportEntries component', () => {
		render(
			<ReportDetails
				date="2024-01-15"
				reportBlock={mockReportBlock}
				onBack={mockOnBack}
			/>
		);

		expect(screen.getByText('Entries:')).toBeInTheDocument();
	});

	it('should display correct scores', () => {
		render(
			<ReportDetails
				date="2024-01-15"
				reportBlock={mockReportBlock}
				onBack={mockOnBack}
			/>
		);

		expect(screen.getByText('10')).toBeInTheDocument();
		expect(screen.getByText('15')).toBeInTheDocument();
		expect(screen.getByText('20')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();
	});

	it('should handle empty reports', () => {
		const emptyReportBlock: ReportBlock = {
			reports: {},
			scores: {
				red: 0,
				blue: 0,
				green: 0,
				yellow: 0,
			},
		};

		render(
			<ReportDetails
				date="2024-01-15"
				reportBlock={emptyReportBlock}
				onBack={mockOnBack}
			/>
		);

		expect(screen.getByText('Report: 2024-01-15')).toBeInTheDocument();
		expect(screen.getByText('Entries:')).toBeInTheDocument();
	});

	it('should handle different date formats', () => {
		render(
			<ReportDetails
				date="January 15, 2024"
				reportBlock={mockReportBlock}
				onBack={mockOnBack}
			/>
		);

		expect(screen.getByText('Report: January 15, 2024')).toBeInTheDocument();
	});
});
