import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { GlobalAppDataProvider } from './contexts/globalAppContext';
import { ClubberCacheProvider } from './contexts/ClubberCacheContext';
import { BookCacheProvider } from './contexts/BookCacheContext';
import { SectionCacheProvider } from './contexts/SectionCacheContext';
import { ReviewerCacheProvider } from './contexts/ReviewerCacheContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
	throw new Error('Add your Clerk Publishable Key to the .env file');
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
			<GlobalAppDataProvider>
				<ClubberCacheProvider>
					<BookCacheProvider>
						<SectionCacheProvider>
							<ReviewerCacheProvider>
								<App />
							</ReviewerCacheProvider>
						</SectionCacheProvider>
					</BookCacheProvider>
				</ClubberCacheProvider>
			</GlobalAppDataProvider>
		</ClerkProvider>
	</StrictMode>
);
