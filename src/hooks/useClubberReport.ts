import { useState, useEffect, useCallback } from 'react'

export interface ClubberReportEntry {
	person_id: number
	progress_id: number
	section_id: string
	completed_dt: string
	reviewer_id: string
	book_id: number
	current_team: 'red' | 'yellow' | 'green' | 'blue' | 'unknown' | 'no_team'
}

export interface ClubberReportData {
	[date: string]: ClubberReportEntry[]
}

interface UseClubberReportResult {
	data: ClubberReportData | null
	loading: boolean
	error: string | null
	refetch: () => Promise<void>
}

export function useClubberReport(
	clubberId: number,
	getToken: () => Promise<string | null>
): UseClubberReportResult {
	const [data, setData] = useState<ClubberReportData | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	const fetchReport = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			const token = await getToken()
			if (!token) {
				setError('No auth token available')
				setLoading(false)
				return
			}

			const url = import.meta.env.VITE_API_URL + '/clubber-report'
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'clubber-id': String(clubberId),
				},
			})

			if (!response.ok) {
				setError(`Failed to fetch clubber report: ${response.status}`)
				setLoading(false)
				return
			}

		const responseData: ClubberReportEntry[] = await response.json()
		console.log('Clubber Report Raw Response:', responseData)
		console.log('Response length:', responseData.length)
		
		// Group entries by date
		const groupedByDate: ClubberReportData = {}
		
		responseData.forEach(entry => {
			// Convert timestamp (milliseconds) to date string
			const date = new Date(parseInt(entry.completed_dt))
			const dateKey = date.toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'numeric', 
				day: 'numeric' 
			})
			
			if (!groupedByDate[dateKey]) {
				groupedByDate[dateKey] = []
			}
			groupedByDate[dateKey].push(entry)
		})
		
		console.log('Grouped by date:', groupedByDate)
		console.log('Date keys:', Object.keys(groupedByDate))
		
		setData(groupedByDate)
		} catch (err) {
			console.error('Error fetching clubber report:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch clubber report')
		} finally {
			setLoading(false)
		}
	}, [clubberId, getToken])

	useEffect(() => {
		if (clubberId) {
			fetchReport()
		}
	}, [clubberId, fetchReport])

	return {
		data,
		loading,
		error,
		refetch: fetchReport,
	}
}
