import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClubberPicker, { ClubberUserData } from '../ClubberPicker';
import { GlobalAppDataProvider } from '../../contexts/globalAppContext';

// Mock the Clerk auth
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
		isSignedIn: true,
		userId: 'test-user-id',
	}),
}));

// Mock ClubberInfo to simplify testing
vi.mock('../ClubberInfo', () => ({
	default: ({ clubberInfo }: { clubberInfo: ClubberUserData }) => (
		<div data-testid="clubber-info">
			Clubber Info: {clubberInfo.first_name} {clubberInfo.last_name}
		</div>
	),
}));

describe('ClubberPicker', () => {
	const mockOnClubberSelect = vi.fn();
	const mockClubbers: ClubberUserData[] = [
		{
			person_id: 1,
			first_name: 'John',
			last_name: 'Doe',
			club_id: 2,
			gender: 'Male',
			book_id: '1',
			team: 'Yellow',
		},
		{
			person_id: 2,
			first_name: 'Jane',
			last_name: 'Smith',
			club_id: 2,
			gender: 'Female',
			book_id: '2',
			team: 'Red',
		},
		{
			person_id: 3,
			first_name: 'Bob',
			last_name: 'Wilson',
			club_id: 2,
			gender: 'Male',
			book_id: '3',
			team: 'Blue',
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderWithProvider = (ui: React.ReactElement) => {
		return render(
			<GlobalAppDataProvider>
				{ui}
			</GlobalAppDataProvider>
		);
	};

	it('should render all clubber buttons', () => {
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={mockClubbers} />
		);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
	});

	it('should call onClubberSelect with person_id when clubber is clicked', () => {
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={mockClubbers} />
		);

		fireEvent.click(screen.getByText('John Doe'));

		expect(mockOnClubberSelect).toHaveBeenCalledWith('1');
	});

	it('should call onClubberSelect with correct ID for different clubbers', () => {
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={mockClubbers} />
		);

		fireEvent.click(screen.getByText('Jane Smith'));

		expect(mockOnClubberSelect).toHaveBeenCalledWith('2');
	});

	it('should show ClubberInfo after selecting a clubber', () => {
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={mockClubbers} />
		);

		fireEvent.click(screen.getByText('John Doe'));

		expect(screen.getByTestId('clubber-info')).toBeInTheDocument();
		expect(screen.getByText('Clubber Info: John Doe')).toBeInTheDocument();
	});

	it('should handle empty clubbers array', () => {
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={[]} />
		);

		// Should not throw and should not have any clubber buttons
		expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
	});

	it('should render buttons with correct styling', () => {
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={mockClubbers} />
		);

		const buttons = screen.getAllByRole('button');
		buttons.forEach((button) => {
			expect(button).toHaveClass('rounded-2xl');
		});
	});

	it('should handle single clubber', () => {
		const singleClubber = [mockClubbers[0]];
		
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={singleClubber} />
		);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
	});

	it('should update ClubberInfo when different clubber is selected', () => {
		renderWithProvider(
			<ClubberPicker onClubberSelect={mockOnClubberSelect} clubbers={mockClubbers} />
		);

		// Select first clubber
		fireEvent.click(screen.getByText('John Doe'));
		expect(screen.getByText('Clubber Info: John Doe')).toBeInTheDocument();

		// Select second clubber
		fireEvent.click(screen.getByText('Jane Smith'));
		expect(screen.getByText('Clubber Info: Jane Smith')).toBeInTheDocument();
	});
});
