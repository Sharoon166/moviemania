export interface NewsItem {
	title: string;
	link: string;
	pubDate: string;
	thumbnail: string | null;
	source: string;
}

export async function fetchNews(): Promise<NewsItem[]> {
	const res = await fetch('/api/news');
	if (!res.ok) throw new Error('Failed to fetch news');
	return res.json();
}
