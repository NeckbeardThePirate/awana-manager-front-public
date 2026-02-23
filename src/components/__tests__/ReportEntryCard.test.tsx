import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ReportEntryCard from '../ReportEntryCard';
import { DayReport } from '../../hooks/useReports';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
	}),
}));

// Mock the cache contexts
const mockGetClubber = vi.fn();
const mockGetBook = vi.fn();
const mockGetSection = vi.fn();
const mockGetReviewer = vi.fn();

vi.mock('../../contexts/ClubberCacheContext', () => ({
	useClubberCache: () => ({
		getClubber: mockGetClubber,
	}),
}));

vi.mock('../../contexts/BookCacheContext', () => ({
	useBookCache: () => ({
		getBook: mockGetBook,
	}),
}));

vi.mock('../../contexts/SectionCacheContext', () => ({
	useSectionCache: () => ({
		getSection: mockGetSection,
	}),
}));

vi.mock('../../contexts/ReviewerCacheContext', () => ({
	useReviewerCache: () => ({
		getReviewer: mockGetReviewer,
	}),
}));

describe('ReportEntryCard', () => {
	const mockReport: DayReport = {
		person_id: 123,
		progress_id: 1,
		section_id: 'unit1-section1',
		completed_dt: '1705300800000',
		reviewer_id: 'reviewer-1',
		book_id: 1,
		current_team: 'red',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetClubber.mockResolvedValue(null);
		mockGetBook.mockResolvedValue(null);
		mockGetSection.mockResolvedValue(null);
		mockGetReviewer.mockResolvedValue(null);
	});

	it('should show loading state initially', () => {
		render(<ReportEntryCard report={mockReport} />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('should display clubber name when data loads', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});
	});

	it('should display clubber gender and team', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Male/)).toBeInTheDocument();
			expect(screen.getByText(/Red Team/)).toBeInTheDocument();
		});
	});

	it('should display "No Team" when clubber has no_team', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'Jane',
			last_name: 'Smith',
			gender: 'Female',
			team: 'no_team',
		});

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
			expect(screen.getByText(/No Team/)).toBeInTheDocument();
			expect(screen.queryByText(/no_team Team/)).not.toBeInTheDocument();
		});
	});

	it('should display section name when available', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});
		mockGetSection.mockResolvedValue({
			section_id: 'unit1-section1',
			section_name: 'Creation',
			unit: 'Unit 1',
		});

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Creation/)).toBeInTheDocument();
		});
	});

	it('should display book name when available', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});
		mockGetBook.mockResolvedValue({
			book_id: 1,
			book: 'Apple Seed',
		});

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Apple Seed/)).toBeInTheDocument();
		});
	});

	it('should display reviewer name when available', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});
		mockGetReviewer.mockResolvedValue({
			reviewer_id: 'reviewer-1',
			first_name: 'Jane',
			last_name: 'Smith',
			email: 'jane@example.com',
		});

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Reviewed by: Jane Smith/)).toBeInTheDocument();
		});
	});

	it('should display fallback when clubber data is not available', async () => {
		mockGetClubber.mockResolvedValue(null);

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Person #123/)).toBeInTheDocument();
		});
	});

	it('should display section ID when section name is not available', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});
		mockGetSection.mockResolvedValue(null);

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Section: unit1-section1/)).toBeInTheDocument();
		});
	});

	it('should display book ID when book name is not available', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});
		mockGetBook.mockResolvedValue(null);

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Book #1/)).toBeInTheDocument();
		});
	});

	it('should display reviewer ID when reviewer data is not available', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});
		mockGetReviewer.mockResolvedValue(null);

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Reviewed by: reviewer-1/)).toBeInTheDocument();
		});
	});

	it('should display completed date', async () => {
		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});

		render(<ReportEntryCard report={mockReport} />);

		await waitFor(() => {
			expect(screen.getByText(/Completed:/)).toBeInTheDocument();
		});
	});

	it('should handle report with no reviewer_id', async () => {
		const reportWithoutReviewer: DayReport = {
			...mockReport,
			reviewer_id: '',
		};

		mockGetClubber.mockResolvedValue({
			person_id: 123,
			first_name: 'John',
			last_name: 'Doe',
			gender: 'Male',
			team: 'Red',
		});

		render(<ReportEntryCard report={reportWithoutReviewer} />);

		await waitFor(() => {
			expect(screen.getByText(/Reviewed by: Unknown/)).toBeInTheDocument();
		});
	});
});
