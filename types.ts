
export type ReportType = 'daily' | 'analysis';

export interface ReportData {
  date: string;
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
