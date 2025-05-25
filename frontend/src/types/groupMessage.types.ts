export interface GroupMessage {
  id: string;
  senderId: string;
  classId: string;
  messageText: string;
  referenceLink: string | null;
  replyToId: string | null;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    role: string;
    userStudentAcademic?: {
      id: string;
      fullName: string;
      studentId: string;
    } | null;
    userInstructor?: {
      id: string;
      fullName: string;
      professionalTitle: string;
    } | null;
  };
  replyTo: GroupMessage | null;
}
