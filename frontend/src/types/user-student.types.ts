export interface UpdateUserData {
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateStudentData {
  fullName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  educationLevel?: string;
  occupation?: string;
  bio?: string;
  interests?: string;
  address?: string;
  city?: string;
  country?: string;
  learningGoals?: string;
  preferredLanguage?: string;
}

export interface UpdateStudentProfileData {
  user: UpdateUserData;
  student: UpdateStudentData;
}
