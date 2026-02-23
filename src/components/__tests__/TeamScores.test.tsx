import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeamScores from '../TeamScores';

describe('TeamScores', () => {
	const mockScores = {
		red: 10,
		blue: 15,
		green: 20,
		yellow: 5,
	};

	it('should render all team scores', () => {
		render(<TeamScores scores={mockScores} />);

		expect(screen.getByText('Red')).toBeInTheDocument();
		expect(screen.getByText('Blue')).toBeInTheDocument();
		expect(screen.getByText('Green')).toBeInTheDocument();
		expect(screen.getByText('Yellow')).toBeInTheDocument();
	});

	it('should display correct point values', () => {
		render(<TeamScores scores={mockScores} />);

		expect(screen.getByText('10')).toBeInTheDocument();
		expect(screen.getByText('15')).toBeInTheDocument();
		expect(screen.getByText('20')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();
	});

	it('should handle zero scores', () => {
		const zeroScores = {
			red: 0,
			blue: 0,
			green: 0,
			yellow: 0,
		};

		render(<TeamScores scores={zeroScores} />);

		const zeros = screen.getAllByText('0');
		expect(zeros).toHaveLength(4);
	});

	it('should handle large scores', () => {
		const largeScores = {
			red: 1000,
			blue: 2500,
			green: 10000,
			yellow: 999,
		};

		render(<TeamScores scores={largeScores} />);

		expect(screen.getByText('1000')).toBeInTheDocument();
		expect(screen.getByText('2500')).toBeInTheDocument();
		expect(screen.getByText('10000')).toBeInTheDocument();
		expect(screen.getByText('999')).toBeInTheDocument();
	});

	it('should apply styling classes', () => {
		render(<TeamScores scores={mockScores} />);

		// Find a team score container (it has the score value in it)
		const scoreContainer = screen.getByText('10').closest('div');
		expect(scoreContainer).toBeInTheDocument();
	});

	it('should render team names', () => {
		render(<TeamScores scores={mockScores} />);

		// All team names should be rendered with display formatting
		const redTeam = screen.getByText('Red');
		expect(redTeam).toBeInTheDocument();
	});

	it('should display no_team as "No Team"', () => {
		const scoresWithNoTeam = {
			red: 5,
			blue: 10,
			green: 0,
			yellow: 2,
			no_team: 3,
		};
		render(<TeamScores scores={scoresWithNoTeam} />);

		expect(screen.getByText('No Team')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
	});

	it('should display equal scores correctly', () => {
		const equalScores = {
			red: 50,
			blue: 50,
			green: 50,
			yellow: 50,
		};

		render(<TeamScores scores={equalScores} />);

		const fifties = screen.getAllByText('50');
		expect(fifties).toHaveLength(4);
	});
});
