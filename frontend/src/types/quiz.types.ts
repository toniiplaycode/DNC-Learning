import { CourseLesson } from "../../../backend/src/entities/CourseLesson";
import { User } from "../../../backend/src/entities/User";

export enum QuizType {
  PRACTICE = "practice",
  HOMEWORK = "homework",
  MIDTERM = "midterm",
  FINAL = "final",
}

export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
}

export enum AttemptStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
}

// Quiz Entity
export interface Quiz {
  id: number;
  lessonId: number;
  academicClassId?: number;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  attemptsAllowed?: number;
  quizType: QuizType;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  lesson?: Partial<CourseLesson>;
  questions?: QuizQuestion[];
}

// Question Entity
export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  questionType: QuestionType;
  correctExplanation?: string;
  points: number;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
  options?: QuizOption[];
}

// Option Entity
export interface QuizOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
}

// Attempt Entity
export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  startTime: string;
  endTime?: string;
  score?: number;
  status: AttemptStatus;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  quiz?: Quiz;
  responses?: QuizResponse[];
}

// Response Entity
export interface QuizResponse {
  id: number;
  attemptId: number;
  questionId: number;
  selectedOptionId?: number;
  score?: number;
  createdAt: string;
  updatedAt: string;
  question?: QuizQuestion;
  selectedOption?: QuizOption;
}

// Quiz Results
export interface QuizResult {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  startTime: string;
  endTime?: string;
  score: number;
  status: AttemptStatus;
  timeSpent: number;
  passingScore?: number;
  passed: boolean;
  questions: {
    id: number;
    questionText: string;
    points: number;
    selectedOption: {
      id: number;
      text: string;
      isCorrect: boolean;
    } | null;
    correctOption: {
      id: number;
      text: string;
    } | null;
    score: number;
    explanation?: string;
  }[];
}

// State Types
export interface QuizzesState {
  quizzes: Quiz[];
  lessonQuizzes: Quiz[];
  currentQuiz: Quiz | null;
  userAttempts: QuizAttempt[];
  currentAttempt: QuizAttempt | null;
  quizResult: QuizResult | null;
  statusUpdateQuiz: "idle" | "loading" | "succeeded" | "failed";
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// API Request Types
export interface CreateQuizData {
  lessonId: number;
  academicClassId?: number;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  attemptsAllowed?: number;
  quizType?: QuizType;
  startTime?: string;
  endTime?: string;
}

export interface UpdateQuizData {
  id?: number;
  title?: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  attemptsAllowed?: number;
  quizType?: QuizType;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface CreateQuestionData {
  quizId: number;
  questionText: string;
  questionType: QuestionType;
  correctExplanation?: string;
  points?: number;
  orderNumber?: number;
  options?: {
    optionText: string;
    isCorrect: boolean;
    orderNumber?: number;
  }[];
}

export interface SubmitQuizData {
  attemptId: number;
  responses: {
    questionId: number;
    selectedOptionId?: number;
  }[];
}
