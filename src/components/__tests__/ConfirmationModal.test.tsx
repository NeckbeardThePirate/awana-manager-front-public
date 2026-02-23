import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from '../ConfirmationModal';

describe('ConfirmationModal', () => {
	const mockOnConfirm = vi.fn();
	const mockOnCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		document.body.style.overflow = 'unset';
	});

	it('should render nothing when isOpen is false', () => {
		render(
			<ConfirmationModal
				isOpen={false}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
		expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
	});

	it('should render modal content when isOpen is true', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByText('Test Title')).toBeInTheDocument();
		expect(screen.getByText('Test Message')).toBeInTheDocument();
	});

	it('should render Cancel and Confirm buttons', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByText('Cancel')).toBeInTheDocument();
		expect(screen.getByText('Confirm')).toBeInTheDocument();
	});

	it('should call onConfirm when Confirm button is clicked', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		fireEvent.click(screen.getByText('Confirm'));

		expect(mockOnConfirm).toHaveBeenCalledTimes(1);
	});

	it('should call onCancel when Cancel button is clicked', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		fireEvent.click(screen.getByText('Cancel'));

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it('should call onCancel when backdrop is clicked', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		// Click on the backdrop (first div with fixed inset-0)
		const backdrop = document.querySelector('.bg-black\\/50');
		if (backdrop) {
			fireEvent.click(backdrop);
		}

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it('should call onCancel when Escape key is pressed', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		fireEvent.keyDown(document, { key: 'Escape' });

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it('should not call onCancel when other keys are pressed', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		fireEvent.keyDown(document, { key: 'Enter' });
		fireEvent.keyDown(document, { key: 'a' });

		expect(mockOnCancel).not.toHaveBeenCalled();
	});

	it('should set body overflow to hidden when open', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(document.body.style.overflow).toBe('hidden');
	});

	it('should reset body overflow when closed', () => {
		const { rerender } = render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(document.body.style.overflow).toBe('hidden');

		rerender(
			<ConfirmationModal
				isOpen={false}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(document.body.style.overflow).toBe('unset');
	});

	it('should display custom title and message', () => {
		render(
			<ConfirmationModal
				isOpen={true}
				title="Mark Section Incomplete"
				message='Are you sure you want to mark "Section 1" - "Creation" as incomplete?'
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByText('Mark Section Incomplete')).toBeInTheDocument();
		expect(
			screen.getByText('Are you sure you want to mark "Section 1" - "Creation" as incomplete?')
		).toBeInTheDocument();
	});

	it('should clean up event listener on unmount', () => {
		const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

		const { unmount } = render(
			<ConfirmationModal
				isOpen={true}
				title="Test Title"
				message="Test Message"
				onConfirm={mockOnConfirm}
				onCancel={mockOnCancel}
			/>
		);

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
		removeEventListenerSpy.mockRestore();
	});
});
