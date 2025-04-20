export interface Message {
  id: number;
  messageText: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string;
    userInstructor?: {
      id: number;
      fullName: string;
      professionalTitle: string;
    };
    userStudent?: {
      id: number;
      fullName: string;
    };
  };
}
