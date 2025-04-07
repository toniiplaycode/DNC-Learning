import { User } from "../../../backend/src/entities/User";
import { Assignment } from "../../../backend/src/entities/Assignment";

export enum SubmissionStatus {
  SUBMITTED = "submitted",
  GRADED = "graded",
  LATE = "late",
  RESUBMIT = "resubmit",
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  userId: number;
  submissionText: string | null;
  fileUrl: string | null;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  assignment?: Assignment;
}

export interface AssignmentSubmissionState {
  submissions: AssignmentSubmission[];
  userSubmissions: AssignmentSubmission[];
  assignmentSubmissions: AssignmentSubmission[];
  currentSubmission: AssignmentSubmission | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface CreateSubmissionData {
  assignmentId: number;
  submissionText?: string;
  fileUrl?: string;
  status?: SubmissionStatus;
}

export interface UpdateSubmissionData {
  submissionText?: string;
  fileUrl?: string;
  status?: SubmissionStatus;
}

export interface GradeSubmissionData {
  score: number;
  feedback?: string;
  status?: SubmissionStatus;
}
