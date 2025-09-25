
export interface GeneratedPost {
  text: string;
  imageUrl: string;
  wordCount: number;
}

export interface HistoryItem extends GeneratedPost {
  id: string;
  theme: string;
  date: string;
}

export interface FormData {
  theme: string;
  details: string;
  generativeLinks: string[];
  pasteLinks: string[];
  wordCount: string;
  imageDescription: string;
}
