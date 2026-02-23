import { useState, useEffect } from "react"
import { useAuth } from "@clerk/clerk-react"
import { ClubberUserData } from "./ClubberPicker"
import { DayReport } from "../hooks/useReports"
import { useClubberCache } from "../contexts/ClubberCacheContext"
import { useBookCache, BookData } from "../contexts/BookCacheContext"
import { useSectionCache, SectionData } from "../contexts/SectionCacheContext"
import { useReviewerCache, type ReviewerInfo } from "../contexts/ReviewerCacheContext"
import { formatTeamDisplayName } from "../lib/formatTeamDisplayName"

interface ReportEntryCardProps {
	report: DayReport
}

export default function ReportEntryCard({ report }: ReportEntryCardProps) {
	const { getToken } = useAuth()
	const { getClubber } = useClubberCache()
	const { getBook } = useBookCache()
	const { getSection } = useSectionCache()
	const { getReviewer } = useReviewerCache()
	const [clubberData, setClubberData] = useState<ClubberUserData | null>(null)
	const [bookData, setBookData] = useState<BookData | null>(null)
	const [sectionData, setSectionData] = useState<SectionData | null>(null)
	const [reviewerData, setReviewerData] = useState<ReviewerInfo | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchData() {
			try {
				const [clubber, book, section, reviewer] = await Promise.all([
					getClubber(report.person_id, getToken),
					getBook(report.book_id, getToken),
					getSection(report.section_id, getToken),
					getReviewer(report.reviewer_id, getToken),
				])
				setClubberData(clubber)
				setBookData(book)
				setSectionData(section)
				setReviewerData(reviewer)
			} catch (error) {
				console.error('Error fetching data:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [report.person_id, report.book_id, report.section_id, report.reviewer_id, getToken, getClubber, getBook, getSection, getReviewer])

	if (loading) {
		return (
			<div className="p-3 bg-gray-800 rounded-lg">
				<div className="text-sm text-gray-400">Loading...</div>
			</div>
		)
	}

	if (!clubberData) {
		return (
			<div className="p-3 bg-gray-800 rounded-lg">
				<div className="text-sm text-gray-400">
					Person #{report.person_id} • Section: {report.section_id} • Book #{report.book_id}
				</div>
				<div className="text-xs text-gray-500">
					Completed: {new Date(parseInt(report.completed_dt)).toLocaleString()}
				</div>
			</div>
		)
	}

	return (
		<div className="p-4 bg-gray-800 rounded-lg">
			<div className="flex justify-between items-start mb-2">
				<div>
					<div className="font-semibold text-gray-100">
						{clubberData.first_name} {clubberData.last_name}
					</div>
					<div className="text-xs text-gray-500 capitalize">
						{clubberData.gender} • {clubberData.team?.toLowerCase() === 'no_team' ? 'No Team' : `${formatTeamDisplayName(clubberData.team)} Team`}
					</div>
					<div className="text-xs text-gray-500 mt-1">
						{reviewerData ? (
							<>
								Reviewed by: {reviewerData.first_name} {reviewerData.last_name}
								{reviewerData.email ? ` (${reviewerData.email})` : null}
							</>
						) : report.reviewer_id ? (
							<>Reviewed by: {report.reviewer_id}</>
						) : (
							<>Reviewed by: Unknown</>
						)}
					</div>
				</div>
			</div>
			<div className="text-sm text-gray-400">
				{sectionData ? (
					<>
						{sectionData.section_name} ({sectionData.unit}) • {bookData ? bookData.book : `Book #${report.book_id}`}
					</>
				) : (
					<>
						Section: {report.section_id} • {bookData ? bookData.book : `Book #${report.book_id}`}
					</>
				)}
			</div>
			<div className="text-xs text-gray-500 mt-1">
				Completed: {new Date(parseInt(report.completed_dt)).toLocaleString()}
			</div>
		</div>
	)
}
