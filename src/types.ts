export interface Question {
  id: number;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index 0-4 for A-E
  explanation?: string;
  points?: number; // Added points per question
}

export interface QuizResult {
  score: number;
  total: number;
  answers: { questionId: number; selectedOption: number; isCorrect: boolean }[];
  pointsEarned: number;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timestamp: any;
}
