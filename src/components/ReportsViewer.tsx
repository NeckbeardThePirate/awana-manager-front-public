import { useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import { useReports } from "../hooks/useReports"
import ReportDateList from "./ReportDateList"
import ReportDetails from "./ReportDetails"

export default function ReportsViewer() {
	const [pickedReport, setPickedReport] = useState<string>('')
	const { getToken } = useAuth()
	const { data, loading, error } = useReports(getToken)

	if (loading) {
		return (
			<div className="flex justify-center items-center p-8">
				<span className="loading loading-spinner loading-lg text-gray-400"></span>
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-4 text-gray-400">
				Error loading reports: {error}
			</div>
		)
	}

	if (!data || Object.keys(data).length === 0) {
		return (
			<div className="p-4 text-gray-400">
				No reports available.
			</div>
		)
	}

	return (
		<div className="p-4 overflow-y-auto max-h-screen">
			{!pickedReport ? (
				<ReportDateList data={data} onDateSelect={setPickedReport} />
			) : (
				<ReportDetails
					date={pickedReport}
					reportBlock={data[pickedReport]}
					onBack={() => setPickedReport('')}
				/>
			)}
		</div>
	)
}