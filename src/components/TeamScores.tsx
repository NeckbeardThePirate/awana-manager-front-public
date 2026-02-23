import { formatTeamDisplayName } from "../lib/formatTeamDisplayName"

interface TeamScoresProps {
	scores: Record<string, number>
}

const COLOR_TEAMS = ['red', 'yellow', 'blue', 'green']

function sortTeamEntries(entries: [string, number][]): [string, number][] {
	return [...entries].sort(([a], [b]) => {
		const aIsNoTeam = a === 'no_team'
		const bIsNoTeam = b === 'no_team'
		if (aIsNoTeam && !bIsNoTeam) return 1
		if (!aIsNoTeam && bIsNoTeam) return -1
		if (aIsNoTeam && bIsNoTeam) return 0
		const aIdx = COLOR_TEAMS.indexOf(a)
		const bIdx = COLOR_TEAMS.indexOf(b)
		if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx
		if (aIdx >= 0) return -1
		if (bIdx >= 0) return 1
		return a.localeCompare(b)
	})
}

export default function TeamScores({ scores }: TeamScoresProps) {
	const entries = sortTeamEntries(Object.entries(scores))
	return (
		<div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
			{entries.map(([team, score]) => (
				<div
					key={team}
					className="p-3 rounded-lg text-center font-bold bg-gray-800/80 border border-gray-600/30 backdrop-blur-sm hover:bg-gray-700/80 transition-all duration-200"
				>
					<div className="text-gray-300">{formatTeamDisplayName(team)}</div>
					<div className="text-2xl text-gray-100">{score}</div>
				</div>
			))}
		</div>
	)
}
