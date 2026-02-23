import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface BookData {
	book_id: number
	book: string
	club_id: number
	book_number: number
}

interface BookCacheContextType {
	getBook: (bookId: number, getToken: () => Promise<string | null>) => Promise<BookData | null>
}

const BookCacheContext = createContext<BookCacheContextType | undefined>(undefined)

export function BookCacheProvider({ children }: { children: ReactNode }) {
	const [cache, setCache] = useState<Record<number, BookData | null>>({})
	const [pending, setPending] = useState<Record<number, Promise<BookData | null>>>({})

	const getBook = useCallback(async (
		bookId: number,
		getToken: () => Promise<string | null>
	): Promise<BookData | null> => {
		// Return cached data if available
		if (cache[bookId] !== undefined) {
			return cache[bookId]
		}

		// Return pending promise if already fetching
		if (pending[bookId]) {
			return pending[bookId]
		}

		// Fetch new data
		const fetchBook = async (): Promise<BookData | null> => {
			try {
				const token = await getToken()
				if (!token) {
					console.error('No auth token available')
					return null
				}

				const url = import.meta.env.VITE_API_URL + '/book-info'
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
						'book-id': String(bookId),
					},
				})

				if (!response.ok) {
					console.error('Failed to fetch book info:', response.status)
					return null
				}

				const data: BookData = await response.json()
				return data
			} catch (error) {
				console.error('Error fetching book:', error)
				return null
			}
		}

		const promise = fetchBook()
		setPending(prev => ({ ...prev, [bookId]: promise }))

		try {
			const data = await promise
			setCache(prev => ({ ...prev, [bookId]: data }))
			setPending(prev => {
				const { [bookId]: _, ...rest } = prev
				return rest
			})
			return data
		} catch (error) {
			console.error('Error fetching book:', error)
			setPending(prev => {
				const { [bookId]: _, ...rest } = prev
				return rest
			})
			setCache(prev => ({ ...prev, [bookId]: null }))
			return null
		}
	}, [cache, pending])

	return (
		<BookCacheContext.Provider value={{ getBook }}>
			{children}
		</BookCacheContext.Provider>
	)
}

export function useBookCache() {
	const context = useContext(BookCacheContext)
	if (context === undefined) {
		throw new Error('useBookCache must be used within a BookCacheProvider')
	}
	return context
}
