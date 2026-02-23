import { useState } from 'react';

function ClubButton(
	setClub: () => void,
	clubName: string
) {
	
	return (
		<button className='bg-neutral-300 h-12 w-22'
		onClick={setClub(clubName)}>
			{clubName}
		</button>
	);
}

export default ClubButton;
