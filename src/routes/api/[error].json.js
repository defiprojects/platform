export async function get({ params }) {
	const { error } = params;

	return {
		status: 404,
		body: {
			error: `Unknown API route: /${error}`
		}
	};
}
