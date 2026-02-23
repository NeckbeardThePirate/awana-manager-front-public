import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export interface ReviewerInfo {
	reviewer_id: string
	email: string
	first_name: string
	last_name: string
}

interface ReviewerCacheContextType {
	getReviewer: (
		reviewerId: string,
		getToken: () => Promise<string | null>
	) => Promise<ReviewerInfo | null>
}

const ReviewerCacheContext = createContext<ReviewerCacheContextType | undefined>(
	undefined
)

export function ReviewerCacheProvider({ children }: { children: ReactNode }) {
	const [cache, setCache] = useState<Record<string, ReviewerInfo | null>>({})
	const [pending, setPending] = useState<
		Record<string, Promise<ReviewerInfo | null>>
	>({})

	const tryReadJson = async <T,>(response: Response): Promise<T | null> => {
		// `response.json()` throws if the body is empty (common with 204s)
		const text = await response.text()
		if (!text || text.trim() === '') return null
		try {
			return JSON.parse(text) as T
		} catch {
			return null
		}
	}

	const getReviewer = useCallback(
		async (
			reviewerId: string,
			getToken: () => Promise<string | null>
		): Promise<ReviewerInfo | null> => {
			if (!reviewerId) return null

			// Return cached data if available
			if (reviewerId in cache) {
				return cache[reviewerId] ?? null
			}

			// Return pending promise if already fetching
			if (reviewerId in pending) {
				return pending[reviewerId]
			}

			const fetchReviewer = async (): Promise<ReviewerInfo | null> => {
				try {
					const token = await getToken()
					if (!token) {
						console.error('No auth token available')
						return null
					}

					const url = import.meta.env.VITE_API_URL + '/reviewer-info'
					const response = await fetch(url, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${token}`,
							'reviewer-id': reviewerId,
						},
					})
					if (!response.ok) {
						console.error('Failed to fetch reviewer info:', response.status)
						return null
					}

					const data = await tryReadJson<Partial<ReviewerInfo>>(response)
					if (!data) return null
					return {
						reviewer_id: data.reviewer_id ?? reviewerId,
						email: data.email ?? '',
						first_name: data.first_name ?? '',
						last_name: data.last_name ?? '',
					}
				} catch (error) {
					console.error('Error fetching reviewer:', error)
					return null
				}
			}

			const promise = fetchReviewer()
			setPending(prev => ({ ...prev, [reviewerId]: promise }))

			try {
				const data = await promise
				setCache(prev => ({ ...prev, [reviewerId]: data }))
				setPending(prev => {
					const { [reviewerId]: _, ...rest } = prev
					return rest
				})
				return data
			} catch (error) {
				console.error('Error fetching reviewer:', error)
				setPending(prev => {
					const { [reviewerId]: _, ...rest } = prev
					return rest
				})
				setCache(prev => ({ ...prev, [reviewerId]: null }))
				return null
			}
		},
		[cache, pending]
	)

	return (
		<ReviewerCacheContext.Provider value={{ getReviewer }}>
			{children}
		</ReviewerCacheContext.Provider>
	)
}

export function useReviewerCache() {
	const context = useContext(ReviewerCacheContext)
	if (context === undefined) {
		throw new Error(
			'useReviewerCache must be used within a ReviewerCacheProvider'
		)
	}
	return context
}

