import { CourseSection } from "../../../backend/src/entities/CourseSection";

export enum DocumentType {
  PDF = "pdf",
  SLIDE = "slide",
  CODE = "code",
  LINK = "link",
  TXT = "txt",
  DOCX = "docx",
  XLSX = "xlsx",
}

export enum DocumentStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
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
  instructorId: number;
  courseSectionId?: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: DocumentType;
  status?: DocumentStatus;
  thumbnailUrl?: string;
  filePath?: string;
  duration?: string;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}
