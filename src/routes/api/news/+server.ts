import { json } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';

type RawRssItem = {
	title?: string;
	link?: string;
	pubDate?: string;
	description?: string;
	// media:thumbnail/media:content are in namespaced keys when ignoreAttributes=false
	['media:thumbnail']?: { '@_url'?: string } | undefined;
	['media:content']?: { '@_url'?: string } | undefined;
};

// Keywords to filter for movie/TV content
const MOVIE_TV_KEYWORDS = [
	'movie',
	'film',
	'cinema',
	'box office',
	'trailer',
	'tv',
	'series',
	'season',
	'episode',
	'streaming',
	'netflix',
	'hbo',
	'disney',
	'marvel',
	'dc',
	'star wars',
	'premiere',
	'release',
	'cast',
	'director',
	'actor',
	'actress',
	'hollywood',
	'showrunner',
	'adaptation'
];

function isMovieOrTVNews(title: string, description?: string): boolean {
	const text = `${title} ${description || ''}`.toLowerCase();
	return MOVIE_TV_KEYWORDS.some((keyword) => text.includes(keyword));
}

export const GET = async () => {
	const parser = new XMLParser({ ignoreAttributes: false });

	const FEEDS = [
		'https://collider.com/feed/',
		'https://screenrant.com/feed/',
		'https://deadline.com/feed/',
		'https://feeds.feedburner.com/variety/headlines'
	];

	const results = await Promise.allSettled(
		FEEDS.map((url) =>
			fetch(url, {
				headers: { 'User-Agent': 'Mozilla/5.0' }
			}).then((r) => r.text())
		)
	);

	const items = results
		.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
		.flatMap((r) => {
			let parsed: any;
			try {
				parsed = parser.parse(r.value);
			} catch {
				return [] as Array<NewsItem>;
			}

			const channel = parsed?.rss?.channel;
			const source = channel?.title ?? 'Unknown';
			const rawItems = (channel?.item ?? []) as RawRssItem[];

			return rawItems
				.filter((item) => isMovieOrTVNews(item.title ?? '', item.description))
				.map((item) => ({
					title: item.title ?? '',
					link: item.link ?? '#',
					pubDate: item.pubDate ?? '',
					thumbnail: item['media:thumbnail']?.['@_url'] ?? item['media:content']?.['@_url'] ?? null,
					source
				})) as NewsItem[];
		})
		.filter((i) => i.title && i.pubDate)
		.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
		.slice(0, 40);

	// cache on the server/shared cache
	return json(items, {
		headers: { 'Cache-Control': 's-maxage=300' }
	});
};

type NewsItem = {
	title: string;
	link: string;
	pubDate: string;
	thumbnail: string | null;
	source: string;
};
