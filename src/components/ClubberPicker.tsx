import { useState } from 'react';
import ClubberInfo from './ClubberInfo';

export interface ClubberUserData {
	person_id: number;
	first_name: string;
	last_name: string;
	club_id: number | null;
	gender: string;
	book_id: string;
	team: string;
}

interface ClubberPickerProps {
	onClubberSelect: (clubber: string) => void;
	clubbers: Array<ClubberUserData>;
}

function ClubberPicker({ onClubberSelect, clubbers }: ClubberPickerProps) {
	const [clubberPicked, setClubberPicked] = useState<boolean>(false);
	const [clubberInfo, setClubberInfo] = useState<ClubberUserData>()

	return (
		<div className='h-full w-full p-3 sm:p-4 md:p-6 flex flex-col gap-3 overflow-y-auto max-h-screen'>
			<div className='w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3'>
				{clubbers.map((clubber) => (
					<button
						key={clubber.person_id}
						onClick={() => {
							setClubberPicked(true);
							setClubberInfo(clubber);
							onClubberSelect(String(clubber.person_id));
						}}
						className='rounded-2xl border border-gray-600/30 bg-gray-800/40 backdrop-blur-xl shadow-lg p-4 sm:p-5 text-left transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-500/50 hover:shadow-xl'>
						<span className='text-lg sm:text-xl font-semibold text-gray-100'>
							{clubber.first_name + ' ' + clubber.last_name}
						</span>
					</button>
				))}
			</div>
			{clubberPicked && clubberInfo ? (
				<div>
					<ClubberInfo
						clubberInfo={clubberInfo}
					/>
				</div>
			) : (
				<></>
			)}
		</div>
	);
}

export default ClubberPicker;
