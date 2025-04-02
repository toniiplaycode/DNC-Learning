import { User } from "../../../backend/src/entities/User";
import { CourseSection } from "../../../backend/src/entities/CourseSection";

export enum DocumentType {
  PDF = "pdf",
  WORD = "docx",
  EXCEL = "xlsx",
  VIDEO = "video",
  IMAGE = "image",
  OTHER = "other",
}

export interface Document {
  id: number;
  title: string;
  description: string;
  courseSectionId: number;
  fileUrl: string;
  thumbnailUrl?: string;
  filePath?: string;
  fileType: DocumentType;
  fileSize?: number;
  duration?: string;
  instructorId?: number;
  createdAt: string;
  updatedAt: string;
  section?: Partial<CourseSection>;
  instructor?: {
    id: number;
    userId: number;
    user?: {
      id: number;
      username: string;
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export interface DocumentState {
  documents: Document[];
  courseDocuments: Document[];
  sectionDocuments: Document[];
  currentDocument: Document | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface CreateDocumentData {
  title: string;
  description: string;
  courseSectionId: number;
  fileUrl: string;
  thumbnailUrl?: string;
  filePath?: string;
  fileType?: DocumentType;
  fileSize?: number;
  duration?: string;
  instructorId?: number;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}
