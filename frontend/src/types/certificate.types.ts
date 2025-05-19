import { Course } from "../../../backend/src/entities/Course";
import { User } from "../../../backend/src/entities/User";

export enum CertificateStatus {
  ACTIVE = "active", // Còn hiệu lực
  EXPIRED = "expired", // Hết hạn
  REVOKED = "revoked", // Đã thu hồi
  PENDING = "pending", // Đang chờ duyệt
  REJECTED = "rejected", // Đã từ chối
  SUSPENDED = "suspended", // Tạm đình chỉ
  RENEWED = "renewed", // Đã gia hạn
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
  user?: any;
  course?: any;
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

export interface CreateMultipleCertificatesData {
  userIds: number[];
  courseId: number;
  issueDate?: Date;
  expiryDate?: Date;
  status?: CertificateStatus;
}
