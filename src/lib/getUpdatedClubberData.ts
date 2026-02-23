import { ClubberUserData } from "src/components/ClubberPicker";

export default async function (
	clubberId: string,
	getToken: () => Promise<string | null>
): Promise<ClubberUserData | null> {
	try {
		const token = await getToken();
		if (!token) {
			console.error('No auth token available');
			return null;
		}

		const url = import.meta.env.VITE_API_URL + '/single-clubber';
		const updateReq = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
				'clubber-id': clubberId,
			},
		});

		if (!updateReq.ok) {
			console.error('Failed to update clubbers:', updateReq.status);
			return null;
		}

		const clubberData = await updateReq.json();
		return clubberData;
	} catch (error) {
		console.error('Error updating clubbers:', error);
		throw new Error('Error updating clubbers: ' +  String(error))
	}
}