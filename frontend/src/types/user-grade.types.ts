import { Course } from "../../../backend/src/entities/Course";
import { User } from "../../../backend/src/entities/User";
import { UserInstructor } from "../../../backend/src/entities/UserInstructor";
import { CourseLesson } from "../../../backend/src/entities/CourseLesson";
import { Assignment } from "../../../backend/src/entities/Assignment";
import { Quiz } from "../../../backend/src/entities/Quiz";

export enum GradeType {
  ASSIGNMENT = "assignment",
  QUIZ = "quiz",
  MIDTERM = "midterm",
  FINAL = "final",
  PARTICIPATION = "participation",
}

export interface UserGrade {
  id: number;
  userId: number;
  courseId?: number;
  gradedBy: number;
  lessonId?: number;
  assignmentSubmissionId?: number;
  assignmentId?: number;
  gradeType: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback?: string;
  gradedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
  course?: any;
  instructor?: Partial<UserInstructor>;
  lesson?: Partial<CourseLesson>;
  assignment?: Partial<Assignment>;
  quiz?: Partial<Quiz>;
  assignmentSubmission?: any;
}

export interface UserGradesState {
  grades: UserGrade[];
  instructorGrades: UserGrade[];
  currentGrade: UserGrade | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface CreateUserGradeData {
  userId: number;
  courseId: number;
  gradedBy: number;
  lessonId?: number;
  assignmentId?: number;
  quizId?: number;
  gradeType: GradeType;
  score: number;
  maxScore: number;
  weight?: number;
  feedback?: string;
}

export interface UpdateUserGradeData {
  score?: number;
  maxScore?: number;
  weight?: number;
  feedback?: string;
}

export interface GradeSummary {
  userId: number;
  courseId: number;
  overallGrade: number;
  assignments: {
    average: number;
    totalWeight: number;
    count: number;
  };
  quizzes: {
    average: number;
    totalWeight: number;
    count: number;
  };
  midterm: {
    score: number;
    maxScore: number;
    weight: number;
  };
  final: {
    score: number;
    maxScore: number;
    weight: number;
  };
  participation: {
    score: number;
    maxScore: number;
    weight: number;
  };
  gradesByType: Record<
    GradeType,
    {
      average: number;
      weight: number;
      count: number;
    }
  >;
}

export interface PerformanceStats {
  overallAverage: number;
  courseCount: number;
  gradesByType: Record<string, number>;
  coursePerformance: Array<{
    courseId: number;
    courseTitle: string;
    averageGrade: number;
    gradeCount: number;
  }>;
}
