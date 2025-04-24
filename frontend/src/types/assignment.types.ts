import { AcademicClass } from "../../../backend/src/entities/AcademicClass";
import { CourseLesson } from "../../../backend/src/entities/CourseLesson";
import { User } from "../../../backend/src/entities/User";

export enum AssignmentType {
  PRACTICE = "practice",
  HOMEWORK = "homework",
  MIDTERM = "midterm",
  FINAL = "final",
  PROJECT = "project",
}

export interface Assignment {
  id: number;
  lessonId: number | null;
  academicClassId: number | null;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  fileRequirements: string;
  assignmentType: AssignmentType;
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;

  // Relationships
  lesson?: CourseLesson;
  academicClass?: AcademicClass;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  userId: number;
  submissionDate: string;
  fileUrl: string;
  comment: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;

  user?: User;
  assignment?: Assignment;
}

export enum SubmissionStatus {
  PENDING = "pending",
  GRADED = "graded",
  LATE = "late",
}

export interface AssignmentsState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  lessonAssignments: Assignment[];
  academicClassAssignments: Assignment[];
  studentAcademicAssignments: Assignment[];
  instructorAcademicClassAssignments: Assignment[];
  assignmentsCourse: Assignment[];
  userSubmissions: AssignmentSubmission[];
  currentSubmission: AssignmentSubmission | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface CreateAssignmentData {
  lessonId?: number;
  academicClassId?: number;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  fileRequirements?: string;
  assignmentType?: AssignmentType;
  startTime?: string;
  endTime?: string;
}

export interface UpdateAssignmentData {
  id?: number;
  title?: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  fileRequirements?: string;
  assignmentType?: AssignmentType;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface CreateSubmissionData {
  assignmentId: number;
  fileUrl: string;
  comment?: string;
}
