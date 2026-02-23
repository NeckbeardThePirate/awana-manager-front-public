import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClubPicker from '../ClubPicker';

describe('ClubPicker', () => {
	const mockOnClubSelect = vi.fn();
	const mockSelectPoints = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render all club buttons', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		expect(screen.getByText('Cubbies')).toBeInTheDocument();
		expect(screen.getByText('Sparks')).toBeInTheDocument();
		expect(screen.getByText('T&T')).toBeInTheDocument();
		expect(screen.getByText('Trek')).toBeInTheDocument();
		expect(screen.getByText('Unassigned')).toBeInTheDocument();
	});

	it('should render Reports button', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		expect(screen.getByText('Reports')).toBeInTheDocument();
	});

	it('should call onClubSelect when Cubbies is clicked', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		fireEvent.click(screen.getByText('Cubbies'));

		expect(mockOnClubSelect).toHaveBeenCalledWith('Cubbies');
	});

	it('should call onClubSelect when Sparks is clicked', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		fireEvent.click(screen.getByText('Sparks'));

		expect(mockOnClubSelect).toHaveBeenCalledWith('Sparks');
	});

	it('should call onClubSelect when T&T is clicked', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		fireEvent.click(screen.getByText('T&T'));

		expect(mockOnClubSelect).toHaveBeenCalledWith('T&T');
	});

	it('should call onClubSelect when Trek is clicked', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		fireEvent.click(screen.getByText('Trek'));

		expect(mockOnClubSelect).toHaveBeenCalledWith('Trek');
	});

	it('should call onClubSelect when Unassigned is clicked', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		fireEvent.click(screen.getByText('Unassigned'));

		expect(mockOnClubSelect).toHaveBeenCalledWith('Unassigned');
	});

	it('should call selectPoints with true when Reports is clicked', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		fireEvent.click(screen.getByText('Reports'));

		expect(mockSelectPoints).toHaveBeenCalledWith(true);
	});

	it('should not call onClubSelect when Reports is clicked', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		fireEvent.click(screen.getByText('Reports'));

		expect(mockOnClubSelect).not.toHaveBeenCalled();
	});

	it('should render with correct styling classes', () => {
		render(
			<ClubPicker onClubSelect={mockOnClubSelect} selectPoints={mockSelectPoints} />
		);

		const buttons = screen.getAllByRole('button');
		buttons.forEach((button) => {
			expect(button).toHaveClass('rounded-2xl');
		});
	});
});
