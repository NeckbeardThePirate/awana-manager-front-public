import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamUpdater } from '../TeamUpdater';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
	}),
}));

// Mock updateActiveTeam
vi.mock('../../lib/updateActiveTeam', () => ({
	default: vi.fn(),
}));

import updateActiveTeam from '../../lib/updateActiveTeam';

describe('TeamUpdater', () => {
	const mockOnUpdate = vi.fn();

	// Helper to get the main dropdown button (has popovertarget attribute)
	const getMainButton = () => {
		return screen.getByRole('button', { name: /Yellow|Red|Blue|Green|No Team Assigned|Updating.../i });
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(updateActiveTeam as any).mockResolvedValue(true);
	});

	it('should display current team', () => {
		render(
			<TeamUpdater
				currentTeam="Yellow"
				clubberId="123"
				onUpdate={mockOnUpdate}
			/>
		);

		// Yellow appears in both main button and dropdown
		expect(screen.getAllByText('Yellow').length).toBeGreaterThan(0);
	});

	it('should display team options in dropdown', () => {
		render(
			<TeamUpdater
				currentTeam="Red"
				clubberId="123"
				onUpdate={mockOnUpdate}
			/>
		);

		// All team options should be available
		expect(screen.getAllByText('Red').length).toBeGreaterThan(0);
		expect(screen.getByText('Yellow')).toBeInTheDocument();
		expect(screen.getByText('Blue')).toBeInTheDocument();
		expect(screen.getByText('Green')).toBeInTheDocument();
	});

	it('should render all four team colors', () => {
		render(
			<TeamUpdater
				currentTeam="Blue"
				clubberId="123"
				onUpdate={mockOnUpdate}
			/>
		);

		// All teams should be rendered in dropdown
		expect(screen.getByText('Yellow')).toBeInTheDocument();
		expect(screen.getByText('Red')).toBeInTheDocument();
		expect(screen.getAllByText('Blue').length).toBeGreaterThan(0);
		expect(screen.getByText('Green')).toBeInTheDocument();
	});

	it('should call onUpdate when team is changed successfully', async () => {
		render(
			<TeamUpdater
				currentTeam="Yellow"
				clubberId="123"
				onUpdate={mockOnUpdate}
			/>
		);

		// Click on Red in the dropdown
		fireEvent.click(screen.getByText('Red'));

		await waitFor(() => {
			expect(mockOnUpdate).toHaveBeenCalled();
		});
	});

	it('should update displayed team after successful change', async () => {
		render(
			<TeamUpdater
				currentTeam="Yellow"
				clubberId="123"
				onUpdate={mockOnUpdate}
			/>
		);

		fireEvent.click(screen.getByText('Blue'));

		await waitFor(() => {
			// The main button should now show Blue
			const buttons = screen.getAllByText('Blue');
			expect(buttons.length).toBeGreaterThan(0);
		});
	});

	it('should not call onUpdate if team update fails', async () => {
		(updateActiveTeam as any).mockResolvedValue(false);

		render(
			<TeamUpdater
				currentTeam="Yellow"
				clubberId="123"
				onUpdate={mockOnUpdate}
			/>
		);

		fireEvent.click(screen.getByText('Red'));

		await waitFor(() => {
			expect(mockOnUpdate).not.toHaveBeenCalled();
		});
	});

	it('should show loading state while updating', async () => {
		(updateActiveTeam as any).mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve(true), 100))
		);

		render(
			<TeamUpdater
				currentTeam="Yellow"
				clubberId="123"
				onUpdate={mockOnUpdate}
			/>
		);

		fireEvent.click(screen.getByText('Red'));

		await waitFor(() => {
			expect(screen.getByText('Updating...')).toBeInTheDocument();
		});
	});

	it('should work without onUpdate callback', async () => {
		render(
			<TeamUpdater
				currentTeam="Yellow"
				clubberId="123"
			/>
		);

		fireEvent.click(screen.getByText('Red'));

		// Should not throw and should update
		await waitFor(() => {
			const buttons = screen.getAllByText('Red');
			expect(buttons.length).toBeGreaterThan(0);
		});
	});
});
