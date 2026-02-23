import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PointsReport from '../PointsReport';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
		isSignedIn: true,
	}),
}));

// Mock getPointsReport
vi.mock('../../lib/getPointsReport', () => ({
	default: vi.fn(),
}));

import getPointsReport from '../../lib/getPointsReport';

describe('PointsReport', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should show loading state initially', () => {
		(getPointsReport as any).mockImplementation(
			() => new Promise(() => {}) // Never resolves
		);

		render(<PointsReport />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('should render Team Points heading after loading', async () => {
		(getPointsReport as any).mockResolvedValue([
			{ team: 'red', points: 10 },
			{ team: 'blue', points: 15 },
			{ team: 'green', points: 20 },
			{ team: 'yellow', points: 5 },
		]);

		render(<PointsReport />);

		await waitFor(() => {
			expect(screen.getByText('Team Points')).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should display all four team scores', async () => {
		(getPointsReport as any).mockResolvedValue([
			{ team: 'red', points: 10 },
			{ team: 'blue', points: 15 },
			{ team: 'green', points: 20 },
			{ team: 'yellow', points: 5 },
		]);

		render(<PointsReport />);

		await waitFor(() => {
			expect(screen.getByText('Red')).toBeInTheDocument();
			expect(screen.getByText('Blue')).toBeInTheDocument();
			expect(screen.getByText('Green')).toBeInTheDocument();
			expect(screen.getByText('Yellow')).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should display correct point values', async () => {
		(getPointsReport as any).mockResolvedValue([
			{ team: 'red', points: 10 },
			{ team: 'blue', points: 15 },
			{ team: 'green', points: 20 },
			{ team: 'yellow', points: 5 },
		]);

		render(<PointsReport />);

		await waitFor(() => {
			expect(screen.getByText('10')).toBeInTheDocument();
			expect(screen.getByText('15')).toBeInTheDocument();
			expect(screen.getByText('20')).toBeInTheDocument();
			expect(screen.getByText('5')).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should show error message when fetch fails', async () => {
		(getPointsReport as any).mockResolvedValue(null);

		render(<PointsReport />);

		await waitFor(() => {
			expect(screen.getByText('Failed to load points data')).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should default missing teams to 0 points', async () => {
		(getPointsReport as any).mockResolvedValue([
			{ team: 'red', points: 10 },
			// Missing blue, green, yellow, no_team - they should default to 0
		]);

		render(<PointsReport />);

		await waitFor(() => {
			// All teams should still be displayed with formatted names
			expect(screen.getByText('Red')).toBeInTheDocument();
			expect(screen.getByText('Blue')).toBeInTheDocument();
			expect(screen.getByText('Green')).toBeInTheDocument();
			expect(screen.getByText('Yellow')).toBeInTheDocument();
		}, { timeout: 3000 });
	});

	it('should sort teams by points descending', async () => {
		(getPointsReport as any).mockResolvedValue([
			{ team: 'red', points: 5 },
			{ team: 'blue', points: 20 },
			{ team: 'green', points: 10 },
			{ team: 'yellow', points: 15 },
		]);

		render(<PointsReport />);

		await waitFor(() => {
			const teamElements = screen.getAllByText(/Red|Blue|Green|Yellow|No Team/);
			// Blue (20) should come first, then Yellow (15), Green (10), Red (5), No Team last
			expect(teamElements[0].textContent).toBe('Blue');
			expect(teamElements[1].textContent).toBe('Yellow');
		}, { timeout: 3000 });
	});

	it('should handle zero points for all teams', async () => {
		(getPointsReport as any).mockResolvedValue([
			{ team: 'red', points: 0 },
			{ team: 'blue', points: 0 },
			{ team: 'green', points: 0 },
			{ team: 'yellow', points: 0 },
		]);

		render(<PointsReport />);

		await waitFor(() => {
			const zeros = screen.getAllByText('0');
			// Five teams: red, yellow, blue, green, no_team
			expect(zeros).toHaveLength(5);
		}, { timeout: 3000 });
	});
});
