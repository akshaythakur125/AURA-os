export interface ProgressComparison {
  id: string;
  beforeAuditId: string;
  afterAuditId: string;
  beforeScore: number;
  afterScore: number;
  scoreDelta: number;
  improvedSignals: string[];
  remainingLeaks: string[];
  summary: string;
  createdAt: string;
}

export interface ProgressStats {
  totalComparisons: number;
  averageImprovement: number;
  bestImprovement: number;
}
