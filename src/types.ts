export interface DocumentTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  content: string;
}

export type PageSize = 'A4' | 'Letter' | 'Legal';
export type PageOrientation = 'portrait' | 'landscape';
export type ThemeMode = 'classic' | 'modern' | 'serif' | 'compact';
