import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenderPicker } from '../GenderPicker';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
	}),
}));

// Mock updateGender
vi.mock('../../lib/updateGender', () => ({
	default: vi.fn(),
}));

import updateGender from '../../lib/updateGender';

describe('GenderPicker', () => {
	const mockOnUpdate = vi.fn();
	const mockOnGenderChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(updateGender as any).mockResolvedValue(true);
	});

	it('should render gender label', () => {
		render(
			<GenderPicker
				currentGender="Male"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		expect(screen.getByText('Gender')).toBeInTheDocument();
	});

	it('should display current gender', () => {
		render(
			<GenderPicker
				currentGender="Male"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		// Male appears in both button and dropdown
		expect(screen.getAllByText('Male').length).toBeGreaterThan(0);
	});

	it('should display Female gender', () => {
		render(
			<GenderPicker
				currentGender="Female"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		expect(screen.getAllByText('Female').length).toBeGreaterThan(0);
	});

	it('should call onGenderChange when Male is selected', async () => {
		render(
			<GenderPicker
				currentGender="Female"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		// Click Male option in dropdown (second occurrence since dropdown is already rendered)
		const maleButtons = screen.getAllByText('Male');
		fireEvent.click(maleButtons[0]); // Click the dropdown option

		await waitFor(() => {
			expect(mockOnGenderChange).toHaveBeenCalledWith('Male');
		});
	});

	it('should call onGenderChange when Female is selected', async () => {
		render(
			<GenderPicker
				currentGender="Male"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		// Click Female option in dropdown
		const femaleButtons = screen.getAllByText('Female');
		fireEvent.click(femaleButtons[0]);

		await waitFor(() => {
			expect(mockOnGenderChange).toHaveBeenCalledWith('Female');
		});
	});

	it('should call onUpdate after successful gender change', async () => {
		render(
			<GenderPicker
				currentGender="Male"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		const femaleButtons = screen.getAllByText('Female');
		fireEvent.click(femaleButtons[0]);

		await waitFor(() => {
			expect(mockOnUpdate).toHaveBeenCalled();
		});
	});

	it('should not call onGenderChange if update fails', async () => {
		(updateGender as any).mockResolvedValue(false);

		render(
			<GenderPicker
				currentGender="Male"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		const femaleButtons = screen.getAllByText('Female');
		fireEvent.click(femaleButtons[0]);

		await waitFor(() => {
			expect(mockOnGenderChange).not.toHaveBeenCalled();
		});
	});

	it('should show loading state while updating', async () => {
		(updateGender as any).mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve(true), 100))
		);

		render(
			<GenderPicker
				currentGender="Male"
				clubberId="123"
				onUpdate={mockOnUpdate}
				onGenderChange={mockOnGenderChange}
			/>
		);

		const femaleButtons = screen.getAllByText('Female');
		fireEvent.click(femaleButtons[0]);

		await waitFor(() => {
			expect(screen.getByText('Updating...')).toBeInTheDocument();
		});
	});
});
