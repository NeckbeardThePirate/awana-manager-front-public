import React, { createContext, useContext, useState, ReactNode } from 'react';

type GlobalAppDataContextType = {
	orgId: string;
	setOrgId: (data: string) => void;
	techId: string;
	setTechId: (data: string) => void;
	clubberInfoRefreshTrigger: boolean;
	setClubberInfoRefreshTrigger: (
		value: boolean | ((prev: boolean) => boolean)
	) => void;
};

const GlobalAppDataContext = createContext<
	GlobalAppDataContextType | undefined
>(undefined);

export const GlobalAppDataProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [orgId, setOrgId] = useState<string>('');
	const [techId, setTechId] = useState<string>('');
	const [clubberInfoRefreshTrigger, setClubberInfoRefreshTrigger] =
		useState<boolean>(false);

	const value = {
		orgId,
		setOrgId,
		techId,
		setTechId,
		clubberInfoRefreshTrigger,
		setClubberInfoRefreshTrigger,
	};

	return (
		<GlobalAppDataContext.Provider value={value}>
			{children}
		</GlobalAppDataContext.Provider>
	);
};

// 3. Create a custom hook for easy consumption
export const useGlobalAppData = () => {
	const context = useContext(GlobalAppDataContext);
	if (context === undefined) {
		throw new Error(
			'useGlobalAppData must be used within a GlobalAppDataProvider'
		);
	}
	return context;
};
