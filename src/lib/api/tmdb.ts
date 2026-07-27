import type {
	TmdbMovie,
	TmdbTvShow,
	TmdbMovieDetail,
	TmdbTvDetail,
	TmdbSeasonDetail,
	TmdbPaginatedResponse,
	TmdbGenre,
	TmdbImage,
	TmdbCollection,
	TmdbCollectionSummary
} from '$lib/types/tmdb.d';

export type { TmdbGenre };

const IMG_BASE = 'https://image.tmdb.org/t/p';

export interface EmbedSource {
	id: string;
	name: string;
	movie: (id: number) => string;
	tv: (id: number, season: number, episode: number) => string;
}

export const embedSources: EmbedSource[] = [
	{
		id: 'vidsrc',
		name: 'VidSrc',
		movie: (id) => `https://vidsrc.me/embed/movie/${id}`,
		tv: (id, s, e) => `https://vidsrc.me/embed/tv/${id}/${s}/${e}`
	},
	{
		id: 'multiembed',
		name: 'MultiEmbed',
		movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
		tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
	},
	{
		id: 'smashystream',
		name: 'SmashyStream',
		movie: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
		tv: (id, s, e) =>
			`https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
	},
	{
		id: 'twoembed',
		name: '2Embed',
		movie: (id) => `https://2embed.cc/embed/${id}`,
		tv: (id, s, e) => `https://2embed.cc/embed/tv/${id}/${s}/${e}`
	}
];

async function fetchJson<T>(path: string, append?: string): Promise<T> {
	const params = new URLSearchParams();
	params.set('path', path);
	if (append) params.set('append', append);
	const res = await fetch(`/api/tmdb?${params}`);
	if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
	return res.json();
}

async function fetchMediaList<T extends { media_type?: string }>(
	path: string,
	mediaType: 'movie' | 'tv'
): Promise<TmdbPaginatedResponse<T>> {
	const res = await fetchJson<TmdbPaginatedResponse<T>>(path);
	res.results = res.results.map((r) => ({ ...r, media_type: mediaType })) as T[];
	return res;
}

interface TmdbMultiRaw {
	id: number;
	media_type: 'movie' | 'tv' | 'person';
	title?: string;
	name?: string;
	overview?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	vote_average?: number;
	vote_count?: number;
	popularity?: number;
	release_date?: string;
	first_air_date?: string;
	genre_ids?: number[];
}

