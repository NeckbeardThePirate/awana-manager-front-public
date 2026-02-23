interface TeamPoints {
	team: string;
	points: number;
}

interface PointsReportResponse {
	teams?: TeamPoints[];
	teamsResponse?: {
		red?: number;
		yellow?: number;
		blue?: number;
		green?: number;
		no_team?: number;
		[key: string]: number | undefined;
	};
	[key: string]: any; // Allow for other response formats
}

export default async function getPointsReport(
	getToken: () => Promise<string | null>
): Promise<TeamPoints[] | null> {
	try {
		const token = await getToken();
		if (!token) {
			console.error('No auth token available');
			return null;
		}

		const url = import.meta.env.VITE_API_URL + '/points-report';
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			console.error('Failed to fetch points report:', response.status);
			return null;
		}

		const data: PointsReportResponse = await response.json();
		
		console.log('data', data);

		// Handle teamsResponse format: {teamsResponse: {red: 0, blue: 2, yellow: 0, green: 14, no_team: 0}}
		if (data.teamsResponse && typeof data.teamsResponse === 'object') {
			const teams: TeamPoints[] = [];
			const teamNames = ['red', 'yellow', 'blue', 'green', 'no_team'];
			for (const teamName of teamNames) {
				const points = data.teamsResponse[teamName];
				teams.push({
					team: teamName,
					points: typeof points === 'number' ? points : 0,
				});
			}
			return teams;
		}

		// Handle array of team objects format
		if (Array.isArray(data.teams)) {
			return data.teams;
		} else if (Array.isArray(data)) {
			return data;
		} else {
			// If response is an object with team names as keys at root level
			const teams: TeamPoints[] = [];
			const teamNames = ['red', 'yellow', 'blue', 'green', 'no_team'];
			for (const teamName of teamNames) {
				if (data[teamName] !== undefined) {
					teams.push({
						team: teamName,
						points: typeof data[teamName] === 'number' ? data[teamName] : data[teamName].points || 0,
					});
				}
			}
			return teams.length > 0 ? teams : null;
		}
	} catch (error) {
		console.error('Error fetching points report:', error);
		return null;
	}
}

