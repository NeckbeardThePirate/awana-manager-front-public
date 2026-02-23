import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ClubberCacheProvider, useClubberCache } from '../ClubberCacheContext';
import { ClubberUserData } from '../../components/ClubberPicker';
import React from 'react';

const mockGetToken = vi.fn();

// Test component that uses the context
function TestConsumer({ personId }: { personId: number }) {
	const { getClubber } = useClubberCache();
	const [clubber, setClubber] = React.useState<ClubberUserData | null>(null);
	const [loading, setLoading] = React.useState(false);

	const handleFetch = async () => {
		setLoading(true);
		const data = await getClubber(personId, mockGetToken);
		setClubber(data);
		setLoading(false);
	};

	return (
		<div>
			<button onClick={handleFetch}>Fetch Clubber</button>
			<span data-testid="loading">{String(loading)}</span>
			<span data-testid="clubber-name">
				{clubber ? `${clubber.first_name} ${clubber.last_name}` : 'No clubber'}
			</span>
			<span data-testid="clubber-team">{clubber?.team || 'No team'}</span>
		</div>
	);
}

describe('ClubberCacheContext', () => {
	const mockClubberData: ClubberUserData = {
		person_id: 123,
		first_name: 'John',
		last_name: 'Doe',
		club_id: 2,
		gender: 'Male',
		book_id: '1',
		team: 'Yellow',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue('mock-token');
	});

	it('should provide getClubber function', () => {
		render(
			<ClubberCacheProvider>
				<TestConsumer personId={123} />
			</ClubberCacheProvider>
		);

		expect(screen.getByText('Fetch Clubber')).toBeInTheDocument();
	});

	it('should fetch and return clubber data', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockClubberData),
		});
		global.fetch = mockFetch;

		render(
			<ClubberCacheProvider>
				<TestConsumer personId={123} />
			</ClubberCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Clubber').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('clubber-name').textContent).toBe('John Doe');
		});
	});

	it('should cache clubber data and not refetch', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockClubberData),
		});
		global.fetch = mockFetch;

		render(
			<ClubberCacheProvider>
				<TestConsumer personId={123} />
			</ClubberCacheProvider>
		);

		// First fetch
		await act(async () => {
			screen.getByText('Fetch Clubber').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('clubber-name').textContent).toBe('John Doe');
		});

		// Second fetch - should use cache
		await act(async () => {
			screen.getByText('Fetch Clubber').click();
		});

		// Should still only have called fetch once
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it('should return null when token is not available', async () => {
		mockGetToken.mockResolvedValue(null);

		render(
			<ClubberCacheProvider>
				<TestConsumer personId={123} />
			</ClubberCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Clubber').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('clubber-name').textContent).toBe('No clubber');
		});
	});

	it('should return null when request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: false,
			status: 404,
		});
		global.fetch = mockFetch;

		render(
			<ClubberCacheProvider>
				<TestConsumer personId={123} />
			</ClubberCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Clubber').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('clubber-name').textContent).toBe('No clubber');
		});
	});

	it('should throw error when used outside provider', () => {
		const originalError = console.error;
		console.error = () => {};

		expect(() => {
			render(<TestConsumer personId={123} />);
		}).toThrow('useClubberCache must be used within a ClubberCacheProvider');

		console.error = originalError;
	});

	it('should return team data correctly', async () => {
		const mockFetch = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ ...mockClubberData, team: 'Red' }),
		});
		global.fetch = mockFetch;

		render(
			<ClubberCacheProvider>
				<TestConsumer personId={123} />
			</ClubberCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Clubber').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('clubber-team').textContent).toBe('Red');
		});
	});

	it('should handle network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
		global.fetch = mockFetch;

		render(
			<ClubberCacheProvider>
				<TestConsumer personId={123} />
			</ClubberCacheProvider>
		);

		await act(async () => {
			screen.getByText('Fetch Clubber').click();
		});

		await waitFor(() => {
			expect(screen.getByTestId('clubber-name').textContent).toBe('No clubber');
		});
	});
});
