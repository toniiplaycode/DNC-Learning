import { User } from "../../../backend/src/entities/User";

export enum DiscussionStatus {
  ACTIVE = "active",
  HIDDEN = "hidden",
  LOCKED = "locked",
}

export interface Discussion {
  id: number;
  lessonId: number;
  userId: number;
  parentId: number | null;
  content: string;
  status: DiscussionStatus;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  replies?: Discussion[];
}

export interface DiscussionState {
  discussions: Discussion[];
  lessonDiscussions: Discussion[];
  currentDiscussion: Discussion | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface CreateDiscussionData {
  lessonId: number;
  parentId?: number;
  content: string;
  status?: DiscussionStatus;
}

export interface UpdateDiscussionData {
  content?: string;
  status?: DiscussionStatus;
}
