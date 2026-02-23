export function formatTeamDisplayName(teamKey: string): string {
	if (teamKey === 'no_team') return 'No Team';
	return teamKey.charAt(0).toUpperCase() + teamKey.slice(1).toLowerCase();
}
