import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ReviewerCacheProvider, useReviewerCache, ReviewerInfo } from '../ReviewerCacheContext';
import React from 'react';

const mockGetToken = vi.fn();

// Test component that uses the context
function TestConsumer({ reviewerId }: { reviewerId: string }) {
	const { getReviewer } = useReviewerCache();
	const [reviewer, setReviewer] = React.useState<ReviewerInfo | null>(null);
	const [loading, setLoading] = React.useState(false);

	const handleFetch = async () => {
		setLoading(true);
		const data = await getReviewer(reviewerId, mockGetToken);
		setReviewer(data);
		setLoading(false);
	};

	return (
		<div>
			<button onClick={handleFetch}>Fetch Reviewer</button>
			<span data-testid="loading">{String(loading)}</span>
			<span data-testid="reviewer-name">
				{reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : 'No reviewer'}
			</span>
			<span data-testid="reviewer-email">{reviewer?.email || 'No email'}</span>
		</div>
	);
}

describe('ReviewerCacheContext', () => {
	const mockReviewerData: ReviewerInfo = {
		reviewer_id: 'reviewer-123',
		email: 'reviewer@example.com',
		first_name: 'Jane',
		last_name: 'Smith',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should provide getReviewer function', () => {
		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		expect(screen.getByText('Fetch Reviewer')).toBeInTheDocument();
	});

	it('should fetch and return reviewer data', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockReviewerData),
		});
		global.fetch = mockFetch;

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('reviewer-name').textContent).toBe('Jane Smith');
		});
	});

	it('should cache reviewer data and not refetch', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockReviewerData),
		});
		global.fetch = mockFetch;

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		// First fetch
		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('reviewer-name').textContent).toBe('Jane Smith');
		});

		// Second fetch - should use cache
		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		// Should still only have called fetch once
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it('should return null when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('reviewer-name').textContent).toBe('No reviewer');
		});
	});

	it('should return null when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 404,
		});
		global.fetch = mockFetch;

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('reviewer-name').textContent).toBe('No reviewer');
		});
	});

	it('should return null for empty reviewerId', async () => {
		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('reviewer-name').textContent).toBe('No reviewer');
		});
	});

	it('should throw error when used outside provider', () => {
		const originalError = console.error;
		console.error = () => {};

		expect(() => {
			render(<TestConsumer reviewerId="reviewer-123" />);
		}).toThrow('useReviewerCache must be used within a ReviewerCacheProvider');

		console.error = originalError;
	});

	it('should call API with correct headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockReviewerData),
		});
		global.fetch = mockFetch;

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-456" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/reviewer-info'),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer mock-token',
						'reviewer-id': 'reviewer-456',
					}),
				})
			);
		});
	});

	it('should return email data correctly', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockReviewerData),
		});
		global.fetch = mockFetch;

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('reviewer-email').textContent).toBe('reviewer@example.com');
		});
	});

	it('should handle partial response data with defaults', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				reviewer_id: 'reviewer-123',
				// Missing email, first_name, last_name
			}),
		});
		global.fetch = mockFetch;

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			// Should use empty string defaults
			expect(screen.getByTestId('reviewer-name').textContent).toBe(' ');
			expect(screen.getByTestId('reviewer-email').textContent).toBe('No email');
		});
	});

	it('should handle network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		render(
			<ReviewerCacheProvider>
				<TestConsumer reviewerId="reviewer-123" />
			</ReviewerCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Reviewer').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('reviewer-name').textContent).toBe('No reviewer');
		});
	});
});
