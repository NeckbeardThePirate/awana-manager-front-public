import { ReportBlock } from "../hooks/useReports"
import TeamScores from "./TeamScores"
import ReportEntries from "./ReportEntries"

interface ReportDetailsProps {
	date: string
	reportBlock: ReportBlock
	onBack: () => void
}

export default function ReportDetails({ date, reportBlock, onBack }: ReportDetailsProps) {
	return (
		<div>
			<button
				onClick={onBack}
				className="mb-4 text-gray-300 hover:text-gray-100 transition-colors"
			>
				← Back to dates
			</button>
			<h2 className="text-xl font-bold mb-4">Report: {date}</h2>
			
			<TeamScores scores={reportBlock.scores} />
			<ReportEntries reports={reportBlock.reports} />
		</div>
	)
}
