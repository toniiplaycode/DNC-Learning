import { Course } from "../../../backend/src/entities/Course";
import { User } from "../../../backend/src/entities/User";

export enum CertificateStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

export interface Certificate {
  id: number;
  userId: number;
  courseId: number;
  certificateNumber: string;
  certificateUrl: string;
  issueDate: string;
  expiryDate?: string;
  status: CertificateStatus;
  user?: Partial<User>;
  course?: Partial<Course>;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyCertificateResult {
  valid: boolean;
  status?: CertificateStatus;
  message?: string;
  certificate?: {
    id: number;
    certificateNumber: string;
    issueDate: string;
    expiryDate?: string;
    status: CertificateStatus;
    user: {
      id: number;
      fullName: string;
    };
    course: {
      id: number;
      title: string;
    };
  };
}

export interface CreateCertificateData {
  userId: number;
  courseId: number;
  certificateNumber?: string;
  certificateUrl?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: CertificateStatus;
}

export interface UpdateCertificateData {
  certificateUrl?: string;
  status?: CertificateStatus;
  expiryDate?: string;
}

export interface VerifyCertificateData {
  certificateNumber: string;
}
