import { describe, it, expect } from 'vitest';
import type { SectionData, CompletedSection } from '../ClubberInfo';

// Test data transformation logic that was extracted from ClubberInfo component
describe('Data Transformation Logic', () => {
	const mockSectionData: SectionData[] = [
		{
			id: 'unit1-section1',
			Club: 'Cubbies',
			'Book Number': 1,
			'Book Name': 'Cubbies Handbook',
			Unit: 'Unit 1',
			Section: '1',
			'Section Name': 'Creation',
		},
		{
			id: 'unit1-section2',
			Club: 'Cubbies',
			'Book Number': 1,
			'Book Name': 'Cubbies Handbook',
			Unit: 'Unit 1',
			Section: '2',
			'Section Name': 'Adam and Eve',
		},
		{
			id: 'unit2-section1',
			Club: 'Cubbies',
			'Book Number': 1,
			'Book Name': 'Cubbies Handbook',
			Unit: 'Unit 2',
			Section: '1',
			'Section Name': 'Noah',
		},
	];

	const mockProgressData: CompletedSection[] = [
		{ section_id: 'unit1-section1' }, // Unit 1 Section 1 is complete
	];

	it('should correctly transform section data into unit structure', () => {
		const tempProgress: Record<string, boolean> = {};
		for (const item of mockProgressData) {
			tempProgress[item.section_id] = true;
		}

		const tempCopy: Record<string, any> = {};
		let firstIncomplete = '';

		for (const item of mockSectionData) {
			const isComplete = tempProgress[item.id] === true;
			if (!tempCopy[item.Unit]) {
				tempCopy[item.Unit] = {
					allComplete: isComplete,
					units: {
						[item.id]: {
							complete: isComplete,
							id: item.id,
							section: item.Section,
							name: item['Section Name'],
						},
					},
				};
			} else {
				tempCopy[item.Unit].units[item.id] = {
					complete: isComplete,
					id: item.id,
					section: item.Section,
					name: item['Section Name'],
				};
				tempCopy[item.Unit].allComplete =
					tempCopy[item.Unit].allComplete && isComplete;
			}
			if (
				!tempCopy[item.Unit].allComplete &&
				firstIncomplete === ''
			) {
				firstIncomplete = item.Unit;
			}
		}

		// Verify Unit 1 structure
		expect(tempCopy['Unit 1']).toBeDefined();
		expect(tempCopy['Unit 1'].units['unit1-section1'].complete).toBe(true);
		expect(tempCopy['Unit 1'].units['unit1-section2'].complete).toBe(false);
		expect(tempCopy['Unit 1'].allComplete).toBe(false); // Not all sections complete

		// Verify Unit 2 structure
		expect(tempCopy['Unit 2']).toBeDefined();
		expect(tempCopy['Unit 2'].units['unit2-section1'].complete).toBe(false);
		expect(tempCopy['Unit 2'].allComplete).toBe(false);

		// Verify first incomplete unit
		expect(firstIncomplete).toBe('Unit 1');
	});

	it('should handle empty progress data', () => {
		const emptyProgressData: CompletedSection[] = [];
		const tempProgress: Record<string, boolean> = {};
		for (const item of emptyProgressData) {
			tempProgress[item.section_id] = true;
		}

		const tempCopy: Record<string, any> = {};

		for (const item of mockSectionData) {
			const isComplete = tempProgress[item.id] === true;
			if (!tempCopy[item.Unit]) {
				tempCopy[item.Unit] = {
					allComplete: isComplete,
					units: {
						[item.id]: {
							complete: isComplete,
							id: item.id,
							section: item.Section,
							name: item['Section Name'],
						},
					},
				};
			} else {
				tempCopy[item.Unit].units[item.id] = {
					complete: isComplete,
					id: item.id,
					section: item.Section,
					name: item['Section Name'],
				};
				tempCopy[item.Unit].allComplete =
					tempCopy[item.Unit].allComplete && isComplete;
			}
		}

		// All sections should be marked as incomplete
		expect(tempCopy['Unit 1'].units['unit1-section1'].complete).toBe(false);
		expect(tempCopy['Unit 1'].units['unit1-section2'].complete).toBe(false);
		expect(tempCopy['Unit 2'].units['unit2-section1'].complete).toBe(false);
	});

	it('should handle all sections complete', () => {
		const allCompleteProgressData: CompletedSection[] = [
			{ section_id: 'unit1-section1' },
			{ section_id: 'unit1-section2' },
			{ section_id: 'unit2-section1' },
		];

		const tempProgress: Record<string, boolean> = {};
		for (const item of allCompleteProgressData) {
			tempProgress[item.section_id] = true;
		}

		const tempCopy: Record<string, any> = {};

		for (const item of mockSectionData) {
			const isComplete = tempProgress[item.id] === true;
			if (!tempCopy[item.Unit]) {
				tempCopy[item.Unit] = {
					allComplete: isComplete,
					units: {
						[item.id]: {
							complete: isComplete,
							id: item.id,
							section: item.Section,
							name: item['Section Name'],
						},
					},
				};
			} else {
				tempCopy[item.Unit].units[item.id] = {
					complete: isComplete,
					id: item.id,
					section: item.Section,
					name: item['Section Name'],
				};
				tempCopy[item.Unit].allComplete =
					tempCopy[item.Unit].allComplete && isComplete;
			}
		}

		// All sections should be marked as complete
		expect(tempCopy['Unit 1'].allComplete).toBe(true);
		expect(tempCopy['Unit 2'].allComplete).toBe(true);
	});

	it('should calculate overall progress correctly', () => {
		const unitData = {
			'Unit 1': {
				units: {
					'unit1-section1': { complete: true },
					'unit1-section2': { complete: false },
				},
			},
			'Unit 2': {
				units: {
					'unit2-section1': { complete: false },
				},
			},
		};

		let totalCompleted = 0;
		let totalSections = 0;

		Object.values(unitData).forEach((unitContainer: any) => {
			Object.values(unitContainer.units).forEach((section: any) => {
				totalSections++;
				if (section.complete) {
					totalCompleted++;
				}
			});
		});

		const percentage = totalSections > 0 ? (totalCompleted / totalSections) * 100 : 0;

		expect(totalSections).toBe(3);
		expect(totalCompleted).toBe(1);
		expect(percentage).toBeCloseTo(33.333333333333336, 10);
	});

	it('should handle empty unit data for progress calculation', () => {
		const unitData = {};

		let totalCompleted = 0;
		let totalSections = 0;

		Object.values(unitData).forEach((unitContainer: any) => {
			Object.values(unitContainer.units).forEach((section: any) => {
				totalSections++;
				if (section.complete) {
					totalCompleted++;
				}
			});
		});

		const percentage = totalSections > 0 ? (totalCompleted / totalSections) * 100 : 0;

		expect(totalSections).toBe(0);
		expect(totalCompleted).toBe(0);
		expect(percentage).toBe(0);
	});
});
