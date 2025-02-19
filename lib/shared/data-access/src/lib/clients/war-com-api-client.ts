// eslint-disable-next-line import/no-extraneous-dependencies -- This is a shared utility in the nx mono repo
import { Logger } from '@omniforge/utils';
import axios, { type AxiosInstance } from 'axios';

export interface SearchPayload {
  sortBy: string;
  category: string;
  collections: string[];
  game_systems: string[];
  index: string;
  locale: string;
  page: number;
  perPage: number;
  topics: string[];
}

interface ImageData {
  path: string;
  alt: string | null;
  width: number | string;
  height: number | string;
  focus: string;
}

interface GameSystem {
  light: ImageData;
  dark: ImageData;
}

interface Topic {
  title: string;
  slug: string;
}

export interface NewsArticle {
  title: string;
  slug: string;
  excerpt: string;
  image: ImageData;
  collection: string;
  game_system: GameSystem;
  topics: Topic[];
  date: string;
  interaction_time: string;
  uri: string;
  id: string;
  uuid: string;
  fullUrl?: string;
  content?: string;
}

interface Pagination {
  total_items: number;
  items_per_page: number;
  total_pages: number;
  current_page: number;
}

export interface WarhammerNewsResponse {
  news: readonly NewsArticle[];
  paginate: Pagination;
}

export class WarComApiClient {
  private readonly client: AxiosInstance;
  private static readonly BASE_URL = 'https://www.warhammer-community.com/api';

  constructor() {
    this.client = axios.create({
      baseURL: WarComApiClient.BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async fetchNews(payload: SearchPayload): Promise<WarhammerNewsResponse> {
    try {
      const response = await this.client.post<WarhammerNewsResponse>(
        '/search/news/',
        payload,
      );
      return response.data;
    } catch (error: unknown) {
      Logger.error(`Error fetching news: ${(error as Error).message}`);
      throw new Error('Failed to fetch Warhammer news.');
    }
  }
}
