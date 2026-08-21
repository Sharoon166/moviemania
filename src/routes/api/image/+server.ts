import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const path = url.searchParams.get('path');
	const size = url.searchParams.get('size') ?? 'w342';

	if (!path) {
		return new Response('Missing path parameter', { status: 400 });
	}

	const imageUrl = `https://image.tmdb.org/t/p/${size}${path}`;

	const res = await fetch(imageUrl);

	if (!res.ok) {
		return new Response('Image not found', { status: res.status });
	}

	const contentType = res.headers.get('content-type') ?? 'image/jpeg';

	return new Response(res.body, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
