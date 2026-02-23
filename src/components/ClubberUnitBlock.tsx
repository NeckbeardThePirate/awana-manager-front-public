import { useState } from 'react';
import { UnitBlock } from './ClubberInfo';

interface UnitBlockProps {
	subSections: Record<string, UnitBlock>;
	isOpen: boolean;
	unitId: string;
	onToggleSection: (sectionId: string) => Promise<void>;
}

export function ClubberUnitBlock({
	subSections,
	isOpen,
	unitId,
	onToggleSection,
}: UnitBlockProps) {
	const [openSection, setOpenSection] = useState<boolean>(isOpen);
	const [loadingUnit, setLoadingUnit] = useState<string>('');

	const completedCount = Object.values(subSections).filter(
		(s) => s.complete
	).length;
	const totalCount = Object.keys(subSections).length;
	const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	return (
		<div className='m-4 p-2 rounded-2xl border border-gray-600/30 bg-gray-800/40 backdrop-blur-xl shadow-lg'>
			<button
				className='flex w-full items-center justify-between px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-700/30 transition-colors'
				onClick={() => {
					setOpenSection(!openSection);
				}}>
				<div className='flex items-center gap-3 flex-1 min-w-0'>
					<h2 className='text-xl sm:text-2xl font-semibold text-gray-100'>
						{unitId}
					</h2>
					{totalCount > 0 && (
						<span className='text-xs font-medium text-gray-400 px-2 py-1 rounded-full bg-gray-700/50'>
							{completedCount}/{totalCount}
						</span>
					)}
				</div>
				<svg
					className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
						openSection ? 'rotate-180' : ''
					}`}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M19 9l-7 7-7-7'
					/>
				</svg>
			</button>

			{openSection && (
				<div className='border-t border-gray-600/30'>
					{/* Progress Bar */}
					{totalCount > 0 && (
						<div className='px-4 sm:px-6 pt-4 pb-3'>
							<div className='w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden'>
								<div
									className='h-full bg-gray-400 rounded-full transition-all duration-300'
									style={{
										width: `${progressPercentage}%`,
									}}
								/>
							</div>
							<p className='text-xs text-gray-400 mt-2'>
								{completedCount} of {totalCount} sections complete
							</p>
						</div>
					)}

					{/* Sections List */}
					<div className='divide-y divide-gray-600/30'>
						{Object.entries(subSections).map(
							([sectionId, sectionData]) => (
								<div
									key={sectionId}
									className='flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-700/20 transition-colors min-h-[60px] sm:min-h-[64px]'>
									<div className='flex-1 min-w-0'>
										<div className='text-sm sm:text-base font-medium text-gray-100 truncate'>
											{sectionData.id} - {sectionData.name ? sectionData.name : 'No Name Given'}
										</div>
									</div>
									<div className='flex items-center gap-2 flex-shrink-0'>
										{loadingUnit === sectionData.id ? (
											<span className='loading loading-spinner loading-sm text-gray-100'></span>
										) : null}
										<label className='cursor-pointer'>
											<input
												type='checkbox'
												checked={sectionData.complete}
												className='toggle toggle-sm toggle-primary'
												onChange={async () => {
													setLoadingUnit(sectionData.id);
													try {
														await onToggleSection(
															sectionData.id
														);
													} finally {
														setLoadingUnit('');
													}
												}}
												aria-label={`${sectionData.section} ${sectionData.name || 'section'} completion status`}
											/>
										</label>
									</div>
								</div>
							)
						)}
					</div>
				</div>
			)}
		</div>
	);
}
