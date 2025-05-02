import { UserRole, UserStatus } from 'src/entities/User';
import { VerificationStatus } from 'src/entities/UserInstructor';

export interface CreateInstructorData {
  user: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
    avatarUrl?: string;
  };
  instructor: {
    fullName: string;
    professionalTitle?: string;
    specialization?: string;
    educationBackground?: string;
    teachingExperience?: string;
    bio?: string;
    expertiseAreas?: string;
    certificates?: string;
    linkedinProfile?: string;
    website?: string;
    verificationDocuments?: string;
    verificationStatus?: VerificationStatus;
  };
}
