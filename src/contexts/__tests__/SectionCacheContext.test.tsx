import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { SectionCacheProvider, useSectionCache, SectionData } from '../SectionCacheContext';
import React from 'react';

const mockGetToken = vi.fn();

// Test component that uses the context
function TestConsumer({ sectionId }: { sectionId: string }) {
	const { getSection } = useSectionCache();
	const [section, setSection] = React.useState<SectionData | null>(null);
	const [loading, setLoading] = React.useState(false);

	const handleFetch = async () => {
		setLoading(true);
		const data = await getSection(sectionId, mockGetToken);
		setSection(data);
		setLoading(false);
	};

	return (
		<div>
			<button onClick={handleFetch}>Fetch Section</button>
			<span data-testid="loading">{String(loading)}</span>
			<span data-testid="section-name">{section?.section_name || 'No section'}</span>
			<span data-testid="section-unit">{section?.unit || 'No unit'}</span>
		</div>
	);
}

describe('SectionCacheContext', () => {
	const mockSectionData: SectionData = {
		section_id: 'unit1-section1',
		club: 'Cubbies',
		book_number: 1,
		book_name: 'Apple Seed',
		unit: 'Unit 1',
		section: '1',
		section_name: 'Creation',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should provide getSection function', () => {
		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit1-section1" />
			</SectionCacheProvider>
		);

		expect(screen.getByText('Fetch Section')).toBeInTheDocument();
	});

	it('should fetch and return section data', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockSectionData),
		});
		global.fetch = mockFetch;

		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit1-section1" />
			</SectionCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('section-name').textContent).toBe('Creation');
		});
	});

	it('should cache section data and not refetch', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockSectionData),
		});
		global.fetch = mockFetch;

		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit1-section1" />
			</SectionCacheProvider>
		);

		// First fetch
		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('section-name').textContent).toBe('Creation');
		});

		// Second fetch - should use cache
		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		// Should still only have called fetch once
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it('should return null when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit1-section1" />
			</SectionCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('section-name').textContent).toBe('No section');
		});
	});

	it('should return null when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 404,
		});
		global.fetch = mockFetch;

		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit1-section1" />
			</SectionCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('section-name').textContent).toBe('No section');
		});
	});

	it('should throw error when used outside provider', () => {
		const originalError = console.error;
		console.error = () => {};

		expect(() => {
			render(<TestConsumer sectionId="unit1-section1" />);
		}).toThrow('useSectionCache must be used within a SectionCacheProvider');

		console.error = originalError;
	});

	it('should call API with correct headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockSectionData),
		});
		global.fetch = mockFetch;

		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit2-section3" />
			</SectionCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/section-info'),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer mock-token',
						'section-id': 'unit2-section3',
					}),
				})
			);
		});
	});

	it('should return unit data correctly', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ ...mockSectionData, unit: 'Unit 3' }),
		});
		global.fetch = mockFetch;

		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit3-section1" />
			</SectionCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('section-unit').textContent).toBe('Unit 3');
		});
	});

	it('should handle network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		render(
			<SectionCacheProvider>
				<TestConsumer sectionId="unit1-section1" />
			</SectionCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Section').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('section-name').textContent).toBe('No section');
		});
	});
});
