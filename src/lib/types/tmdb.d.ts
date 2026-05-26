export interface TmdbMovie {
	id: number;
	title: string;
	original_title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	vote_average: number;
	vote_count: number;
	popularity: number;
	genre_ids: number[];
	media_type: 'movie';
	adult: boolean;
	video: boolean;
}

export interface TmdbTvShow {
	id: number;
	name: string;
	original_name: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	first_air_date: string;
	vote_average: number;
	vote_count: number;
	popularity: number;
	genre_ids: number[];
	media_type: 'tv';
	adult: boolean;
}

export interface TmdbPerson {
	id: number;
	name: string;
	profile_path: string | null;
	known_for_department: string;
	popularity: number;
	media_type: 'person';
}

export type TmdbMedia = TmdbMovie | TmdbTvShow | TmdbPerson;

export interface TmdbPaginatedResponse<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

export interface TmdbGenre {
	id: number;
	name: string;
}

export interface TmdbVideo {
	id: string;
	key: string;
	name: string;
	site: string;
	type: string;
	official: boolean;
}

export interface TmdbCredit {
	id: number;
	cast: TmdbCastMember[];
	crew: TmdbCrewMember[];
}

export interface TmdbCastMember {
	id: number;
	name: string;
	character: string;
	profile_path: string | null;
	order: number;
}

export interface TmdbCrewMember {
	id: number;
	name: string;
	job: string;
	department: string;
	profile_path: string | null;
}

export interface TmdbSeason {
	id: number;
	name: string;
	episode_count: number;
	season_number: number;
	poster_path: string | null;
	air_date: string | null;
	overview: string;
}

export interface TmdbEpisode {
	id: number;
	name: string;
	overview: string;
	still_path: string | null;
	air_date: string;
	episode_number: number;
	season_number: number;
	vote_average: number;
}

export interface TmdbSeasonDetail {
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	air_date: string;
	season_number: number;
	episodes: TmdbEpisode[];
}

export interface TmdbMovieDetail extends Omit<TmdbMovie, 'genre_ids'> {
	genres: TmdbGenre[];
	runtime: number;
	tagline: string;
	budget: number;
	revenue: number;
	credits: TmdbCredit;
	videos: { results: TmdbVideo[] };
	recommendations: TmdbPaginatedResponse<TmdbMovie>;
	similar: TmdbPaginatedResponse<TmdbMovie>;
}

export interface TmdbTvDetail extends Omit<TmdbTvShow, 'genre_ids'> {
	genres: TmdbGenre[];
	seasons: TmdbSeason[];
	episode_run_time: number[];
	number_of_seasons: number;
	number_of_episodes: number;
	credits: TmdbCredit;
	videos: { results: TmdbVideo[] };
	recommendations: TmdbPaginatedResponse<TmdbMovie>;
	similar: TmdbPaginatedResponse<TmdbMovie>;
}
