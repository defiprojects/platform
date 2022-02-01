export async function get({ params }) {
    const { error } = params;

    return {
        body: {
            "error": `Unknown API route: /${error}`
        }
    };
}