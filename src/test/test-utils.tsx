import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { GlobalAppDataProvider } from '../contexts/globalAppContext';
import { BookCacheProvider } from '../contexts/BookCacheContext';
import { ClubberCacheProvider } from '../contexts/ClubberCacheContext';
import { SectionCacheProvider } from '../contexts/SectionCacheContext';
import { ReviewerCacheProvider } from '../contexts/ReviewerCacheContext';

// Custom render function that includes common providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<GlobalAppDataProvider>
			<BookCacheProvider>
				<ClubberCacheProvider>
					<SectionCacheProvider>
						<ReviewerCacheProvider>
							{children}
						</ReviewerCacheProvider>
					</SectionCacheProvider>
				</ClubberCacheProvider>
			</BookCacheProvider>
		</GlobalAppDataProvider>
	);
};

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories
export const createMockClubberData = (overrides = {}) => ({
	person_id: 123,
	first_name: 'John',
	last_name: 'Doe',
	gender: 'Male',
	team: 'Yellow',
	book_id: '1',
	club_id: 2,
	...overrides,
});

export const createMockBookData = (overrides = {}) => ({
	book_id: 1,
	book: 'Apple Seed',
	club_id: 2,
	book_number: 1,
	...overrides,
});

export const createMockSectionData = (overrides = {}) => ({
	section_id: 'unit1-section1',
	club: 'Cubbies',
	book_number: 1,
	book_name: 'Apple Seed',
	unit: 'Unit 1',
	section: '1',
	section_name: 'Creation',
	...overrides,
});

export const createMockProgressData = (sectionIds: string[] = []) => {
	return sectionIds.map(id => ({ section_id: id }));
};

export const createMockUnitData = (unitId: string, sections: any[] = [], completedSections: string[] = []) => {
	const units: Record<string, any> = {};

	sections.forEach(section => {
		const isComplete = completedSections.includes(section.section_id);
		if (!units[section.unit]) {
			units[section.unit] = {
				allComplete: false,
				units: {},
			};
		}
		units[section.unit].units[section.section_id] = {
			complete: isComplete,
			id: section.section_id,
			section: section.section,
			name: section.section_name,
		};
	});

	// Calculate allComplete for each unit
	Object.values(units).forEach((unit: any) => {
		unit.allComplete = Object.values(unit.units).every((section: any) => section.complete);
	});

	return units;
};

// Mock data for reports
export const createMockDayReport = (overrides = {}) => ({
	person_id: 123,
	progress_id: 1,
	section_id: 'unit1-section1',
	completed_dt: '1705300800000',
	reviewer_id: 'reviewer-1',
	book_id: 1,
	current_team: 'red' as const,
	...overrides,
});

export const createMockReportBlock = (overrides = {}) => ({
	reports: {
		'report-1': createMockDayReport(),
	},
	scores: {
		red: 5,
		blue: 3,
		green: 7,
		yellow: 2,
	},
	...overrides,
});

export const createMockReviewerData = (overrides = {}) => ({
	reviewer_id: 'reviewer-1',
	email: 'reviewer@example.com',
	first_name: 'Test',
	last_name: 'Reviewer',
	...overrides,
});

// Helper to wait for async operations
export const waitForLoadingToFinish = async () => {
	await new Promise((resolve) => setTimeout(resolve, 0));
};
