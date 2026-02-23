interface ClubPickerProps {
	onClubSelect: (club: string) => void;
	selectPoints: (on: boolean) => void
}

function ClubPicker({ onClubSelect, selectPoints }: ClubPickerProps) {
	// This needs to be made dynamic based on the db
	const clubs = [
		// 'Puggles',
		'Cubbies',
		'Sparks Boys',
		'Sparks Girls',
		'T&T Boys',
		'T&T Girls',
		'Trek',
		'Unassigned',
	];

	return (
		<div className='h-full w-full p-3 sm:p-4 md:p-6 flex flex-col gap-3 overflow-y-auto'>
			<div className='w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3'>
				{clubs.map((club) => (
					<button
						key={club}
						onClick={() => onClubSelect(club)}
						className='rounded-2xl border border-gray-600/30 bg-gray-800/40 backdrop-blur-xl shadow-lg p-4 sm:p-5 text-left transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-500/50 hover:shadow-xl'>
						<span className='text-lg sm:text-xl font-semibold text-gray-100'>
							{club}
						</span>
					</button>
				))}
				<button className='rounded-2xl border border-gray-600/30 bg-gray-800/40 backdrop-blur-xl shadow-lg p-4 sm:p-5 text-left transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-500/50 hover:shadow-xl'
					onClick={() => {
						selectPoints(true)
					}}>
					<span className='text-lg sm:text-xl font-semibold text-gray-100'>
						Reports

					</span>
				</button>
			</div>
		</div>
	);
}

export default ClubPicker;
