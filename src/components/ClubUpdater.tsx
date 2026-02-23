import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import updateActiveClub from '../lib/updateActiveClub';

interface ClubUpdaterProps {
	clubberId: string;
	currentClub: string;
}

export function ClubUpdater({ clubberId, currentClub }: ClubUpdaterProps) {
	const [clubberClub, setClubberClub] = useState<string>(currentClub);
	const { getToken } = useAuth();
	const clubs = [
		// { name: 'Puggles', id: 1 }, //some comment
		{ name: 'Cubbies', id: 2 },
		{ name: 'Sparks', id: 3 },
		{ name: 'T&T', id: 4 },
		{ name: 'Trek', id: 5 },
	];

	return (
		<>
			<button
				className='btn btn-outline'
				popoverTarget='popover-club'
				style={
					{
						anchorName: '--anchor-club',
					} as React.CSSProperties
				}>
				{clubberClub ?? 'No Club Assigned'}
			</button>

			<ul
				className='dropdown menu w-32 rounded-box bg-stone-400'
				popover='auto'
				id='popover-club'
				style={
					{
						positionAnchor: '--anchor-club',
					} as React.CSSProperties
				}>
				{clubs.map((club) => (
					<li>
						<button
							onClick={async () => {
								const success = await updateActiveClub(
									clubberId,
									String(club.id),
									getToken
								);
								console.log(club.name)
								console.log(success)
								if (success) setClubberClub(club.name);
								document.getElementById('popover-club')?.hidePopover();
							}}>
							{club.name}
						</button>
					</li>
				))}
			</ul>
		</>
	);
}
