export default async function (getToken: () => Promise<string | null>) {
	try {
		const token = await getToken();
		if (!token) {
			console.error('No auth token available');
			return;
		}

		const url = import.meta.env.VITE_API_URL + '/points-report';
		const updateReq = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!updateReq.ok) {
			console.error('Failed to update clubbers:', updateReq.status);
			return;
		}

		const successBlock = await updateReq.json();
		console.log(successBlock)
		return successBlock.success;
	} catch (error) {
		console.error('Error updating clubbers:', error);
	}
}
