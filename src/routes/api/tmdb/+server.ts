import { TMDB_TOKEN } from '$env/static/private';
import { json } from '@sveltejs/kit';

const BASE = 'https://api.themoviedb.org/3';

export async function GET({ url }) {
	const path = url.searchParams.get('path') || '';
	const append = url.searchParams.get('append');

	const hasQuery = path.includes('?');
	const apiUrl = `${BASE}${path}${hasQuery ? '&' : '?'}language=en-US${append ? `&append_to_response=${append}` : ''}`;

	const res = await fetch(apiUrl, {
		headers: { Authorization: `Bearer ${TMDB_TOKEN}`, Accept: 'application/json' }
	});

	if (!res.ok) return new Response(res.statusText, { status: res.status });

	return json(await res.json());
}
