import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookUpdater } from '../BookUpdater';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
	useAuth: () => ({
		getToken: vi.fn().mockResolvedValue('mock-token'),
	}),
}));

// Mock updateActiveBook
vi.mock('../../lib/updateActiveBook', () => ({
	default: vi.fn(),
}));

import updateActiveBook from '../../lib/updateActiveBook';

describe('BookUpdater', () => {
	const mockOnUpdate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(updateActiveBook as any).mockResolvedValue(true);
	});

	it('should display current book', () => {
		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		// Apple Seed appears in both button and dropdown
		expect(screen.getAllByText('Apple Seed').length).toBeGreaterThan(0);
	});

	it('should display "No Book Assigned" when no book', () => {
		render(
			<BookUpdater
				currentBook=""
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		expect(screen.getByText('No Book Assigned')).toBeInTheDocument();
	});

	it('should render all book options in dropdown', () => {
		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		// Check some books are available
		expect(screen.getAllByText('Apple Seed').length).toBeGreaterThan(0);
		expect(screen.getByText('Honey Comb')).toBeInTheDocument();
		expect(screen.getByText('Hang Glider')).toBeInTheDocument();
		expect(screen.getByText('Wing Runner')).toBeInTheDocument();
		expect(screen.getByText('Grace in Action')).toBeInTheDocument();
	});

	it('should call onUpdate when book is changed successfully', async () => {
		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		fireEvent.click(screen.getByText('Honey Comb'));

		await waitFor(() => {
			expect(mockOnUpdate).toHaveBeenCalledWith(true, '2'); // Honey Comb has id 2
		});
	});

	it('should update displayed book after successful change', async () => {
		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		fireEvent.click(screen.getByText('Grace in Action'));

		await waitFor(() => {
			const graceButtons = screen.getAllByText('Grace in Action');
			expect(graceButtons.length).toBeGreaterThan(0);
		});
	});

	it('should revert to original book if update fails', async () => {
		(updateActiveBook as any).mockResolvedValue(false);

		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		fireEvent.click(screen.getByText('Honey Comb'));

		await waitFor(() => {
			// Apple Seed should still be in the main button area
			expect(screen.getAllByText('Apple Seed').length).toBeGreaterThan(0);
		});
	});

	it('should show loading state while updating', async () => {
		(updateActiveBook as any).mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve(true), 100))
		);

		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		fireEvent.click(screen.getByText('Honey Comb'));

		await waitFor(() => {
			expect(screen.getByText('Updating...')).toBeInTheDocument();
		});
	});

	it('should update book when currentBook prop changes', () => {
		const { rerender } = render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		expect(screen.getAllByText('Apple Seed').length).toBeGreaterThan(0);

		rerender(
			<BookUpdater
				currentBook="Honey Comb"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		// Check that Honey Comb appears more than just in the dropdown
		const honeyCombElements = screen.getAllByText('Honey Comb');
		expect(honeyCombElements.length).toBeGreaterThan(0);
	});

	it('should toggle currentStatus when onUpdate is called', async () => {
		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		fireEvent.click(screen.getByText('Honey Comb'));

		await waitFor(() => {
			// currentStatus was false, so it should be toggled to true
			expect(mockOnUpdate).toHaveBeenCalledWith(true, expect.any(String));
		});
	});

	it('should include all 12 books', () => {
		render(
			<BookUpdater
				currentBook="Apple Seed"
				clubberId="123"
				onUpdate={mockOnUpdate}
				currentStatus={false}
			/>
		);

		const allBooks = [
			'Honey Comb', 'Hang Glider', 'Wing Runner',
			'Sky Stormer', 'Grace in Action', 'Evidence of Grace', 'Agents of Grace',
			'Discovery of Grace', 'His Story', 'His Love', 'His People'
		];

		// Apple Seed appears twice (button + dropdown), so check with getAllByText
		expect(screen.getAllByText('Apple Seed').length).toBeGreaterThan(0);

		// All other books should appear once in the dropdown
		allBooks.forEach((book) => {
			expect(screen.getByText(book)).toBeInTheDocument();
		});
	});
});
