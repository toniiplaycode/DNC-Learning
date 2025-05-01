export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateInstructorData {
  fullName?: string;
  professionalTitle?: string;
  specialization?: string;
  educationBackground?: string;
  teachingExperience?: string;
  bio?: string;
  expertiseAreas?: string;
  certificates?: string;
  linkedinProfile?: string;
  website?: string;
  verificationStatus?: VerificationStatus;
}

export interface UpdateInstructorProfileData {
  user: UpdateUserData;
  instructor: UpdateInstructorData;
}
