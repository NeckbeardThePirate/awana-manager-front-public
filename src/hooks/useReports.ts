import { useState, useEffect, useCallback } from 'react';

export interface DayReport {
	person_id: number;
	progress_id: number;
	section_id: string;
	completed_dt: string;
	reviewer_id: string;
	book_id: number;
	current_team: 'red' | 'yellow' | 'green' | 'blue' | 'unknown' | 'no_team';
}

export interface ReportBlock {
	reports: Record<string, DayReport>;
	scores: Record<string, number>;
}

export type DayReportsData = Record<string, ReportBlock>;

interface ReportResponse {
	dayReports: DayReportsData;
}

interface UseReportsResult {
	data: DayReportsData | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export function useReports(
	getToken: () => Promise<string | null>
): UseReportsResult {
	const [data, setData] = useState<DayReportsData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchReports = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const token = await getToken();
			if (!token) {
				setError('No auth token available');
				setLoading(false);
				return;
			}

			const url = import.meta.env.VITE_API_URL + '/all-reports';
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				setError(`Failed to fetch reports: ${response.status}`);
				setLoading(false);
				return;
			}

			const responseData: ReportResponse = await response.json();
			console.log(responseData)
			setData(responseData.dayReports);
		} catch (err) {
			console.error('Error fetching reports:', err);
			setError(err instanceof Error ? err.message : 'Failed to fetch reports');
		} finally {
			setLoading(false);
		}
	}, [getToken]);

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	return {
		data,
		loading,
		error,
		refetch: fetchReports,
	};
}
