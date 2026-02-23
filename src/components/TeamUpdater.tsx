import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import updateActiveTeam from '../lib/updateActiveTeam';

interface TeamUpdaterProps {
	clubberId: string;
	currentTeam: string;
	onUpdate?: () => void;
}

export function TeamUpdater({ clubberId, currentTeam, onUpdate }: TeamUpdaterProps) {
	const [clubberTeam, setClubberTeam] = useState<string>(currentTeam);
	const [isLoading, setIsLoading] = useState(false);
	const { getToken } = useAuth();
	const teams = [
		'Yellow',
		'Red',
		'Blue',
		'Green',
	];

	return (
		<>
			<button
				className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-100 bg-gray-700/50 hover:bg-gray-600/60 border border-gray-500/50 rounded-lg transition-all duration-200 backdrop-blur-sm min-w-[120px] ${
					isLoading ? 'opacity-50 cursor-not-allowed' : ''
				}`}
				popoverTarget='popover-team'
				disabled={isLoading}
				style={
					{
						anchorName: '--anchor-team',
					} as React.CSSProperties
				}>
				{isLoading ? (
					<>
						<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Updating...
					</>
				) : (
					clubberTeam ?? 'No Team Assigned'
				)}
			</button>

			<ul
				className='dropdown menu min-w-[120px] rounded-lg bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-xl text-gray-900 font-medium overflow-hidden'
				popover='auto'
				id='popover-team'
				style={
					{
						positionAnchor: '--anchor-team',
					} as React.CSSProperties
				}>
				{teams.map((team) => (
					<li key={team}>
						<button
							className={`hover:bg-gray-100 transition-colors ${
								isLoading ? 'opacity-50 cursor-not-allowed' : ''
							}`}
							disabled={isLoading}
							onClick={async () => {
								setIsLoading(true);
								try {
									const success = await updateActiveTeam(
										clubberId,
										team,
										getToken
									);
									if (success) {
										setClubberTeam(team);
										onUpdate?.();
									}
								} finally {
									setIsLoading(false);
									document.getElementById('popover-team')?.hidePopover();
								}
							}}>
							{team}
						</button>
					</li>
				))}
			</ul>
		</>
	);
}