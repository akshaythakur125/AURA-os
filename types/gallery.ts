export interface GalleryEntry {
  id: string;
  nickname: string;
  city?: string;
  score: number;
  category: string;
  oneLineVerdict: string;
  strongestSignal: string;
  biggestLeak: string;
  improvement?: number;
  auditId: string;
  createdAt: string;
  reactions: {
    fire: number;
    hundred: number;
    crown: number;
    shock: number;
  };
  viewCount: number;
}

export interface GalleryStats {
  totalEntries: number;
  highestScore: number;
  averageScore: number;
  totalViews: number;
}

export interface GalleryReaction {
  entryId: string;
  reaction: "fire" | "hundred" | "crown" | "shock";
  timestamp: string;
}
