import { useEffect, useState } from 'react';
import './App.css';
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
	useAuth,
	UserProfile,
} from '@clerk/clerk-react';
import ClubPicker from './components/ClubPicker';
import ClubberPicker, { ClubberUserData } from './components/ClubberPicker';
import ClubberInfo from './components/ClubberInfo';
import { useUrlParams } from './hooks/useUrlParams';
import getPointsTest from './lib/getPointsTest';
import DailyReport from './components/DailyReport';
import PointsReport from './components/PointsReport';
import {
	GlobalAppDataProvider,
	useGlobalAppData,
} from './contexts/globalAppContext';
import ReportsViewer from './components/ReportsViewer';

function App() {
	const [hasPickedClub, setHasPickedClub] = useState<boolean>(false);
	const [hasPickedClubber, setHasPickedClubber] = useState<boolean>(false);
	const [club, setClub] = useState<string>('');
	const [clubberId, setClubberId] = useState<string>('');
	const [clubberName, setClubberName] = useState<string>('');
	const [selectedClubberData, setSelectedClubberData] =
		useState<ClubberUserData | null>(null);
	const [clubbers, setClubbers] = useState<Array<ClubberUserData>>([]);
	const { getToken, isSignedIn, isLoaded } = useAuth();
	const { params, updateParams } = useUrlParams();
	const [viewingReports, setViewingReports] = useState<boolean>(false);
	const { clubberInfoRefreshTrigger } = useGlobalAppData();

	const handleClubSelect = (selectedClub: string) => {
		setClub(selectedClub);
		updateParams({ club: selectedClub });
		setHasPickedClub(true);
	};

	const handleClubberSelect = (selectedClubber: string) => {
		setClubberId(selectedClubber);
		updateParams({ clubber: selectedClubber });

		setHasPickedClubber(true);

		// Find the clubber's data from the clubbers array
		const clubberData = clubbers.find(
			(c) => String(c.person_id) === selectedClubber
		);
		if (clubberData) {
			setSelectedClubberData(clubberData);
			setClubberName(
				`${clubberData.first_name} ${clubberData.last_name}`
			);
		}
	};

	// Sync state from URL params - only when params actually change
	useEffect(() => {
		const pickedClub = params.club;
		const pickedClubber = params.clubber;

		if (pickedClub && club !== pickedClub) {
			setHasPickedClub(true);
			setClub(pickedClub);
		}

		if (pickedClubber && clubberId !== pickedClubber) {
			setHasPickedClubber(true);
			setClubberId(pickedClubber);
			// Set from clubbers array when clubberId changes
			const clubberData = clubbers.find(
				(c) => String(c.person_id) === pickedClubber
			);
			if (clubberData) {
				setSelectedClubberData(clubberData);
				setClubberName(
					`${clubberData.first_name} ${clubberData.last_name}`
				);
			}
		} else if (!pickedClubber && clubberId) {
			// Clear selection when clubber param is removed
			setClubberId('');
			setHasPickedClubber(false);
			setClubberName('');
			setSelectedClubberData(null);
		}

		if (!pickedClub && club) {
			// Clear club when param is removed
			setClub('');
			setHasPickedClub(false);
			setClubbers([]);
		}
	}, [params.club, params.clubber, clubbers, club, clubberId]);

	// Refetch clubbers list from server - this ensures we always have fresh data
	useEffect(() => {
		async function getClubbers() {
			if (!isSignedIn || !club) {
				return;
			}

			try {
				const token = await getToken();
				if (!token) {
					console.error('No auth token available');
					return;
				}

				const url = import.meta.env.VITE_API_URL + '/clubbers';
				const clubberDataReq = await fetch(url, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
						club: club,
					},
				});

				if (!clubberDataReq.ok) {
					console.error(
						'Failed to fetch clubbers:',
						clubberDataReq.status
					);
					return;
				}

				const clubberData = await clubberDataReq.json();
				setClubbers(clubberData);

				// If we have a selected clubber, update their data too
				if (clubberId) {
					const updatedClubber = clubberData.find(
						(c: ClubberUserData) => String(c.person_id) === clubberId
					);
					if (updatedClubber) {
						setSelectedClubberData(updatedClubber);
						setClubberName(
							`${updatedClubber.first_name} ${updatedClubber.last_name}`
						);
					}
				}
			} catch (error) {
				console.error('Error fetching clubbers:', error);
			}
		}

		getClubbers();
		// Also refetch when clubberInfoRefreshTrigger changes (after gender/team updates)
	}, [club, isSignedIn, getToken, clubberInfoRefreshTrigger, clubberId]);

	useEffect(() => {
		if (!isSignedIn && isLoaded) {
			window.location.href =
				'https://accounts.awana.discoverybible.church/sign-in?redirect_url=https%3A%2F%2Fawana.discoverybible.church';
		}
	}, [UserProfile]);

	useEffect(() => {
		if (params.reports === 'true') {
			setViewingReports(true);
		}
	}, [params.reports])

	useEffect(() => {
		updateParams({ reports: viewingReports ? 'true' : '' })
	}, [viewingReports])

	function handleBackRequest() {
		if (params.clubber) {
			updateParams({ clubber: '' });
			setClubberId('');
			setHasPickedClubber(false);
			setClubberName('');
		} else if (params.club) {
			updateParams({ club: '' });
			setClub('');
			setHasPickedClub(false);
			setClubbers([]);
		} else if (params.reports) {
			updateParams({ reports: '' });
			setViewingReports(false)
		}
	}

	function returnToHome() {
		updateParams({ clubber: '' });
		updateParams({ reports: '' });
		setViewingReports(false)
		setClubberId('');
		setHasPickedClubber(false);
		setClubberName('');
		updateParams({ club: '' });
		setClub('');
		setHasPickedClub(false);
		setClubbers([]);
	}

	return (
		<div className='bg-black h-fit w-full min-h-screen text-gray-100'>
			<header className='h-20 w-full border-b-2 border-gray-500 bg-gray-700 shadow-2xl flex justify-between items-center px-4 sm:px-6 py-4'>
				<button
					onClick={() => {
						returnToHome();
					}}
					className='hover:bg-gray-700/50 rounded-xl p-2 transition-colors'
					aria-label='Go to home'>
					<img
						className='w-12 h-12 bg-gray-200 rounded-full shadow-lg'
						src='/logo_large.png'
						alt='AWANA Clubs Logo'
					/>
				</button>
				{hasPickedClub || hasPickedClubber || viewingReports ? (
					<button
						className='btn btn-outline text-gray-200 font-bold border-gray-400 hover:bg-gray-700/50 hover:border-gray-300 transition-all duration-200'
						onClick={() => handleBackRequest()}>
						Back
					</button>
				) : (
					<></>
				)}

				<div className='flex items-center justify-center h-full text-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100 flex-1 px-4 tracking-tight'>
					{clubberName || club || 'AWANA Clubs'}
				</div>
				<div className='flex justify-end'>
					<SignedOut>
						<SignInButton />
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</header>
			<div className='h-[calc(100vh-5rem)]'>
				{!hasPickedClub && !viewingReports ?
					(						<div className='flex flex-col'>
						<ClubPicker onClubSelect={handleClubSelect} selectPoints={setViewingReports} />
						<PointsReport />
					</div>) : null}

				{viewingReports ? (
					<ReportsViewer />
				) : null}

				{hasPickedClub && !hasPickedClubber ? (
					<div>
						<ClubberPicker
							onClubberSelect={handleClubberSelect}
							clubbers={clubbers}
						/>
					</div>
				) : null}

				{hasPickedClub && hasPickedClubber && selectedClubberData ? (
					<ClubberInfo clubberInfo={selectedClubberData} />
				) : null}
			</div>
		</div>
	);
}

export default App;
