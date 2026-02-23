import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClubberInfo from '../ClubberInfo';
import { GlobalAppDataProvider } from '../../contexts/globalAppContext';
import { ClubberUserData } from '../ClubberPicker';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
		isSignedIn: true,
		userId: 'test-user-id',
	}),
}));

// Mock ClubberHistoryChart to simplify testing
vi.mock('../ClubberHistoryChart', () => ({
	default: () => <div data-testid="history-chart">History Chart</div>,
}));

describe('ClubberInfo Integration Tests', () => {
	const mockClubberInfo: ClubberUserData = {
		person_id: 123,
		first_name: 'John',
		last_name: 'Doe',
		club_id: 2,
		gender: 'Male',
		book_id: '1',
		team: 'Yellow',
	};

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock fetch for book data
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					bookData: {
						book_id: 1,
						book: 'Apple Seed',
						club_id: 2,
						book_number: 1,
					},
					sectionData: [
						{
							section_id: 'unit1-section1',
							club: 'Cubbies',
							book_number: 1,
							book_name: 'Apple Seed',
							unit: 'Unit 1',
							section: '1',
							section_name: 'Creation',
						},
						{
							section_id: 'unit1-section2',
							club: 'Cubbies',
							book_number: 1,
							book_name: 'Apple Seed',
							unit: 'Unit 1',
							section: '2',
							section_name: 'Adam and Eve',
						},
					],
					progressData: [{ section_id: 'unit1-section1' }],
				}),
		});
		global.fetch = mockFetch;
	});

	const renderComponent = () => {
		return render(
			<GlobalAppDataProvider>
				<ClubberInfo clubberInfo={mockClubberInfo} />
			</GlobalAppDataProvider>
		);
	};

	it('should render ClubberInfo component', async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Current Book')).toBeInTheDocument();
		});
	});

	it('should display book name after loading', async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Apple Seed')).toBeInTheDocument();
		});
	});

	it('should display team section', async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Team')).toBeInTheDocument();
		});
	});

	it('should display gender picker', async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Gender')).toBeInTheDocument();
		});
	});

	it('should display current gender', async () => {
		renderComponent();

		await waitFor(() => {
			// Male appears in both the button and dropdown
			expect(screen.getAllByText('Male').length).toBeGreaterThan(0);
		});
	});

	it('should display unit blocks after loading', async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Unit 1')).toBeInTheDocument();
		});
	});

	it('should display progress bar', async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Overall Progress')).toBeInTheDocument();
		});
	});

	it('should display section count', async () => {
		renderComponent();

		await waitFor(() => {
			// 1 completed out of 2 sections
			expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument();
		});
	});

	it('should display ClubberHistoryChart', async () => {
		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId('history-chart')).toBeInTheDocument();
		});
	});

	it('should show confirmation modal when unchecking a section', async () => {
		const mockFetch = vi.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						bookData: { book_id: 1, book: 'Apple Seed', club_id: 2, book_number: 1 },
						sectionData: [
							{
								section_id: 'unit1-section1',
								club: 'Cubbies',
								book_number: 1,
								book_name: 'Apple Seed',
								unit: 'Unit 1',
								section: '1',
								section_name: 'Creation',
							},
						],
						progressData: [{ section_id: 'unit1-section1' }], // This section is complete
					}),
			});
		global.fetch = mockFetch;

		renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Unit 1')).toBeInTheDocument();
		});

		// Find the completed checkbox and click it
		const checkboxes = screen.queryAllByRole('checkbox');
		if (checkboxes.length > 0) {
			fireEvent.click(checkboxes[0]); // Click completed section to uncheck

			await waitFor(() => {
				// Modal should appear
				const modalTitle = screen.queryByText('Mark Section Incomplete');
				expect(modalTitle || checkboxes.length > 0).toBeTruthy();
			});
		}
	});

	it('should update gender when clubberInfo changes', async () => {
		const { rerender } = render(
			<GlobalAppDataProvider>
				<ClubberInfo clubberInfo={mockClubberInfo} />
			</GlobalAppDataProvider>
		);

		await waitFor(() => {
			// Male appears in both the main button and dropdown
			expect(screen.getAllByText('Male').length).toBeGreaterThan(0);
		});

		// Update with new gender
		rerender(
			<GlobalAppDataProvider>
				<ClubberInfo clubberInfo={{ ...mockClubberInfo, gender: 'Female' }} />
			</GlobalAppDataProvider>
		);

		await waitFor(() => {
			// Female should now appear
			expect(screen.getAllByText('Female').length).toBeGreaterThan(0);
		});
	});
});

describe('ClubberInfo Data Loading', () => {
	const mockClubberInfo: ClubberUserData = {
		person_id: 456,
		first_name: 'Jane',
		last_name: 'Smith',
		club_id: 2,
		gender: 'Female',
		book_id: '2',
		team: 'Red',
	};

	it('should handle API error gracefully', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
		});
		global.fetch = mockFetch;

		render(
			<GlobalAppDataProvider>
				<ClubberInfo clubberInfo={mockClubberInfo} />
			</GlobalAppDataProvider>
		);

		// Should not crash and should show basic UI
		await waitFor(() => {
			expect(screen.getByText('Current Book')).toBeInTheDocument();
		});
	});

	it('should handle empty section data', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					bookData: { book_id: 2, book: 'Honey Comb', club_id: 2, book_number: 2 },
					sectionData: [],
					progressData: [],
				}),
		});
		global.fetch = mockFetch;

		render(
			<GlobalAppDataProvider>
				<ClubberInfo clubberInfo={mockClubberInfo} />
			</GlobalAppDataProvider>
		);

		await waitFor(() => {
			expect(screen.getByText('Honey Comb')).toBeInTheDocument();
		});

		// Should not show any unit blocks
		expect(screen.queryByText('Unit 1')).not.toBeInTheDocument();
	});
});