export const tmdb = {
	image: {
		poster: (
			p: string,
			s: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'
		) => `${IMG_BASE}/${s}${p}`,
		backdrop: (p: string, s: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') =>
			`${IMG_BASE}/${s}${p}`,
		profile: (p: string, s: 'w45' | 'w185' | 'h632' | 'original' = 'h632') => `${IMG_BASE}/${s}${p}`
	},
	embed: {
		movie: (id: number, source?: EmbedSource) => (source ?? embedSources[0]).movie(id),
		tv: (id: number, season = 1, episode = 1, source?: EmbedSource) =>
			(source ?? embedSources[0]).tv(id, season, episode)
	},
	trending: {
		movies: (t: 'day' | 'week' = 'week', page = 1) =>
			fetchJson<TmdbPaginatedResponse<TmdbMovie>>(`/trending/movie/${t}?page=${page}`),
		tv: (t: 'day' | 'week' = 'week', page = 1) =>
			fetchJson<TmdbPaginatedResponse<TmdbTvShow>>(`/trending/tv/${t}?page=${page}`),
		all: (t: 'day' | 'week' = 'week', page = 1) =>
			fetchJson<TmdbPaginatedResponse<TmdbMovie | TmdbTvShow>>(`/trending/all/${t}?page=${page}`)
	},
	search: {
		multi: async (q: string, p = 1) => {
			const res = await fetchJson<TmdbPaginatedResponse<TmdbMultiRaw>>(
				`/search/multi?query=${encodeURIComponent(q)}&page=${p}`
			);
			res.results = res.results.filter((r) => r.media_type !== 'person');
			return res as unknown as TmdbPaginatedResponse<TmdbMovie | TmdbTvShow>;
		}
	},
	movie: {
		popular: () => fetchMediaList<TmdbMovie>('/movie/popular', 'movie'),
		topRated: () => fetchMediaList<TmdbMovie>('/movie/top_rated', 'movie'),
		nowPlaying: () => fetchMediaList<TmdbMovie>('/movie/now_playing', 'movie'),
		detail: (id: number) =>
			fetchJson<TmdbMovieDetail>(`/movie/${id}`, 'credits,videos,recommendations,similar,images'),
		images: (id: number) =>
			fetchJson<{ backdrops: TmdbImage[]; posters: TmdbImage[] }>(`/movie/${id}/images`),
		collection: (id: number) => fetchJson<TmdbCollection>(`/collection/${id}`),
		search: (q: string, p = 1) =>
			fetchMediaList<TmdbMovie>(`/search/movie?query=${encodeURIComponent(q)}&page=${p}`, 'movie')
	},
	tv: {
		popular: () => fetchMediaList<TmdbTvShow>('/tv/popular', 'tv'),
		topRated: () => fetchMediaList<TmdbTvShow>('/tv/top_rated', 'tv'),
		airingToday: () => fetchMediaList<TmdbTvShow>('/tv/airing_today', 'tv'),
		detail: (id: number) =>
			fetchJson<TmdbTvDetail>(`/tv/${id}`, 'credits,videos,recommendations,similar,images'),
		images: (id: number) =>
			fetchJson<{ backdrops: TmdbImage[]; posters: TmdbImage[] }>(`/tv/${id}/images`),
		search: (q: string, p = 1) =>
			fetchMediaList<TmdbTvShow>(`/search/tv?query=${encodeURIComponent(q)}&page=${p}`, 'tv')
	},
	collection: {
		search: (q: string) =>
			fetchJson<{ results: TmdbCollectionSummary[] }>(
				`/search/collection?query=${encodeURIComponent(q)}`
			)
	},
	season: {
		detail: (tvId: number, seasonNumber: number) =>
			fetchJson<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`)
	},
	genre: {
		movie: () => fetchJson<{ genres: TmdbGenre[] }>(`/genre/movie/list`),
		tv: () => fetchJson<{ genres: TmdbGenre[] }>(`/genre/tv/list`)
	},
	discover: {
		movies: (params: {
			query?: string;
			genreIds?: number[];
			page?: number;
			year?: number;
			rating?: number;
			sortBy?: string;
		}) => {
			const sp = new URLSearchParams({
				page: String(params.page ?? 1),
				sort_by: params.sortBy ?? 'popularity.desc'
			});
			if (params.query) sp.set('with_text_query', params.query);
			if (params.genreIds?.length) sp.set('with_genres', params.genreIds.join(','));
			if (params.year) sp.set('primary_release_year', String(params.year));
			if (params.rating) sp.set('vote_average.gte', String(params.rating));
			return fetchMediaList<TmdbMovie>(`/discover/movie?${sp}`, 'movie');
		},
		tv: (params: {
			query?: string;
			genreIds?: number[];
			page?: number;
			year?: number;
			rating?: number;
			sortBy?: string;
		}) => {
			const sp = new URLSearchParams({
				page: String(params.page ?? 1),
				sort_by: params.sortBy ?? 'popularity.desc'
			});
			if (params.query) sp.set('with_text_query', params.query);
			if (params.genreIds?.length) sp.set('with_genres', params.genreIds.join(','));
			if (params.year) sp.set('first_air_date_year', String(params.year));
			if (params.rating) sp.set('vote_average.gte', String(params.rating));
			return fetchMediaList<TmdbTvShow>(`/discover/tv?${sp}`, 'tv');
		}
	}
};
