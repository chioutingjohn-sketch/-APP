export type ReportType = 'daily' | 'weekly' | 'monthly';

export interface ReportData {
  date: string;
  isWeekly: boolean;
  content: string; // Markdown/Text content
  sources?: Array<{
    title: string;
    url: string;
  }>;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}