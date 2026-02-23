import { useState, useEffect } from "react"
import { useAuth } from "@clerk/clerk-react"
import { DayReportsData } from "../hooks/useReports"
import { formatTeamDisplayName } from "../lib/formatTeamDisplayName"
import { useClubberCache } from "../contexts/ClubberCacheContext"
import { useBookCache } from "../contexts/BookCacheContext"
import { useSectionCache } from "../contexts/SectionCacheContext"

interface ReportDateListProps {
	data: DayReportsData
	onDateSelect: (date: string) => void
}

export default function ReportDateList({ data, onDateSelect }: ReportDateListProps) {
	const reportDates = Object.keys(data).sort().reverse()
	const [expandedDate, setExpandedDate] = useState<string | null>(null)
	const { getClubber } = useClubberCache()
	const { getBook } = useBookCache()
	const { getSection } = useSectionCache()
	const { getToken } = useAuth()

	// Prefetch clubber, book, and section data when a date is expanded
	useEffect(() => {
		if (expandedDate) {
			const reportBlock = data[expandedDate]
			const reports = Object.values(reportBlock.reports)
			
			// Prefetch all data for this date in the background
			reports.forEach((report) => {
				getClubber(report.person_id, getToken).catch((err) => {
					console.error('Error prefetching clubber:', err)
				})
				getBook(report.book_id, getToken).catch((err) => {
					console.error('Error prefetching book:', err)
				})
				getSection(report.section_id, getToken).catch((err) => {
					console.error('Error prefetching section:', err)
				})
			})
		}
	}, [expandedDate, data, getClubber, getBook, getSection, getToken])

	const toggleExpand = (date: string) => {
		setExpandedDate(expandedDate === date ? null : date)
	}

	return (
		<div className="space-y-2 overflow-y-auto max-h-screen">
			<h2 className="text-xl font-bold mb-4">Reports</h2>
			{reportDates.map((date) => {
				const isExpanded = expandedDate === date
				const reportBlock = data[date]
				
				return (
					<div key={date} className="bg-gray-800 rounded-lg overflow-hidden">
						<button
							onClick={() => toggleExpand(date)}
							className="w-full text-left p-3 hover:bg-gray-700 transition-colors flex justify-between items-center"
						>
							<div>
								<div className="font-medium">{date}</div>
								<div className="text-sm text-gray-400">
									{Object.keys(reportBlock.reports).length} entries
								</div>
							</div>
							<svg
								className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path d="M19 9l-7 7-7-7"></path>
							</svg>
						</button>

						{isExpanded && (
							<div className="px-3 pb-3 border-t border-gray-700">
								<div className="grid grid-cols-2 gap-2 mt-3 mb-3">
									{Object.entries(reportBlock.scores).map(([team, score]) => (
										<div
											key={team}
											className="flex justify-between items-center py-2 px-3 bg-gray-900 rounded"
										>
											<span className="text-gray-300 font-medium">{formatTeamDisplayName(team)}</span>
											<span className="text-gray-100 font-semibold">{score}</span>
										</div>
									))}
								</div>
								<button
									onClick={() => onDateSelect(date)}
									className="w-full py-2 px-4 bg-gray-700/50 hover:bg-gray-600/60 text-gray-100 font-medium rounded border border-gray-500/50 transition-all duration-200"
								>
									View Details
								</button>
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
