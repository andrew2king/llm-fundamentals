export interface DailyNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface DailyPaperItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
}

export interface DailyData {
  date: string;
  title: string;
  summary: string;
  news: DailyNewsItem[];
  papers: DailyPaperItem[];
}
