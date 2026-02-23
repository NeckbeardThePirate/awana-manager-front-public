import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import getPointsReport from '../lib/getPointsReport';
import { formatTeamDisplayName } from '../lib/formatTeamDisplayName';

interface TeamPoints {
	team: string;
	points: number;
}

const teamColors: Record<string, { bg: string; text: string; border: string }> = {
	red: {
		bg: 'bg-gray-800/50',
		text: 'text-gray-100',
		border: 'border-gray-600/40',
	},
	yellow: {
		bg: 'bg-gray-800/50',
		text: 'text-gray-100',
		border: 'border-gray-600/40',
	},
	blue: {
		bg: 'bg-gray-800/50',
		text: 'text-gray-100',
		border: 'border-gray-600/40',
	},
	green: {
		bg: 'bg-gray-800/50',
		text: 'text-gray-100',
		border: 'border-gray-600/40',
	},
	no_team: {
		bg: 'bg-gray-800/50',
		text: 'text-gray-100',
		border: 'border-gray-600/40',
	},
};

function PointsReport() {
	const { getToken, isSignedIn } = useAuth();
	const [teamsData, setTeamsData] = useState<TeamPoints[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Refs for adaptive polling
	const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
	const previousDataRef = useRef<string | null>(null);
	const noChangeCountRef = useRef<number>(0);
	const currentIntervalRef = useRef<number>(2000);
	const errorCountRef = useRef<number>(0);
	const isVisibleRef = useRef<boolean>(true);

	// Adaptive interval progression: 2s → 4s → 7s → 10s → 15s
	const INTERVALS = [2000, 4000, 7000, 10000, 15000];
	const POLLS_BEFORE_INCREASE = 3;

	useEffect(() => {
		if (!isSignedIn) {
			return;
		}

		const fetchPoints = async () => {
			// Don't fetch if tab is hidden
			if (!isVisibleRef.current) {
				scheduleFetch();
				return;
			}

			try {
				const data = await getPointsReport(getToken);
				if (data) {
					// Convert data to string for comparison
					const dataString = JSON.stringify(data);
					const hasChanged = previousDataRef.current !== dataString;

					if (hasChanged) {
						// Data changed - update state and reset polling to 2s
						setTeamsData(data);
						setError(null);
						previousDataRef.current = dataString;
						noChangeCountRef.current = 0;
						currentIntervalRef.current = INTERVALS[0]; // Reset to 2s
						errorCountRef.current = 0; // Reset error count on success
					} else {
						// No change detected - increment counter
						noChangeCountRef.current++;
						
						// Check if we should increase the interval
						const thresholdsPassed = Math.floor(noChangeCountRef.current / POLLS_BEFORE_INCREASE);
						const newIntervalIndex = Math.min(thresholdsPassed, INTERVALS.length - 1);
						currentIntervalRef.current = INTERVALS[newIntervalIndex];
					}

					// If this is the first fetch, still set the data
					if (previousDataRef.current === null) {
						setTeamsData(data);
						previousDataRef.current = dataString;
					}
				} else {
					setError('Failed to load points data');
					handleError();
				}
			} catch (err) {
				console.error('Error fetching points:', err);
				setError('Error loading points');
				handleError();
			} finally {
				setIsLoading(false);
			}

			scheduleFetch();
		};

		const handleError = () => {
			// Implement exponential backoff for errors (separate from adaptive polling)
			errorCountRef.current++;
			const errorBackoff = Math.min(errorCountRef.current * 2000, 30000);
			currentIntervalRef.current = Math.max(currentIntervalRef.current, errorBackoff);
		};

		const scheduleFetch = () => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
			timeoutIdRef.current = setTimeout(fetchPoints, currentIntervalRef.current);
		};

		const handleVisibilityChange = () => {
			const isVisible = document.visibilityState === 'visible';
			isVisibleRef.current = isVisible;

			if (isVisible) {
				// Tab became visible - fetch immediately
				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
				}
				fetchPoints();
			} else {
				// Tab became hidden - cancel scheduled fetch
				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
					timeoutIdRef.current = null;
				}
			}
		};

		// Set up visibility change listener
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Initial fetch
		fetchPoints();

		return () => {
			// Cleanup
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [isSignedIn, getToken]);

	if (!isSignedIn) {
		return null;
	}

	// Ensure we have all five teams (including no_team), defaulting to 0 if missing, then sort by points descending with no_team last
	const allTeams = ['red', 'yellow', 'blue', 'green', 'no_team']
		.map((team) => {
			const teamData = teamsData.find((t) => t.team.toLowerCase() === team);
			return {
				team: team,
				points: teamData?.points ?? 0,
			};
		})
		.sort((a, b) => {
			if (a.team === 'no_team' && b.team !== 'no_team') return 1;
			if (a.team !== 'no_team' && b.team === 'no_team') return -1;
			return b.points - a.points;
		});

	return (
		<div className='w-full p-3 sm:p-4 mt-4'>
			<h2 className='text-lg sm:text-xl font-bold text-gray-100 mb-4 text-center'>
				Team Points
			</h2>
			{isLoading && !error ? (
				<div className='text-center text-gray-400 text-sm'>Loading...</div>
			) : error ? (
				<div className='text-center text-gray-400 text-sm'>{error}</div>
			) : (
				<div className='flex justify-center gap-2 max-w-full mx-auto px-2'>
					{allTeams.map((team) => {
						const colors = teamColors[team.team] || {
							bg: 'bg-gray-800/30',
							text: 'text-gray-200',
							border: 'border-gray-500',
						};
						return (
							<div
								key={team.team}
								className={`${colors.bg} ${colors.border} border rounded-lg px-3 py-2 shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:bg-gray-700/60 w-20 sm:w-24`}>
								<div className='text-center'>
									<h3
										className={`${colors.text} text-xs font-semibold mb-1`}>
										{formatTeamDisplayName(team.team)}
									</h3>
									<div
										className={`${colors.text} text-lg sm:text-xl font-bold`}>
										{team.points.toLocaleString()}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default PointsReport;

