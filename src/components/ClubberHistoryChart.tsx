import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useClubberReport, ClubberReportEntry } from '../hooks/useClubberReport'
import { useBookCache } from '../contexts/BookCacheContext'
import { useSectionCache } from '../contexts/SectionCacheContext'
import { useReviewerCache, type ReviewerInfo } from '../contexts/ReviewerCacheContext'

interface ClubberHistoryChartProps {
	clubberId: number
}

interface DayData {
	date: string
	entries: ClubberReportEntry[]
	displayDate: Date
	cumulative: number
}

export default function ClubberHistoryChart({ clubberId }: ClubberHistoryChartProps) {
	const { getToken } = useAuth()
	const { data, loading, error } = useClubberReport(clubberId, getToken)
	const { getBook } = useBookCache()
	const { getSection } = useSectionCache()
	const { getReviewer } = useReviewerCache()
	const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
	const [loadedData, setLoadedData] = useState<Record<string, { bookName: string; sectionName: string }>>({})
	const [loadedReviewers, setLoadedReviewers] = useState<Record<string, ReviewerInfo | null>>({})
	const [isExpanded, setIsExpanded] = useState(false)

	if (loading) {
		return (
			<div className="bg-gray-800/50 rounded-lg p-3">
				<div className="text-xs text-gray-400">Loading history...</div>
			</div>
		)
	}

	if (error || !data || Object.keys(data).length === 0) {
		return null // Don't show anything if no data
	}

	// Calculate date one year ago
	const oneYearAgo = new Date()
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

	// Sort dates and filter to last year only
	const sortedDates = Object.keys(data)
		.filter(date => new Date(date) >= oneYearAgo)
		.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

	// If no data in the last year, don't show
	if (sortedDates.length === 0) {
		return null
	}

	// Calculate cumulative progress
	let cumulative = 0
	const dayDataArray: DayData[] = sortedDates.map(date => {
		cumulative += data[date].length
		return {
			date,
			entries: data[date],
			displayDate: new Date(date),
			cumulative
		}
	})

	const totalSections = dayDataArray[dayDataArray.length - 1].cumulative

	const handleDayHover = async (dayData: DayData) => {
		setHoveredDay(dayData)
		
		// Prefetch book and section data for this day
		for (const entry of dayData.entries) {
			const key = `${entry.section_id}-${entry.book_id}`
			if (!loadedData[key]) {
				const [book, section] = await Promise.all([
					getBook(entry.book_id, getToken),
					getSection(entry.section_id, getToken)
				])
				
				if (book && section) {
					setLoadedData(prev => ({
						...prev,
						[key]: {
							bookName: book.book,
							sectionName: section.section_name
						}
					}))
				}
			}
		}

		const reviewerIdsToLoad = Array.from(
			new Set(dayData.entries.map(e => e.reviewer_id).filter(Boolean))
		).filter(id => loadedReviewers[id] === undefined)

		if (reviewerIdsToLoad.length > 0) {
			const reviewerResults = await Promise.all(
				reviewerIdsToLoad.map(async id => {
					const info = await getReviewer(id, getToken)
					return [id, info] as const
				})
			)

			setLoadedReviewers(prev => ({
				...prev,
				...Object.fromEntries(reviewerResults),
			}))
		}
	}

	const maxCumulative = dayDataArray[dayDataArray.length - 1].cumulative
	const chartHeight = 192 // h-48 = 192px
	const chartPadding = 40 // padding for labels

	// Calculate SVG points for the step line
	const points = dayDataArray.map((dayData, index) => {
		const x = (index / (dayDataArray.length - 1)) * 100
		const y = chartHeight - chartPadding - ((dayData.cumulative / maxCumulative) * (chartHeight - chartPadding - 20))
		return { x, y, dayData }
	})

	// Create SVG path for step line
	let pathD = ''
	points.forEach((point, index) => {
		if (index === 0) {
			pathD += `M ${point.x} ${point.y}`
		} else {
			const prevPoint = points[index - 1]
			pathD += ` L ${point.x} ${prevPoint.y} L ${point.x} ${point.y}`
		}
	})

	return (
		<div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
			{/* Header / Toggle Button */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full p-3 flex justify-between items-center hover:bg-gray-700/50 transition-colors"
			>
				<div className="flex items-center gap-2">
					<svg 
						className="w-5 h-5 text-blue-400" 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
						/>
					</svg>
					<span className="text-sm font-medium text-gray-100">Progress History</span>
					<span className="text-xs text-gray-400">({totalSections} sections)</span>
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

			{/* Chart Content */}
			{isExpanded && (
				<div className="p-4 pt-0 border-t border-gray-700/50">
					<div className="relative">
						{/* Chart */}
						<svg 
							className="w-full" 
							style={{ height: `${chartHeight}px` }}
							viewBox={`0 0 100 ${chartHeight}`}
							preserveAspectRatio="none"
						>
							{/* Grid lines */}
							{[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
								const y = chartHeight - chartPadding - (ratio * (chartHeight - chartPadding - 20))
								return (
									<line
										key={ratio}
										x1="0"
										y1={y}
										x2="100"
										y2={y}
										stroke="#374151"
										strokeWidth="0.2"
										strokeDasharray="1,1"
									/>
								)
							})}

							{/* Step line */}
							<path
								d={pathD}
								fill="none"
								stroke="#60a5fa"
								strokeWidth="1"
								vectorEffect="non-scaling-stroke"
							/>

							{/* Data points */}
							{points.map((point, index) => (
								<circle
									key={index}
									cx={point.x}
									cy={point.y}
									r="2"
									fill={hoveredDay?.date === point.dayData.date ? "#3b82f6" : "#60a5fa"}
									stroke="#1e293b"
									strokeWidth="0.5"
									vectorEffect="non-scaling-stroke"
									className="cursor-pointer transition-all"
									onMouseEnter={() => handleDayHover(point.dayData)}
									onMouseLeave={() => setHoveredDay(null)}
									onTouchStart={() => handleDayHover(point.dayData)}
								/>
							))}

							{/* Y-axis labels */}
							{[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
								const y = chartHeight - chartPadding - (ratio * (chartHeight - chartPadding - 20))
								const value = Math.round(ratio * maxCumulative)
								return (
									<text
										key={ratio}
										x="-2"
										y={y}
										fill="#9ca3af"
										fontSize="10"
										textAnchor="end"
										dominantBaseline="middle"
									>
										{value}
									</text>
								)
							})}
						</svg>

						{/* X-axis date labels */}
						<div className="flex justify-between mt-2 px-2">
							{dayDataArray.filter((_, index) => 
								index === 0 || 
								index === dayDataArray.length - 1 || 
								index % Math.ceil(dayDataArray.length / 5) === 0
							).map((dayData) => (
								<div key={dayData.date} className="text-xs text-gray-500">
									{dayData.displayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
								</div>
							))}
						</div>

						{/* Floating Info Card */}
						{hoveredDay && (
							<div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl z-50 max-w-sm w-[90vw]">
								<div className="text-sm font-semibold text-gray-100 mb-2">
									{hoveredDay.displayDate.toLocaleDateString(undefined, { 
										weekday: 'short',
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</div>
								<div className="text-xs text-gray-400 mb-1">
									{hoveredDay.entries.length} section{hoveredDay.entries.length !== 1 ? 's' : ''} completed
								</div>
								<div className="text-xs text-gray-400 mb-3">
									Total: {hoveredDay.cumulative} sections
								</div>
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{hoveredDay.entries.map((entry, idx) => {
										const key = `${entry.section_id}-${entry.book_id}`
										const loaded = loadedData[key]
										
										return (
											<div key={idx} className="text-xs bg-gray-800 p-2 rounded">
												{loaded ? (
													<>
														<div className="text-gray-200 font-medium">{loaded.sectionName}</div>
														<div className="text-gray-500">{loaded.bookName}</div>
														{entry.reviewer_id ? (
															<div className="text-gray-500 mt-1">
																Reviewed by:{' '}
																{loadedReviewers[entry.reviewer_id]
																	? `${loadedReviewers[entry.reviewer_id]?.first_name} ${loadedReviewers[entry.reviewer_id]?.last_name}${
																			loadedReviewers[entry.reviewer_id]?.email
																				? ` (${loadedReviewers[entry.reviewer_id]?.email})`
																				: ''
																		}`
																	: entry.reviewer_id}
															</div>
														) : null}
													</>
												) : (
													<div className="text-gray-400">
														Section {entry.section_id} • Book #{entry.book_id}
													</div>
												)}
											</div>
										)
									})}
								</div>
								<button
									onClick={() => setHoveredDay(null)}
									className="mt-3 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs font-medium rounded transition-colors"
								>
									Close
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
