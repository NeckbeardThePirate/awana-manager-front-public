import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface SectionData {
	section_id: string
	club: string
	book_number: number
	book_name: string
	unit: string
	section: string
	section_name: string
}

interface SectionCacheContextType {
	getSection: (sectionId: string, getToken: () => Promise<string | null>) => Promise<SectionData | null>
}

const SectionCacheContext = createContext<SectionCacheContextType | undefined>(undefined)

export function SectionCacheProvider({ children }: { children: ReactNode }) {
	const [cache, setCache] = useState<Record<string, SectionData | null>>({})
	const [pending, setPending] = useState<Record<string, Promise<SectionData | null>>>({})

	const getSection = useCallback(async (
		sectionId: string,
		getToken: () => Promise<string | null>
	): Promise<SectionData | null> => {
		// Return cached data if available
		if (sectionId in cache) {
			return cache[sectionId]
		}

		// Return pending promise if already fetching
		if (sectionId in pending) {
			return pending[sectionId]
		}

		// Fetch new data
		const fetchSection = async (): Promise<SectionData | null> => {
			try {
				const token = await getToken()
				if (!token) {
					console.error('No auth token available')
					return null
				}

				const url = import.meta.env.VITE_API_URL + '/section-info'
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
						'section-id': sectionId,
					},
				})

				if (!response.ok) {
					console.error('Failed to fetch section info:', response.status)
					return null
				}

				const data: SectionData = await response.json()
				return data
			} catch (error) {
				console.error('Error fetching section:', error)
				return null
			}
		}

		const promise = fetchSection()
		setPending(prev => ({ ...prev, [sectionId]: promise }))

		try {
			const data = await promise
			setCache(prev => ({ ...prev, [sectionId]: data }))
			setPending(prev => {
				const { [sectionId]: _, ...rest } = prev
				return rest
			})
			return data
		} catch (error) {
			console.error('Error fetching section:', error)
			setPending(prev => {
				const { [sectionId]: _, ...rest } = prev
				return rest
			})
			setCache(prev => ({ ...prev, [sectionId]: null }))
			return null
		}
	}, [cache, pending])

	return (
		<SectionCacheContext.Provider value={{ getSection }}>
			{children}
		</SectionCacheContext.Provider>
	)
}

export function useSectionCache() {
	const context = useContext(SectionCacheContext)
	if (context === undefined) {
		throw new Error('useSectionCache must be used within a SectionCacheProvider')
	}
	return context
}
