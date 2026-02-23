export default async function (clubberId: string, gender: 'Male' | 'Female',   getToken: () => Promise<string | null>) {
	try {
		const token = await getToken();
		if (!token) {
			console.error('No auth token available');
			return;
		}

		const url = import.meta.env.VITE_API_URL + '/update-clubber-gender';
		const updateReq = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				gender,
				clubber_id: clubberId,
			},
		});

		if (!updateReq.ok) {
			console.error('Failed to update clubbers:', updateReq.status);
			return;
		}

		const successBlock = await updateReq.json();
		return successBlock.success;
	} catch (error) {
		console.error('Error updating clubbers:', error);
	}
}
