import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import updateGender from '../lib/updateGender';

interface GenderPickerProps {
	currentGender: string;
	clubberId: string;
	onUpdate: () => void;
	onGenderChange: (newGender: string) => void;
}

export function GenderPicker({
	currentGender,
	clubberId,
	onUpdate,
	onGenderChange,
}: GenderPickerProps) {
	const { getToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	return (
		<>
			<label className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block'>
				Gender
			</label>
			<button
				className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-100 bg-gray-700/50 hover:bg-gray-600/60 border border-gray-500/50 rounded-lg transition-all duration-200 backdrop-blur-sm ${
					isLoading ? 'opacity-50 cursor-not-allowed' : ''
				}`}
				popoverTarget='popover-gender'
				disabled={isLoading}
				style={
					{
						anchorName: '--anchor-gender',
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
					currentGender
				)}
			</button>

			<ul
				className='dropdown menu min-w-[120px] rounded-lg bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-xl text-gray-900 font-medium overflow-hidden'
				popover='auto'
				id='popover-gender'
				style={
					{
						positionAnchor: '--anchor-gender',
					} as React.CSSProperties
				}>
				<li>
					<button
						className={`hover:bg-gray-100 transition-colors ${
							isLoading ? 'opacity-50 cursor-not-allowed' : ''
						}`}
						disabled={isLoading}
						onClick={async () => {
							setIsLoading(true);
							try {
								const success = await updateGender(
									clubberId,
									'Male',
									getToken
								);
								if (success) {
									onGenderChange('Male');
									onUpdate();
								}
							} finally {
								setIsLoading(false);
								document
									.getElementById('popover-gender')
									?.hidePopover();
							}
						}}>
						Male
					</button>
				</li>
				<li>
					<button
						className={`hover:bg-gray-100 transition-colors ${
							isLoading ? 'opacity-50 cursor-not-allowed' : ''
						}`}
						disabled={isLoading}
						onClick={async () => {
							setIsLoading(true);
							try {
								const success = await updateGender(
									clubberId,
									'Female',
									getToken
								);
								if (success) {
									onGenderChange('Female');
									onUpdate();
								}
							} finally {
								setIsLoading(false);
								document
									.getElementById('popover-gender')
									?.hidePopover();
							}
						}}>
						Female
					</button>
				</li>
			</ul>
		</>
	);
}
