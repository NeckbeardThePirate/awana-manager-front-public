import { useState, useEffect } from 'react';
import { ClubberUserData } from './ClubberPicker';
import { useAuth } from '@clerk/clerk-react';
import { ClubberUnitBlock } from './ClubberUnitBlock';
import { BookUpdater } from './BookUpdater';
import { ClubUpdater } from './ClubUpdater';
import { TeamUpdater } from './TeamUpdater';
import { GenderPicker } from './GenderPicker';
import { ConfirmationModal } from './ConfirmationModal';
import { useGlobalAppData } from '../contexts/globalAppContext';
import ClubberHistoryChart from './ClubberHistoryChart';

interface ClubberPageProps {
	// onClubberSelect: (clubber: string) => void;
	clubberInfo: ClubberUserData;
}

interface BookData {
	book_id: number;
	book: string;
	club_id: number;
	book_number: number;
}

interface SectionData {
	'section_id': string;
	'club': string;
	'book_number': number;
	'book_name': string;
	'unit': string;
	'section': string;
	'section_name': string;
}

interface UnitContainer {
	units: Record<string, UnitBlock>;
	allComplete: boolean;
}

export interface UnitBlock {
	complete: boolean;
	id: string;
	name: string;
	section: string;
}
interface BookDataResponse {
	bookData: BookData;
	progressData: Array<CompletedSection>;
	sectionData: Array<SectionData>;
}

interface CompletedSection {
	section_id: string;
}

