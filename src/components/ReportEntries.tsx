import { DayReport } from "../hooks/useReports"
import ReportEntryCard from "./ReportEntryCard"

interface ReportEntriesProps {
	reports: Record<string, DayReport>
}

export default function ReportEntries({ reports }: ReportEntriesProps) {
	return (
		<div className="space-y-2">
			<h3 className="font-semibold text-gray-300">Entries:</h3>
			{Object.entries(reports).map(([key, report]) => (
				<ReportEntryCard key={key} report={report} />
			))}
		</div>
	)
}
