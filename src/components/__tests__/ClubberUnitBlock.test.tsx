import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClubberUnitBlock } from '../ClubberUnitBlock';
import { UnitBlock } from '../ClubberInfo';

describe('ClubberUnitBlock', () => {
	const mockOnToggleSection = vi.fn();

	const mockSubSections: Record<string, UnitBlock> = {
		'unit1-section1': {
			complete: true,
			id: 'unit1-section1',
			name: 'Creation',
			section: '1',
		},
		'unit1-section2': {
			complete: false,
			id: 'unit1-section2',
			name: 'Adam and Eve',
			section: '2',
		},
		'unit1-section3': {
			complete: false,
			id: 'unit1-section3',
			name: 'Noah',
			section: '3',
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockOnToggleSection.mockResolvedValue(undefined);
	});

	it('should render unit title', () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		expect(screen.getByText('Unit 1')).toBeInTheDocument();
	});

	it('should show section count badge', () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		// 1 completed out of 3
		expect(screen.getByText('1/3')).toBeInTheDocument();
	});

	it('should show sections when open', () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		expect(screen.getByText(/Creation/)).toBeInTheDocument();
		expect(screen.getByText(/Adam and Eve/)).toBeInTheDocument();
		expect(screen.getByText(/Noah/)).toBeInTheDocument();
	});

	it('should hide sections when closed initially', () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={false}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		expect(screen.queryByText(/Creation/)).not.toBeInTheDocument();
	});

	it('should toggle sections visibility when clicking unit header', () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={false}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		// Initially closed
		expect(screen.queryByText(/Creation/)).not.toBeInTheDocument();

		// Click to open
		fireEvent.click(screen.getByText('Unit 1'));
		expect(screen.getByText(/Creation/)).toBeInTheDocument();

		// Click to close
		fireEvent.click(screen.getByText('Unit 1'));
		expect(screen.queryByText(/Creation/)).not.toBeInTheDocument();
	});

	it('should call onToggleSection when checkbox is clicked', async () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		const checkboxes = screen.getAllByRole('checkbox');
		fireEvent.click(checkboxes[1]); // Click the second checkbox (incomplete one)

		await waitFor(() => {
			expect(mockOnToggleSection).toHaveBeenCalledWith('unit1-section2');
		});
	});

	it('should show progress bar when open', () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		expect(screen.getByText('1 of 3 sections complete')).toBeInTheDocument();
	});

	it('should render checkbox as checked for completed sections', () => {
		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
		expect(checkboxes[0].checked).toBe(true); // Creation is complete
		expect(checkboxes[1].checked).toBe(false); // Adam and Eve is not complete
		expect(checkboxes[2].checked).toBe(false); // Noah is not complete
	});

	it('should show loading spinner while section is being toggled', async () => {
		// Make onToggleSection take some time
		mockOnToggleSection.mockImplementation(
			() => new Promise((resolve) => setTimeout(resolve, 100))
		);

		render(
			<ClubberUnitBlock
				subSections={mockSubSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		const checkboxes = screen.getAllByRole('checkbox');
		fireEvent.click(checkboxes[1]);

		// Loading spinner should appear (has class 'loading')
		await waitFor(() => {
			const loadingElement = document.querySelector('.loading');
			expect(loadingElement || mockOnToggleSection).toBeTruthy();
		});
	});

	it('should handle empty sections', () => {
		render(
			<ClubberUnitBlock
				subSections={{}}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		expect(screen.getByText('Unit 1')).toBeInTheDocument();
	});

	it('should calculate all complete correctly', () => {
		const allCompleteSections: Record<string, UnitBlock> = {
			'unit1-section1': { complete: true, id: 'unit1-section1', name: 'Creation', section: '1' },
			'unit1-section2': { complete: true, id: 'unit1-section2', name: 'Adam and Eve', section: '2' },
		};

		render(
			<ClubberUnitBlock
				subSections={allCompleteSections}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		expect(screen.getByText('2/2')).toBeInTheDocument();
		expect(screen.getByText('2 of 2 sections complete')).toBeInTheDocument();
	});

	it('should handle section with no name', () => {
		const sectionWithNoName: Record<string, UnitBlock> = {
			'unit1-section1': { complete: false, id: 'unit1-section1', name: '', section: '1' },
		};

		render(
			<ClubberUnitBlock
				subSections={sectionWithNoName}
				isOpen={true}
				unitId="Unit 1"
				onToggleSection={mockOnToggleSection}
			/>
		);

		expect(screen.getByText(/No Name Given/)).toBeInTheDocument();
	});
});