function ClubberInfo({ clubberInfo }: ClubberPageProps) {
	const [bookInfo, setBookInfo] = useState<BookData>();
	const [sectionData, setSectionData] = useState<Array<SectionData>>();
	const [unitData, setUnitData] = useState<Record<string, UnitContainer>>();
	const [completedData, setCompletedData] =
		useState<Record<string, boolean>>();
	const { getToken, isSignedIn, userId } = useAuth();
	const [firstIncomplete, setFirstIncomplete] = useState<string>('');
	const [clubberGender, setClubberGender] = useState<string>(
		clubberInfo.gender
	);
	const [updateBookData, setUpdateBookData] = useState<boolean>(false);
	const [currentBookId, setCurrentBookId] = useState<string | number | null>(
		clubberInfo.book_id
	);

	const { clubberInfoRefreshTrigger, setClubberInfoRefreshTrigger } =
		useGlobalAppData();

	// Update currentBookId when clubberInfo.book_id changes (e.g., when a different clubber is selected)
	useEffect(() => {
		setCurrentBookId(clubberInfo.book_id);
	}, [clubberInfo.book_id]);

	// Sync clubberGender when clubberInfo changes (e.g., after a refresh)
	useEffect(() => {
		setClubberGender(clubberInfo.gender);
	}, [clubberInfo.gender]);

	// Modal state
	const [modalState, setModalState] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
	}>({
		isOpen: false,
		title: '',
		message: '',
		onConfirm: () => {},
	});

	const clubIdMap: Record<string, string> = {
		// '1': 'Puggles',
		'2': 'Cubbies',
		'3': 'Sparks',
		'4': 'T&T',
		'5': 'Trek',
	};

	const handleToggleSection = async (unitId: string, sectionId: string) => {
		if (!unitData) return;

		const currentSection = unitData[unitId]?.units[sectionId];
		if (!currentSection) return;

		const isCurrentlyComplete = currentSection.complete;
		const willBeComplete = !isCurrentlyComplete;

		// If turning OFF (unchecking), show confirmation modal
		if (isCurrentlyComplete && !willBeComplete) {
			setModalState({
				isOpen: true,
				title: 'Mark Section Incomplete',
				message: `Are you sure you want to mark "${
					currentSection.section
				}" - "${
					currentSection.name
						? currentSection.name
						: 'Unnamed Section'
				}" as incomplete?`,
				onConfirm: async () => {
					setModalState((prev) => ({ ...prev, isOpen: false }));
					await performSectionToggle(
						unitId,
						sectionId,
						willBeComplete
					);
				},
			});
			return; // Don't proceed until user confirms
		}

		// If turning ON (checking), proceed directly
		await performSectionToggle(unitId, sectionId, willBeComplete);
	};

	const performSectionToggle = async (
		unitId: string,
		sectionId: string,
		willBeComplete: boolean
	) => {
		const successfulUpdate = await updateSectionComplete(
			unitId,
			sectionId,
			willBeComplete,
			String(clubberInfo.person_id),
			userId ? userId : '',
			String(bookInfo?.book_id),
			clubberInfo.team
		);

		if (successfulUpdate) {
			setUnitData((prev) => {
				if (!prev) return prev;
				const unit = prev[unitId];
				if (!unit) return prev;

				// Check if all sections in the unit are complete
				const updatedUnits = {
					...unit.units,
					[sectionId]: {
						...unit.units[sectionId],
						complete: willBeComplete,
					},
				};
				const allComplete = Object.values(updatedUnits).every(
					(section) => section.complete
				);

				return {
					...prev,
					[unitId]: {
						units: updatedUnits,
						allComplete: allComplete,
					},
				};
			});
		}
	};

	async function updateSectionComplete(
		unitId: string,
		sectionId: string,
		isComplete: boolean,
		clubberId: string,
		helperId: string,
		bookId: string,
		clubberTeam: string
	) {
		try {
			const token = await getToken();
			if (!token) {
				console.error('No auth token available');
				return;
			}

			const url =
				import.meta.env.VITE_API_URL + '/update-clubber-section';
			const updateReq = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					unit_id: unitId,
					section_id: sectionId,
					is_complete: String(isComplete),
					clubber_id: clubberId,
					helper_id: helperId,
					book_id: String(bookId),
					clubber_team: clubberTeam,
				},
			});

			if (!updateReq.ok) {
				console.error('Failed to fetch clubbers:', updateReq.status);
				return;
			}

			const successBlock = await updateReq.json();
			return successBlock.success;
		} catch (error) {
			console.error('Error fetching clubbers:', error);
		}
	}

	useEffect(() => {
		async function getBookData() {
			if (!isSignedIn || !currentBookId) {
				return;
			}
			try {
				const token = await getToken();
				if (!token) {
					console.error('No auth token available');
					return;
				}

				const url = import.meta.env.VITE_API_URL + '/clubber-book-info';
				const bookDataReq = await fetch(url, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
						'book-id': String(currentBookId),
						'clubber-id': String(clubberInfo.person_id),
					},
				});

				if (!bookDataReq.ok) {
					console.error(
						'Failed to fetch book info:',
						bookDataReq.status
					);
					return;
				}

				const { bookData, sectionData, progressData } =
					(await bookDataReq.json()) as BookDataResponse;
				const tempProgress: Record<string, boolean> = {};
				for (const item of progressData) {
					tempProgress[item.section_id] = true;
				}

				setCompletedData(tempProgress);

				const tempCopy: Record<string, UnitContainer> = {};

				for (const item of sectionData) {
					const isComplete = tempProgress[item.section_id] === true;
					
					if (!tempCopy[item.unit]) {
						tempCopy[item.unit] = {
							allComplete: true,
							units: {
								[item.section_id]: {
									complete: isComplete,
									id: item.section_id,
									section: item.section,
									name: item['section_name'],
								},
							},
						};
					} else {
						tempCopy[item.unit].units[item.section_id] = {
							complete: isComplete,
							id: item.section_id,
							section: item.section,
							name: item['section_name'],
						};
					}
					// Update allComplete after adding each section
					tempCopy[item.unit].allComplete =
						tempCopy[item.unit].allComplete && isComplete;
					if (
						!tempCopy[item.unit].allComplete &&
						firstIncomplete === ''
					) {
						setFirstIncomplete(item.unit);
					}
				}
				
				setUnitData(tempCopy);
				setBookInfo(bookData);
				setSectionData(sectionData);
			} catch (error) {
				console.error('Error fetching book info:', error);
			}
		}

		getBookData();
	}, [isSignedIn, currentBookId, clubberInfo?.person_id, updateBookData]);

	// Calculate overall progress across all units
	const calculateOverallProgress = () => {
		if (!unitData) return { completed: 0, total: 0, percentage: 0 };

		let totalCompleted = 0;
		let totalSections = 0;

		Object.values(unitData).forEach((unitContainer) => {
			Object.values(unitContainer.units).forEach((section) => {
				totalSections++;
				if (section.complete) {
					totalCompleted++;
				}
			});
		});

		const percentage =
			totalSections > 0 ? (totalCompleted / totalSections) * 100 : 0;
		return { completed: totalCompleted, total: totalSections, percentage };
	};

	const overallProgress = calculateOverallProgress();

	return (
		<div className='h-full w-full p-3 sm:p-4 md:p-6 flex flex-col gap-4 overflow-y-auto'>
			{/* Progress History Dropdown */}
			<div className='w-full max-w-2xl mx-auto'>
				<ClubberHistoryChart clubberId={clubberInfo.person_id} />
			</div>

			{/* Overall Progress Bar */}
			{unitData && overallProgress.total > 0 && (
				<div className='w-full max-w-2xl mx-auto rounded-2xl border border-gray-600/30 bg-gray-800/40 backdrop-blur-xl shadow-lg px-4 sm:px-6 py-5 sm:py-6'>
					<div className='flex items-center justify-between mb-3'>
						<label className='text-xs font-medium text-gray-400 uppercase tracking-wider'>
							Overall Progress
						</label>
						<span className='text-sm font-semibold text-gray-100'>
							{overallProgress.completed} /{' '}
							{overallProgress.total}
						</span>
					</div>
					<div className='w-full h-2 bg-gray-700/50 rounded-full'>
						<div
							className='h-full bg-gray-400 rounded-full transition-all duration-300'
							style={{
								width: `${overallProgress.percentage}%`,
							}}
						/>
					</div>
					<p className='text-xs text-gray-400 mt-2'>
						{Math.round(overallProgress.percentage)}% complete
					</p>
				</div>
			)}

			{/* Main Info Card - Gray Glass Morphism Style */}
			<div className='w-full max-w-2xl mx-auto rounded-2xl border border-gray-600/30 bg-gray-800/40 backdrop-blur-xl shadow-lg'>
				{/* Book Section */}
				<div className='px-4 sm:px-6 py-5 sm:py-6 border-b border-gray-600/30'>
					<label className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block'>
						Current Book
					</label>
					<BookUpdater
						currentBook={bookInfo?.book ?? 'No Book Assigned'}
						clubberId={String(clubberInfo.person_id)}
						onUpdate={(status, newBookId) => {
							setUpdateBookData(status);
							if (newBookId) {
								setCurrentBookId(newBookId);
							}
						}}
						currentStatus={updateBookData}
					/>
				</div>

				{/* Team & Gender Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-600/30'>
					<div className='px-4 sm:px-6 py-4 sm:py-5'>
						<label className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block'>
							Team
						</label>
						<TeamUpdater
							currentTeam={clubberInfo.team}
							clubberId={String(clubberInfo.person_id)}
							onUpdate={() => {
								setClubberInfoRefreshTrigger(!clubberInfoRefreshTrigger);
							}}
						/>
					</div>
					<div className='px-4 sm:px-6 py-4 sm:py-5'>
						<GenderPicker
							currentGender={clubberGender}
							clubberId={String(clubberInfo.person_id)}
							onUpdate={() => {
								setClubberInfoRefreshTrigger(!clubberInfoRefreshTrigger);
							}}
							onGenderChange={(newGender) => {
								setClubberGender(newGender);
							}}
						/>
					</div>
				</div>
			</div>

			{unitData ? (
				Object.entries(unitData).map(([unitId, indiUnitData]) => (
					<ClubberUnitBlock
						key={unitId}
						subSections={indiUnitData.units}
						isOpen={!indiUnitData.allComplete}
						unitId={unitId}
						onToggleSection={async (sectionId) => {
							await handleToggleSection(unitId, sectionId);
						}}
					/>
				))
			) : (
				<></>
			)}

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={modalState.isOpen}
				title={modalState.title}
				message={modalState.message}
				onConfirm={modalState.onConfirm}
				onCancel={() =>
					setModalState((prev) => ({ ...prev, isOpen: false }))
				}
			/>
		</div>
	);
}

export default ClubberInfo;
