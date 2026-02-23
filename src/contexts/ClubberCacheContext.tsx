import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ClubberUserData } from '../components/ClubberPicker'
import getUpdatedClubberData from '../lib/getUpdatedClubberData'

interface ClubberCacheContextType {
	getClubber: (personId: number, getToken: () => Promise<string | null>) => Promise<ClubberUserData | null>
}

const ClubberCacheContext = createContext<ClubberCacheContextType | undefined>(undefined)

export function ClubberCacheProvider({ children }: { children: ReactNode }) {
	const [cache, setCache] = useState<Record<number, ClubberUserData | null>>({})
	const [pending, setPending] = useState<Record<number, Promise<ClubberUserData | null>>>({})

	const getClubber = useCallback(async (
		personId: number,
		getToken: () => Promise<string | null>
	): Promise<ClubberUserData | null> => {
		// Return cached data if available
		if (cache[personId] !== undefined) {
			return cache[personId]
		}

		// Return pending promise if already fetching
		if (pending[personId]) {
			return pending[personId]
		}

		// Fetch new data
		const promise = getUpdatedClubberData(String(personId), getToken)
		
		setPending(prev => ({ ...prev, [personId]: promise }))

		try {
			const data = await promise
			setCache(prev => ({ ...prev, [personId]: data }))
			setPending(prev => {
				const { [personId]: _, ...rest } = prev
				return rest
			})
			return data
		} catch (error) {
			console.error('Error fetching clubber:', error)
			setPending(prev => {
				const { [personId]: _, ...rest } = prev
				return rest
			})
			setCache(prev => ({ ...prev, [personId]: null }))
			return null
		}
	}, [cache, pending])

	return (
		<ClubberCacheContext.Provider value={{ getClubber }}>
			{children}
		</ClubberCacheContext.Provider>
	)
}

export function useClubberCache() {
	const context = useContext(ClubberCacheContext)
	if (context === undefined) {
		throw new Error('useClubberCache must be used within a ClubberCacheProvider')
	}
	return context
}
