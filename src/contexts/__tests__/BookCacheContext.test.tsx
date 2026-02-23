import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BookCacheProvider, useBookCache, BookData } from '../BookCacheContext';

const mockGetToken = vi.fn();

// Test component that uses the context
function TestConsumer({ bookId }: { bookId: number }) {
	const { getBook } = useBookCache();
	const [book, setBook] = React.useState<BookData | null>(null);
	const [loading, setLoading] = React.useState(false);

	const handleFetch = async () => {
		setLoading(true);
		const data = await getBook(bookId, mockGetToken);
		setBook(data);
		setLoading(false);
	};

	return (
		<div>
			<button onClick={handleFetch}>Fetch Book</button>
			<span data-testid="loading">{String(loading)}</span>
			<span data-testid="book-name">{book?.book || 'No book'}</span>
			<span data-testid="book-id">{book?.book_id || 'No ID'}</span>
		</div>
	);
}

import React from 'react';

describe('BookCacheContext', () => {
	const mockBookData: BookData = {
		book_id: 1,
		book: 'Apple Seed',
		club_id: 2,
		book_number: 1,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should provide getBook function', () => {
		render(
			<BookCacheProvider>
				<TestConsumer bookId={1} />
			</BookCacheProvider>
		);

		expect(screen.getByText('Fetch Book')).toBeInTheDocument();
	});

	it('should fetch and return book data', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockBookData),
		});
		global.fetch = mockFetch;

		render(
			<BookCacheProvider>
				<TestConsumer bookId={1} />
			</BookCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Book').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('book-name').textContent).toBe('Apple Seed');
		});
	});

	it('should cache book data and not refetch', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockBookData),
		});
		global.fetch = mockFetch;

		render(
			<BookCacheProvider>
				<TestConsumer bookId={1} />
			</BookCacheProvider>
		);

		// First fetch
		await act(async () => {
			screen.getByText('Fetch Book').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('book-name').textContent).toBe('Apple Seed');
		});

		// Second fetch - should use cache
		await act(async () => {
			screen.getByText('Fetch Book').click();
		});

		// Should still only have called fetch once
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it('should return null when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		render(
			<BookCacheProvider>
				<TestConsumer bookId={1} />
			</BookCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Book').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('book-name').textContent).toBe('No book');
		});
	});

	it('should return null when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 404,
		});
		global.fetch = mockFetch;

		render(
			<BookCacheProvider>
				<TestConsumer bookId={1} />
			</BookCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Book').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('book-name').textContent).toBe('No book');
		});
	});

	it('should throw error when used outside provider', () => {
		const originalError = console.error;
		console.error = () => {};

		expect(() => {
			render(<TestConsumer bookId={1} />);
		}).toThrow('useBookCache must be used within a BookCacheProvider');

		console.error = originalError;
	});

	it('should call API with correct headers', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockBookData),
		});
		global.fetch = mockFetch;

		render(
			<BookCacheProvider>
				<TestConsumer bookId={5} />
			</BookCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Book').click();
		});

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/book-info'),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer mock-token',
						'book-id': '5',
					}),
				})
			);
		});
	});

	it('should handle network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		render(
			<BookCacheProvider>
				<TestConsumer bookId={1} />
			</BookCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Book').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('book-name').textContent).toBe('No book');
		});
	});
});
