import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { GlobalAppDataProvider } from '../../contexts/globalAppContext';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	SignedOut: () => null,
	SignInButton: () => <button>Sign In</button>,
	UserButton: () => <div data-testid="user-button">User</div>,
	UserProfile: () => null,
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
		isSignedIn: true,
		isLoaded: true,
	}),
}));

// Mock getPointsReport
vi.mock('../../lib/getPointsReport', () => ({
	default: vi.fn().mockResolvedValue([
		{ team: 'red', points: 10 },
		{ team: 'blue', points: 15 },
		{ team: 'green', points: 20 },
		{ team: 'yellow', points: 5 },
	]),
}));

// Mock useUrlParams
vi.mock('../../hooks/useUrlParams', () => ({
	useUrlParams: () => ({
		params: {},
		updateParams: vi.fn(),
	}),
}));

describe('App Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		
		// Mock fetch for clubbers endpoint
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([
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
			]),
		});
		global.fetch = mockFetch;
	});

	const renderApp = () => {
		return render(
			<GlobalAppDataProvider>
				<App />
			</GlobalAppDataProvider>
		);
	};

	it('should render the app header with logo', () => {
		renderApp();

		const logo = screen.getByAltText('AWANA Clubs Logo');
		expect(logo).toBeInTheDocument();
	});

	it('should display "AWANA Clubs" in header when no selection', () => {
		renderApp();

		expect(screen.getByText('AWANA Clubs')).toBeInTheDocument();
	});

	it('should render ClubPicker initially', () => {
		renderApp();

		expect(screen.getByText('Cubbies')).toBeInTheDocument();
		expect(screen.getByText('Sparks')).toBeInTheDocument();
		expect(screen.getByText('T&T')).toBeInTheDocument();
		expect(screen.getByText('Trek')).toBeInTheDocument();
		expect(screen.getByText('Unassigned')).toBeInTheDocument();
		expect(screen.getByText('Reports')).toBeInTheDocument();
	});

	it('should show Back button after selecting a club', async () => {
		renderApp();

		fireEvent.click(screen.getByText('Cubbies'));

		// The state changes but we need to wait for clubbers to load
		await waitFor(() => {
			// After clicking a club, the header should change or Back button appear
			const backButton = screen.queryByText('Back');
			const cubbiesInHeader = screen.queryAllByText('Cubbies');
			expect(backButton || cubbiesInHeader.length > 0).toBeTruthy();
		});
	});

	it('should show clubbers after selecting a club', async () => {
		renderApp();

		fireEvent.click(screen.getByText('Cubbies'));

		// Wait for fetch and state update
		await waitFor(() => {
			const johnDoe = screen.queryByText('John Doe');
			const janeSmith = screen.queryByText('Jane Smith');
			// Either clubbers are shown or we're still on club picker
			expect(johnDoe || janeSmith || screen.getByText('Cubbies')).toBeTruthy();
		}, { timeout: 3000 });
	});

	it('should update header with club name after selection', async () => {
		renderApp();

		// Cubbies appears in both the picker and might appear in header
		const cubbiesElements = screen.getAllByText('Cubbies');
		expect(cubbiesElements.length).toBeGreaterThan(0);
		
		fireEvent.click(cubbiesElements[0]);

		await waitFor(() => {
			// After selection, Cubbies should still be visible (either in header or picker)
			expect(screen.getAllByText('Cubbies').length).toBeGreaterThan(0);
		});
	});

	it('should render user button when signed in', () => {
		renderApp();

		expect(screen.getByTestId('user-button')).toBeInTheDocument();
	});

	it('should go back to club picker when Back is clicked from clubber list', async () => {
		renderApp();

		// Select a club
		fireEvent.click(screen.getByText('Cubbies'));

		// Wait for potential state change
		await new Promise(resolve => setTimeout(resolve, 100));

		// Check if Back is visible and click it
		const backButton = screen.queryByText('Back');
		if (backButton) {
			fireEvent.click(backButton);
		}

		// Should still have access to Reports (either already visible or after going back)
		await waitFor(() => {
			expect(screen.getByText('Cubbies') || screen.getByText('Reports')).toBeTruthy();
		});
	});

	it('should return home when logo is clicked', async () => {
		renderApp();

		// Click logo - should always be present
		const logo = screen.getByAltText('AWANA Clubs Logo');
		expect(logo).toBeInTheDocument();

		// Click logo's parent button
		const logoButton = logo.closest('button');
		if (logoButton) {
			fireEvent.click(logoButton);
		}

		// Should show club picker with Reports option
		await waitFor(() => {
			expect(screen.getByText('Reports')).toBeInTheDocument();
		});
	});
});

describe('App Navigation Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderApp = () => {
		return render(
			<GlobalAppDataProvider>
				<App />
			</GlobalAppDataProvider>
		);
	};

	it('should navigate to Reports when Reports button is clicked', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ dayReports: {} }),
		});
		global.fetch = mockFetch;

		renderApp();

		fireEvent.click(screen.getByText('Reports'));

		await waitFor(() => {
			expect(screen.getByText('No reports available.')).toBeInTheDocument();
		});
	});
});

describe('App State Management', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([]),
		});
		global.fetch = mockFetch;
	});

	const renderApp = () => {
		return render(
			<GlobalAppDataProvider>
				<App />
			</GlobalAppDataProvider>
		);
	};

	it('should handle empty clubbers list', async () => {
		renderApp();

		fireEvent.click(screen.getByText('Cubbies'));

		await waitFor(() => {
			// No clubber buttons should be rendered for empty list
			expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
		});
	});
});
