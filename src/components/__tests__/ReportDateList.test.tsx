import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportDateList from '../ReportDateList';
import { DayReportsData } from '../../hooks/useReports';

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

describe('ReportDateList', () => {
	const mockOnDateSelect = vi.fn();
	const mockData: DayReportsData = {
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
				'report-2': {
					person_id: 456,
					progress_id: 2,
					section_id: 'unit1-section2',
					completed_dt: '1705300900000',
					reviewer_id: 'reviewer-2',
					book_id: 2,
					current_team: 'blue',
				},
			},
			scores: {
				red: 5,
				blue: 3,
				green: 7,
				yellow: 2,
			},
		},
		'2024-01-14': {
			reports: {
				'report-3': {
					person_id: 789,
					progress_id: 3,
					section_id: 'unit2-section1',
					completed_dt: '1705214400000',
					reviewer_id: 'reviewer-1',
					book_id: 1,
					current_team: 'green',
				},
			},
			scores: {
				red: 2,
				blue: 4,
				green: 6,
				yellow: 8,
			},
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render "Reports" heading', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		expect(screen.getByText('Reports')).toBeInTheDocument();
	});

	it('should render all dates', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		expect(screen.getByText('2024-01-15')).toBeInTheDocument();
		expect(screen.getByText('2024-01-14')).toBeInTheDocument();
	});

	it('should show entry count for each date', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		expect(screen.getByText('2 entries')).toBeInTheDocument();
		expect(screen.getByText('1 entries')).toBeInTheDocument();
	});

	it('should expand date when clicked', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		// Initially no scores visible
		expect(screen.queryByText('View Details')).not.toBeInTheDocument();

		// Click to expand
		fireEvent.click(screen.getByText('2024-01-15'));

		// Should show View Details button
		expect(screen.getByText('View Details')).toBeInTheDocument();
	});

	it('should show scores when expanded', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		fireEvent.click(screen.getByText('2024-01-15'));

		// Should show team scores with display formatting
		expect(screen.getByText('Red')).toBeInTheDocument();
		expect(screen.getByText('Blue')).toBeInTheDocument();
		expect(screen.getByText('Green')).toBeInTheDocument();
		expect(screen.getByText('Yellow')).toBeInTheDocument();
	});

	it('should show "No Team" when scores include no_team', () => {
		const dataWithNoTeam: DayReportsData = {
			'2024-01-15': {
				reports: {},
				scores: { red: 1, blue: 0, green: 0, yellow: 0, no_team: 4 },
			},
		};
		render(<ReportDateList data={dataWithNoTeam} onDateSelect={mockOnDateSelect} />);

		fireEvent.click(screen.getByText('2024-01-15'));

		expect(screen.getByText('No Team')).toBeInTheDocument();
		expect(screen.getByText('4')).toBeInTheDocument();
	});

	it('should call onDateSelect when View Details is clicked', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		// Expand the date
		fireEvent.click(screen.getByText('2024-01-15'));

		// Click View Details
		fireEvent.click(screen.getByText('View Details'));

		expect(mockOnDateSelect).toHaveBeenCalledWith('2024-01-15');
	});

	it('should collapse when clicking expanded date again', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		// Expand
		fireEvent.click(screen.getByText('2024-01-15'));
		expect(screen.getByText('View Details')).toBeInTheDocument();

		// Collapse
		fireEvent.click(screen.getByText('2024-01-15'));
		expect(screen.queryByText('View Details')).not.toBeInTheDocument();
	});

	it('should only expand one date at a time', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		// Expand first date
		fireEvent.click(screen.getByText('2024-01-15'));
		expect(screen.getAllByText('View Details')).toHaveLength(1);

		// Expand second date (should collapse first)
		fireEvent.click(screen.getByText('2024-01-14'));
		expect(screen.getAllByText('View Details')).toHaveLength(1);
	});

	it('should handle empty data', () => {
		render(<ReportDateList data={{}} onDateSelect={mockOnDateSelect} />);

		expect(screen.getByText('Reports')).toBeInTheDocument();
		expect(screen.queryByText('entries')).not.toBeInTheDocument();
	});

	it('should sort dates in reverse order (newest first)', () => {
		render(<ReportDateList data={mockData} onDateSelect={mockOnDateSelect} />);

		const dates = screen.getAllByText(/2024-01-1/);
		// First date should be 2024-01-15 (newest)
		expect(dates[0].textContent).toBe('2024-01-15');
	});
});
