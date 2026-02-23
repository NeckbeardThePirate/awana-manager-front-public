import { useAuth } from '@clerk/clerk-react';
import updateActiveBook from '../lib/updateActiveBook';
import { useEffect, useState } from 'react';

interface BookUpdaterProps {
	clubberId: string;
	currentBook: string;
	onUpdate: (status: boolean, newBookId?: string) => void;
	currentStatus: boolean;
}

export function BookUpdater({
	clubberId,
	currentBook,
	onUpdate,
	currentStatus,
}: BookUpdaterProps) {
	const [clubberBook, setClubberBook] = useState<string>(currentBook);
	const [updatingBook, setUpdatingBook] = useState<boolean>(false);
	const { getToken } = useAuth();
	const books = [
		{ name: 'Apple Seed', id: 1 },
		{ name: 'Honey Comb', id: 2 },
		{ name: 'Hang Glider', id: 3 },
		{ name: 'Wing Runner', id: 4 },
		{ name: 'Sky Stormer', id: 5 },
		{ name: 'Grace in Action', id: 6 },
		{ name: 'Evidence of Grace', id: 7 },
		{ name: 'Agents of Grace', id: 8 },
		{ name: 'Discovery of Grace', id: 9 },
		{ name: 'His Story', id: 10 },
		{ name: 'His Love', id: 11 },
		{ name: 'His People', id: 12 },
	];

	useEffect(() => {
		setClubberBook(currentBook);
	}, [currentBook]);
	return (
		<>
			<button
				className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] px-4 py-2.5 text-base sm:text-lg font-medium text-gray-100 bg-gray-700/50 hover:bg-gray-600/60 border border-gray-500/50 rounded-lg transition-all duration-200 backdrop-blur-sm text-left ${
					updatingBook ? 'opacity-50 cursor-not-allowed' : ''
				}`}
				popoverTarget='popover-book'
				disabled={updatingBook}
				style={
					{
						anchorName: '--anchor-book-updater',
					} as React.CSSProperties
				}>
				{updatingBook ? (
					<>
						<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Updating...
					</>
				) : (
					<span className='flex-1 truncate'>
						{clubberBook ? clubberBook : 'No Book Assigned'}
					</span>
				)}
			</button>

			<ul
				className='dropdown menu min-w-[200px] max-w-[300px] max-h-[400px] overflow-y-auto rounded-lg bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-xl text-gray-900 font-medium'
				popover='auto'
				id='popover-book'
				style={
					{
						positionAnchor: '--anchor-book-updater',
					} as React.CSSProperties
				}>
				{books.map((book) => (
					<li key={book.id}>
						<button
							className={`hover:bg-gray-100 transition-colors text-left px-4 py-2.5 ${
								updatingBook ? 'opacity-50 cursor-not-allowed' : ''
							}`}
							disabled={updatingBook}
							onClick={async () => {
								try {
									setUpdatingBook(true);
									setClubberBook(book.name);
									document
										.getElementById('popover-book')
										?.hidePopover();
									const success = await updateActiveBook(
										clubberId,
										book.name,
										String(book.id),
										getToken
									);
									if (!success) {
										setClubberBook(currentBook);
									} else {
										onUpdate(!currentStatus, String(book.id));
									}
									setUpdatingBook(false);
								} catch (error) {
									setClubberBook(currentBook);
									setUpdatingBook(false);
									alert(
										'Error Detected, please try again, if you conitnue to experience issues please contact somebody other than Judah Helland.'
									);
								}
							}}>
							{book.name}
						</button>
					</li>
				))}
			</ul>
		</>
	);
}
