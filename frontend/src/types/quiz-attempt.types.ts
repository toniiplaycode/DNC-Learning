// Định nghĩa các types
export interface QuizOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderNumber: number;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  questionType: string;
  points: number;
  orderNumber: number;
  options: QuizOption[];
  correctExplanation?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  academicClassId?: number;
  academicClass?: any;
  questions: QuizQuestion[];
}

export interface QuizResponse {
  id: number;
  attemptId: number;
  questionId: number;
  selectedOptionId: number | null;
  score: number | null;
  question: QuizQuestion;
  selectedOption?: QuizOption;
}

export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  startTime: string;
  endTime: string | null;
  score: number | null;
  status: "in_progress" | "completed" | "abandoned";
  quiz: Quiz;
  responses: QuizResponse[];
}
