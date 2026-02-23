import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GlobalAppDataProvider, useGlobalAppData } from '../globalAppContext';

// Test component that uses the context
function TestConsumer() {
	const {
		orgId,
		setOrgId,
		techId,
		setTechId,
		clubberInfoRefreshTrigger,
		setClubberInfoRefreshTrigger,
	} = useGlobalAppData();

	return (
		<div>
			<span data-testid="org-id">{orgId}</span>
			<span data-testid="tech-id">{techId}</span>
			<span data-testid="refresh-trigger">{String(clubberInfoRefreshTrigger)}</span>
			<button onClick={() => setOrgId('new-org-id')}>Set Org ID</button>
			<button onClick={() => setTechId('new-tech-id')}>Set Tech ID</button>
			<button onClick={() => setClubberInfoRefreshTrigger((prev) => !prev)}>
				Toggle Refresh
			</button>
		</div>
	);
}

describe('GlobalAppContext', () => {
	it('should provide default values', () => {
		render(
			<GlobalAppDataProvider>
				<TestConsumer />
			</GlobalAppDataProvider>
		);

		expect(screen.getByTestId('org-id').textContent).toBe('');
		expect(screen.getByTestId('tech-id').textContent).toBe('');
		expect(screen.getByTestId('refresh-trigger').textContent).toBe('false');
	});

	it('should update orgId', () => {
		render(
			<GlobalAppDataProvider>
				<TestConsumer />
			</GlobalAppDataProvider>
		);

		act(() => {
			screen.getByText('Set Org ID').click();
		});

		expect(screen.getByTestId('org-id').textContent).toBe('new-org-id');
	});

	it('should update techId', () => {
		render(
			<GlobalAppDataProvider>
				<TestConsumer />
			</GlobalAppDataProvider>
		);

		act(() => {
			screen.getByText('Set Tech ID').click();
		});

		expect(screen.getByTestId('tech-id').textContent).toBe('new-tech-id');
	});

	it('should toggle clubberInfoRefreshTrigger', () => {
		render(
			<GlobalAppDataProvider>
				<TestConsumer />
			</GlobalAppDataProvider>
		);

		expect(screen.getByTestId('refresh-trigger').textContent).toBe('false');

		act(() => {
			screen.getByText('Toggle Refresh').click();
		});

		expect(screen.getByTestId('refresh-trigger').textContent).toBe('true');

		act(() => {
			screen.getByText('Toggle Refresh').click();
		});

		expect(screen.getByTestId('refresh-trigger').textContent).toBe('false');
	});

	it('should throw error when used outside provider', () => {
		// Suppress console.error for this test
		const originalError = console.error;
		console.error = () => {};

		expect(() => {
			render(<TestConsumer />);
		}).toThrow('useGlobalAppData must be used within a GlobalAppDataProvider');

		console.error = originalError;
	});

	it('should allow multiple children', () => {
		render(
			<GlobalAppDataProvider>
				<div>Child 1</div>
				<div>Child 2</div>
				<TestConsumer />
			</GlobalAppDataProvider>
		);

		expect(screen.getByText('Child 1')).toBeInTheDocument();
		expect(screen.getByText('Child 2')).toBeInTheDocument();
	});
});
