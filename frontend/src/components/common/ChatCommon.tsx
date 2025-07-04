import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  TextField,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Card,
  InputAdornment,
  Badge,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Paper,
  Slide,
  Grow,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  CardContent,
  Link,
  Tooltip,
  Popover,
  DialogActions,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close,
  Send,
  Person,
  Search,
  SmartToy,
  Link as LinkIcon,
  OpenInNew,
  Article,
  School,
  AttachFile,
  EmojiEmotions,
  Done,
  DoneAll,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  addMessage,
  setSelectedReceiver,
  markMessageAsRead,
  fetchMessagesByUser,
} from "../../features/messages/messagesSlice";

import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  selectAllMessages,
  selectMessagesLoading,
} from "../../features/messages/messagesSelector";
import { fetchUsers } from "../../features/users/usersApiSlice";
import { selectAllUsers } from "../../features/users/usersSelectors";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import parse, { domToReact } from "html-react-parser";
import { selectCurrentClassInstructor } from "../../features/academic-class-instructors/academicClassInstructorsSelectors";
import { fetchClassInstructorById } from "../../features/academic-class-instructors/academicClassInstructorsSlice";
import GroupChatBox from "../student/chat/GroupChatBox";
import { uploadToDrive } from "../../utils/uploadToDrive";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Message {
  id: number;
  messageText: string;
  isRead: boolean;
  createdAt: string;
  referenceLink?: string;
  sender: {
    id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl: string;
    userStudent?: {
      id: string;
      fullName: string;
      gender: string;
      educationLevel: string;
      occupation: string;
      bio: string;
    };
    userStudentAcademic?: {
      id: string;
      studentCode: string;
      fullName: string;
      academicYear: string;
      status: string;
      academicClass: {
        id: string;
        classCode: string;
        className: string;
      };
    };
    userInstructor?: {
      id: string;
      fullName: string;
      professionalTitle: string;
      specialization?: string;
      bio?: string;
      verificationStatus?: string;
    };
  };
  receiver: {
    id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl: string;
    userStudent?: {
      id: string;
      fullName: string;
    };
    userStudentAcademic?: {
      id: string;
      fullName: string;
      studentCode: string;
    };
    userInstructor?: {
      id: string;
      fullName: string;
      professionalTitle: string;
    };
  };
}

// Add ProcessedMessage interface to match actual implementation
interface ProcessedMessage {
  id: number;
  content: string;
  sender: "user" | "support";
  timestamp: string;
  avatar: string;
  name: string;
  isRead: boolean;
  senderId: string;
  receiverId: string;
  referenceLink?: string;
}

interface Instructor {
  id: number;
  name: string;
  avatar: string;
  role: string;
  online: boolean;
  lastSeen?: string;
}

interface ChatRoom {
  id: number;
  instructor: {
    id: string;
    fullName: string;
    avatarUrl: string;
    role: string;
    online?: boolean; // This would need to come from socket status
  };
  messages: ProcessedMessage[];
  unread: number;
}

// Add CHATBOT constant at the top
const CHATBOT = {
  id: "-1",
  fullName: "DNC Assistant",
  email: "chatbot@dnc.com",
  role: "chatbot",
  avatarUrl: "/src/assets/chatbot.png",
  online: true,
};

// Add ChatbotRoom interface
interface ChatbotRoom extends ChatRoom {
  isChatbot: true;
}

// Thêm hàm để sắp xếp chat rooms
const sortChatRooms = (rooms: ChatRoom[]) => {
  return [...rooms].sort((a, b) => {
    const latestMessageA = a.messages[a.messages.length - 1];
    const latestMessageB = b.messages[b.messages.length - 1];

    if (!latestMessageA) return 1;
    if (!latestMessageB) return -1;

    return (
      new Date(latestMessageB.timestamp).getTime() -
      new Date(latestMessageA.timestamp).getTime()
    );
  });
};

// Thêm hàm format thời gian
const formatLastMessageTime = (timestamp: string) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInHours =
    (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (diffInHours < 48) {
    return "Hôm qua";
  } else {
    return messageDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }
};

// Add this interface for filter options
interface FilterOption {
  value: string;
  label: string;
}

// Add filter options constant
const USER_TYPE_OPTIONS: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "student", label: "Học viên" },
  { value: "student_academic", label: "Sinh viên học thuật" },
  { value: "instructor", label: "Giảng viên" },
  { value: "admin", label: "Quản trị viên" },
];

const chatHtmlParserOptions = {
  replace: (domNode: any) => {
    if (domNode.type === "tag") {
      const { name, children, attribs } = domNode;
      if (name === "ol" || name === "ul") {
        // Style lists better
        return (
          <Box component={name} sx={{ pl: 3, my: 1 }}>
            {domToReact(children, chatHtmlParserOptions)}
          </Box>
        );
      }
    }
    return undefined;
  },
};

// Improved URL validation function
const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== "string" || url.trim() === "") return false;

  try {
    new URL(url);
    // Only consider http and https links valid for security
    return url.startsWith("http://") || url.startsWith("https://");
  } catch (e) {
    return false;
  }
};

// Enhanced function to shorten URLs for display
const shortenUrl = (url: string): string => {
  if (!url || typeof url !== "string" || url.trim() === "") return "";

  try {
    const urlObj = new URL(url);
    // Get hostname and truncate pathname if too long
    const pathname =
      urlObj.pathname.length > 20
        ? urlObj.pathname.substring(0, 20) + "..."
        : urlObj.pathname;
    return `${urlObj.hostname}${pathname}`;
  } catch (e) {
    // Fallback for invalid URLs
    return url.length > 30 ? url.substring(0, 30) + "..." : url;
  }
};

// Or for a more detailed approach with login prompt:
const ChatCommon = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectAllMessages);
  const loading = useAppSelector(selectMessagesLoading);
  const allUsers = useAppSelector(selectAllUsers);
  const currentClassInstructor = useAppSelector(selectCurrentClassInstructor);
  const [showInstructors, setShowInstructors] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [userInfoOpen, setUserInfoOpen] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [chatType, setChatType] = useState<"private" | "group">("private");
  const [selectedClass, setSelectedClass] = useState<{ id: string } | null>(
    null
  );

  // Add chatbot typing state
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);

  // Add state for tracking when new links are added
  const [recentLinkTimestamp, setRecentLinkTimestamp] = useState<number | null>(
    null
  );

  const location = useLocation();

  // Add new state variables inside ChatCommon component
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );

  // Hàm filter chat rooms
  const getFilteredChatRooms = () => {
    let rooms = [...chatRooms];

    // Filter by user type
    if (userTypeFilter !== "all") {
      rooms = rooms.filter((room) => {
        const user = allUsers.find((u) => u.id === room.instructor.id);
        return user?.role === userTypeFilter;
      });
    }

    // Filter unread messages
    if (filterUnread) {
      rooms = rooms.filter((room) => room.unread > 0);
    }

    return sortChatRooms(rooms);
  };

  // Add new state for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof allUsers>([]);

  // Thêm vào phần khai báo state trong ChatCommon component
  const [filterUnread, setFilterUnread] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchClassInstructorById(Number(currentUser?.userInstructor?.id)));
  }, []);

  console.log("currentClassInstructor", currentClassInstructor);

  // Socket connection
  useEffect(() => {
    if (!currentUser?.id) return;

    socketRef.current = io("http://localhost:3000", {
      auth: {
        userId: currentUser.id,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // Handle new messages
    socketRef.current.on("newMessage", (newMessage: Message) => {
      console.log("New message received:", newMessage);
      dispatch(addMessage(newMessage));
    });

    // Handle sent message confirmation
    socketRef.current.on("messageSent", (sentMessage: Message) => {
      console.log("Message sent confirmation:", sentMessage);
      dispatch(addMessage(sentMessage));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser?.id, dispatch]);

  // Process messages into chat rooms
  useEffect(() => {
    if (!messages?.length || !currentUser?.id) return;

    try {
      const processedRooms = processMessages(messages);
      setChatRooms(processedRooms);

      // Update selected room if exists
      if (selectedRoom) {
        const updatedRoom = processedRooms.find(
          (room) => room.id === selectedRoom.id
        );
        if (updatedRoom) {
          setSelectedRoom(updatedRoom);
        }
      }
    } catch (error) {
      console.error("Error processing messages:", error);
    }
  }, [messages, currentUser?.id, selectedRoom?.id]);

  // Handle sending messages
  const handleSend = () => {
    if (!currentUser || !message.trim() || !selectedRoom || !socketRef.current)
      return;

    // Get reference link from message if any (e.g., a URL)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = message.match(urlRegex);
    const referenceLink =
      matches && matches.length > 0 ? matches[0] : undefined;

    // Check if message is only a URL
    const isOnlyUrl =
      matches && matches.length === 1 && matches[0].trim() === message.trim();

    // If it's only a URL, send empty messageText and just the referenceLink
    const messageText = isOnlyUrl ? "" : message.trim();

    // Handle chatbot messages
    if (selectedRoom.id === -1) {
      console.log("💬 Sending message to chatbot:", {
        message: messageText,
        userId: currentUser.id,
        referenceLink,
        isOnlyUrl,
      });

      setMessage("");

      // Show typing indicator
      setIsChatbotTyping(true);

      // Emit chatbot message
      socketRef.current.emit("chatbotMessage", {
        messageText: messageText || " ", // Ensure we send at least a space if empty
        referenceLink,
      });

      scrollToBottom();
      return;
    }

    // Create temporary message structure matching Message interface
    const tempMessage: Message = {
      id: Date.now(), // temporary id
      messageText: messageText,
      isRead: false,
      createdAt: new Date().toISOString(),
      referenceLink,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl,
        userStudent: currentUser.userStudent,
        userStudentAcademic: currentUser.userStudentAcademic,
        userInstructor: currentUser.userInstructor,
      },
      receiver: {
        id: selectedRoom.instructor.id,
        username: selectedRoom.instructor.fullName,
        email: "",
        role: selectedRoom.instructor.role,
        avatarUrl: selectedRoom.instructor.avatarUrl,
      },
    };

    // Add to Redux store immediately
    dispatch(addMessage(tempMessage));

    // Update local state
    setChatRooms((prev) =>
      prev.map((room) => {
        if (room.id === selectedRoom.id) {
          return {
            ...room,
            messages: [
              ...room.messages,
              {
                id: tempMessage.id,
                content: tempMessage.messageText,
                sender: "user",
                timestamp: tempMessage.createdAt,
                avatar: currentUser.avatarUrl,
                name: currentUser.username,
                isRead: false,
                senderId: currentUser.id,
                receiverId: selectedRoom.instructor.id,
                referenceLink: tempMessage.referenceLink || undefined,
              },
            ].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            ),
          };
        }
        return room;
      })
    );

    // Emit message through socket
    socketRef.current.emit("sendMessage", {
      receiverId: selectedRoom.instructor.id,
      messageText: messageText || " ", // Ensure we send at least a space if empty
      referenceLink,
    });

    // Clear input
    setMessage("");

    // Scroll to bottom
    scrollToBottom();
  };

  // Keep only one state declaration
  const processMessages = (messages: Message[]) => {
    if (!currentUser?.id || !messages) return [];

    // Create chatbot room first
    const chatbotRoom: ChatbotRoom = {
      id: -1,
      instructor: {
        id: CHATBOT.id,
        fullName: CHATBOT.fullName,
        avatarUrl: CHATBOT.avatarUrl,
        role: CHATBOT.role,
        online: true,
      },
      messages: messages
        .filter((msg) => msg.sender.id === "-1" || msg.receiver.id === "-1")
        .map((msg) => ({
          id: msg.id,
          content: msg.messageText,
          sender: msg.sender.id === currentUser.id ? "user" : "support",
          timestamp: msg.createdAt,
          avatar:
            msg.sender.id === currentUser.id
              ? currentUser.avatarUrl
              : CHATBOT.avatarUrl,
          name:
            msg.sender.id === currentUser.id
              ? currentUser.username
              : CHATBOT.fullName,
          isRead: true,
          senderId: msg.sender.id,
          receiverId: msg.receiver.id,
          referenceLink: msg.referenceLink || undefined,
        }))
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ), // Sort ascending by time
      unread: 0,
      isChatbot: true,
    };

    const instructorMessages = messages
      .filter(
        (message) => message.sender.id !== "-1" && message.receiver.id !== "-1"
      )
      .reduce((acc, message) => {
        if (!message?.sender?.id || !message?.receiver?.id) return acc;

        const otherUserId =
          message.sender.id === currentUser.id
            ? message.receiver.id
            : message.sender.id;

        if (!acc[otherUserId]) {
          const otherUser =
            message.sender.id === currentUser.id
              ? message.receiver
              : message.sender;

          acc[otherUserId] = {
            id: Number(otherUserId),
            instructor: {
              id: otherUser.id,
              fullName:
                otherUser.userInstructor?.fullName ||
                otherUser.userStudent?.fullName ||
                otherUser.userStudentAcademic?.fullName ||
                otherUser.username, // Fallback to username
              avatarUrl: otherUser.avatarUrl || "",
              role:
                otherUser.userInstructor?.professionalTitle ||
                otherUser.role?.charAt(0).toUpperCase() +
                  otherUser.role?.slice(1),
              online: false,
            },
            messages: [],
            unread: 0,
          };
        }

        acc[otherUserId].messages.push({
          id: message.id,
          content: message.messageText,
          sender: message.sender.id === currentUser.id ? "user" : "support",
          timestamp: message.createdAt,
          avatar: message.sender.avatarUrl,
          name:
            message.sender.userInstructor?.fullName ||
            message.sender.userStudent?.fullName ||
            message.sender.userStudentAcademic?.fullName ||
            message.sender.username, // Fallback to username
          isRead: message.isRead,
          senderId: message.sender.id,
          receiverId: message.receiver.id,
          referenceLink: message.referenceLink || undefined,
        });

        // Sort messages by timestamp after adding new message
        acc[otherUserId].messages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        if (!message.isRead && message.sender.id !== currentUser.id) {
          acc[otherUserId].unread++;
        }

        return acc;
      }, {} as Record<string, ChatRoom>);

    return [chatbotRoom, ...Object.values(instructorMessages)];
  };

  // Return early if no user
  if (!currentUser) {
    return (
      <Grow in={true}>
        <Fab
          color="primary"
          onClick={() => navigate("/login")}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Badge color="error" variant="dot">
            <ChatIcon />
          </Badge>
        </Fab>
      </Grow>
    );
  }

  // Improved scroll to bottom function with longer delay to handle reference links
  const scrollToBottom = () => {
    // Use a multi-stage delay to ensure reference links are rendered
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }

      // Second attempt with longer delay
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }, 200);
  };

  // Make sure scrolling happens after messages update
  useEffect(() => {
    if (selectedRoom?.messages?.length) {
      scrollToBottom();
    }
  }, [selectedRoom?.messages?.length]);

  // Add null checks in useEffect
  useEffect(() => {
    if (!currentUser?.id) return;

    dispatch(fetchMessagesByUser(Number(currentUser.id)));
  }, [dispatch, currentUser?.id]);

  // Update useEffect to process messages when they change
  useEffect(() => {
    if (!messages?.length || !currentUser?.id) {
      console.log("No messages or user to process");
      return;
    }

    try {
      const processedRooms = processMessages(messages);
      if (processedRooms.length > 0) {
        setChatRooms(processedRooms);
      }
    } catch (error) {
      console.error("Error in message processing effect:", error);
    }
  }, [messages, currentUser]);

  // Socket connection effect
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("Connecting to WebSocket...");
    socketRef.current = io("http://localhost:3000", {
      auth: {
        userId: currentUser.id,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // Connection events
    socketRef.current.on("connect", () => {
      console.log("WebSocket Connected!");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection Error:", error.message);
    });

    // Single message handler for both new and sent messages
    socketRef.current.on("newMessage", (message: Message) => {
      console.log("New message received:", message);

      // Turn off typing indicator if message is from chatbot
      if (message.sender.id === "-1") {
        setIsChatbotTyping(false);
      }

      setChatRooms((prev) => {
        const otherUserId =
          message.sender.id === currentUser.id
            ? message.receiver.id
            : message.sender.id;

        // Make a copy of previous rooms
        const updatedRooms = [...prev];
        const roomIndex = updatedRooms.findIndex(
          (room) => room.id === Number(otherUserId)
        );

        if (roomIndex >= 0) {
          // Update existing room
          const room = { ...updatedRooms[roomIndex] };

          // Remove temporary message if this is a confirmation of our own message
          const filteredMessages =
            message.sender.id === currentUser.id
              ? room.messages.filter(
                  (msg) =>
                    !(
                      msg.senderId === currentUser.id &&
                      msg.content === message.messageText &&
                      typeof msg.id === "number" &&
                      msg.id > Date.now() - 5000
                    )
                )
              : room.messages;

          // Add new message
          room.messages = [
            ...filteredMessages,
            {
              id: message.id,
              content: message.messageText,
              sender: message.sender.id === currentUser.id ? "user" : "support",
              timestamp: message.createdAt,
              avatar: message.sender.avatarUrl,
              name:
                message.sender.userInstructor?.fullName ||
                message.sender.userStudent?.fullName ||
                message.sender.username,
              isRead: message.isRead,
              senderId: message.sender.id,
              receiverId: message.receiver.id,
              referenceLink: message.referenceLink || undefined,
            },
          ].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          if (message.sender.id !== currentUser.id) {
            room.unread++;
          }

          updatedRooms[roomIndex] = room;
        } else {
          // Create new room if it doesn't exist
          const otherUser =
            message.sender.id === currentUser.id
              ? message.receiver
              : message.sender;

          updatedRooms.push({
            id: Number(otherUserId),
            instructor: {
              id: otherUser.id,
              fullName:
                otherUser.userInstructor?.fullName ||
                otherUser.userStudent?.fullName ||
                otherUser.userStudentAcademic?.fullName ||
                otherUser.username, // Fallback to username
              avatarUrl: otherUser.avatarUrl,
              role:
                otherUser.userInstructor?.professionalTitle ||
                otherUser.role.charAt(0).toUpperCase() +
                  otherUser.role.slice(1),
              online: false,
            },
            messages: [
              {
                id: message.id,
                content: message.messageText,
                sender:
                  message.sender.id === currentUser.id ? "user" : "support",
                timestamp: message.createdAt,
                avatar: message.sender.avatarUrl,
                name:
                  otherUser.userInstructor?.fullName ||
                  otherUser.userStudent?.fullName ||
                  otherUser.userStudentAcademic?.fullName ||
                  otherUser.username, // Fallback to username
                isRead: message.isRead,
                senderId: message.sender.id,
                receiverId: message.receiver.id,
                referenceLink: message.referenceLink || undefined,
              },
            ],
            unread: message.sender.id !== currentUser.id ? 1 : 0,
          });
        }

        return updatedRooms;
      });

      // Update Redux store after local state
      dispatch(addMessage(message));

      // Scroll to bottom
      scrollToBottom();
    });

    socketRef.current.on(
      "messageRead",
      (data: { messageId: number; readAt: string }) => {
        console.log("Message marked as read:", data);

        // Update Redux store
        dispatch(markMessageAsRead(data.messageId));

        // Update local state
        setChatRooms((prev) =>
          prev.map((room) => ({
            ...room,
            messages: room.messages.map((msg) =>
              msg.id === data.messageId ? { ...msg, isRead: true } : msg
            ),
            unread: room.messages.filter(
              (msg) => !msg.isRead && msg.id !== data.messageId
            ).length,
          }))
        );
      }
    );

    socketRef.current.on("error", () => {
      setIsChatbotTyping(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newMessage");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
      }
      setIsChatbotTyping(false);
    };
  }, [currentUser?.id, dispatch]);

  // Cập nhật useEffect xử lý tin nhắn mới
  useEffect(() => {
    if (!currentUser?.id) return;

    socketRef.current = io("http://localhost:3000", {
      auth: {
        userId: currentUser.id,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    socketRef.current.on("newMessage", (message: Message) => {
      console.log("New message received:", message);

      setChatRooms((prev) => {
        const otherUserId =
          message.sender.id === currentUser.id
            ? message.receiver.id
            : message.sender.id;

        const updatedRooms = [...prev];
        const roomIndex = updatedRooms.findIndex(
          (room) => room.id === Number(otherUserId)
        );

        if (roomIndex >= 0) {
          // Update existing room
          const room = { ...updatedRooms[roomIndex] };

          // Remove room from current position
          updatedRooms.splice(roomIndex, 1);

          // Add new message
          room.messages = [
            ...room.messages,
            {
              id: message.id,
              content: message.messageText,
              sender: message.sender.id === currentUser.id ? "user" : "support",
              timestamp: message.createdAt,
              avatar: message.sender.avatarUrl,
              name:
                message.sender.userStudent?.fullName ||
                message.sender.userInstructor?.fullName ||
                message.sender.username,
              isRead: message.isRead,
              senderId: message.sender.id,
              receiverId: message.receiver.id,
              referenceLink: message.referenceLink || undefined,
            },
          ].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          if (message.sender.id !== currentUser.id) {
            room.unread++;
          }

          // Add room to beginning of array
          updatedRooms.unshift(room);
        } else {
          // Create new room
          const otherUser =
            message.sender.id === currentUser.id
              ? message.receiver
              : message.sender;

          // Add new room to beginning of array
          updatedRooms.unshift({
            id: Number(otherUserId),
            instructor: {
              id: otherUser.id,
              fullName:
                otherUser.userInstructor?.fullName ||
                otherUser.userStudent?.fullName ||
                otherUser.userStudentAcademic?.fullName ||
                otherUser.username, // Fallback to username
              avatarUrl: otherUser.avatarUrl,
              role:
                otherUser.userInstructor?.professionalTitle ||
                otherUser.role.charAt(0).toUpperCase() +
                  otherUser.role.slice(1),
              online: false,
            },
            messages: [
              {
                id: message.id,
                content: message.messageText,
                sender:
                  message.sender.id === currentUser.id ? "user" : "support",
                timestamp: message.createdAt,
                avatar: message.sender.avatarUrl,
                name:
                  otherUser.userInstructor?.fullName ||
                  otherUser.userStudent?.fullName ||
                  otherUser.userStudentAcademic?.fullName ||
                  otherUser.username, // Fallback to username
                isRead: message.isRead,
                senderId: message.sender.id,
                receiverId: message.receiver.id,
                referenceLink: message.referenceLink || undefined,
              },
            ],
            unread: message.sender.id !== currentUser.id ? 1 : 0,
          });
        }

        return updatedRooms;
      });

      dispatch(addMessage(message));
      scrollToBottom();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newMessage");
        socketRef.current.disconnect();
      }
    };
  }, [currentUser?.id, dispatch]);

  const handleMarkAsRead = (messageId: number) => {
    if (socketRef.current) {
      console.log("Marking message as read:", messageId);
      socketRef.current.emit("markAsRead", messageId);
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    dispatch(setSelectedReceiver(room.instructor.id));
    setSelectedRoom(room);
    setShowInstructors(false);
    setSearchQuery(""); // Reset search query when selecting a user

    // Mark unread messages as read
    if (room.unread > 0) {
      room.messages
        .filter((msg) => !msg.isRead && msg.senderId !== currentUser.id)
        .forEach((msg) => {
          if (socketRef.current) {
            socketRef.current.emit("markAsRead", msg.id);
            dispatch(markMessageAsRead(msg.id));
          }
        });

      // Update chat rooms to show messages as read
      setChatRooms((prev) =>
        prev.map((r) => {
          if (r.id === room.id) {
            return {
              ...r,
              unread: 0,
              messages: r.messages.map((msg) => ({
                ...msg,
                isRead: true,
              })),
            };
          }
          return r;
        })
      );
    }
  };

  // Add search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = allUsers.filter((user) => {
      const fullName =
        user.userStudent?.fullName ||
        user.userInstructor?.fullName ||
        user.userStudentAcademic?.fullName ||
        user.username;

      const searchLower = query.toLowerCase();

      return (
        fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    });

    setSearchResults(results);
  };

  // Improve the function to extract URLs from markdown with better regex
  const extractUrlFromMarkdown = (content: string): string | undefined => {
    // Pattern to match markdown links: [text](url)
    const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...content.matchAll(markdownLinkPattern)];

    if (matches.length > 0) {
      console.log("Found markdown link:", matches[0][2]);
      // Return the URL part (the second capture group)
      return matches[0][2];
    }

    // Also try to find plain URLs in the text
    // This regex is more robust for finding URLs in text
    const urlPattern =
      /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;
    const urlMatches = content.match(urlPattern);

    if (urlMatches && urlMatches.length > 0) {
      console.log("Found plain URL:", urlMatches[0]);
      return urlMatches[0];
    }

    return undefined;
  };

  // Update the socket event handler for chatbot responses
  useEffect(() => {
    if (!currentUser?.id || !socketRef.current) return;

    // Handle all new messages
    socketRef.current.on("newMessage", (message: Message) => {
      console.log("📩 New message received:", message);

      // Turn off typing indicator if message is from chatbot
      if (message.sender.id === "-1") {
        setIsChatbotTyping(false);
      }
    });

    // Add chatbot response handler
    socketRef.current.on("chatbotResponse", (response) => {
      console.log("📩 Received chatbot response:", response);
      console.log("Original reference link:", response.referenceLink);

      // Turn off typing indicator when response is received
      setIsChatbotTyping(false);

      // Extract URL from message content if it contains markdown link format
      const extractedUrl = extractUrlFromMarkdown(response.messageText);
      const finalReferenceLink = response.referenceLink || extractedUrl;

      console.log("Extracted URL:", extractedUrl);
      console.log("Final reference link:", finalReferenceLink);

      // Track that we just added a link for delayed rendering
      if (finalReferenceLink) {
        setRecentLinkTimestamp(Date.now());
      }

      // Create the chatbot message with the link
      const chatbotMessage = {
        id: response.id,
        messageText: response.messageText,
        isRead: true,
        createdAt: response.createdAt,
        referenceLink: finalReferenceLink,
        sender: {
          id: "-1",
          username: "DNC Assistant",
          email: "chatbot@dnc.com",
          role: "chatbot",
          avatarUrl: CHATBOT.avatarUrl,
        },
        receiver: {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          role: currentUser.role,
          avatarUrl: currentUser.avatarUrl || "",
        },
      };

      // Add bot response to Redux store
      dispatch(addMessage(chatbotMessage));

      // Direct update to selectedRoom state if we're in chatbot room
      if (selectedRoom?.id === -1) {
        setSelectedRoom((prevRoom) => {
          if (!prevRoom) return prevRoom;

          const processedMessage = {
            id: response.id,
            content: response.messageText,
            sender: "support",
            timestamp: response.createdAt,
            avatar: CHATBOT.avatarUrl,
            name: CHATBOT.fullName,
            isRead: true,
            senderId: "-1",
            receiverId: currentUser.id,
            referenceLink: finalReferenceLink,
          };

          return {
            ...prevRoom,
            messages: [...prevRoom.messages, processedMessage],
          };
        });
      }

      // Update chatRooms with bot response
      setChatRooms((prev) => {
        return prev.map((room) => {
          if (room.id === -1) {
            const processedMessage = {
              id: response.id,
              content: response.messageText,
              sender: "support",
              timestamp: response.createdAt,
              avatar: CHATBOT.avatarUrl,
              name: CHATBOT.fullName,
              isRead: true,
              senderId: "-1",
              receiverId: currentUser.id,
              referenceLink: finalReferenceLink,
            };

            return {
              ...room,
              messages: [...room.messages, processedMessage],
            };
          }
          return room;
        });
      });

      // Use a longer delay to ensure UI updates with link rendering
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }

        // Force a re-render after the link is added
        if (finalReferenceLink) {
          setRecentLinkTimestamp(null);
        }
      }, 300);
    });

    // Add error handler
    socketRef.current.on("error", () => {
      setIsChatbotTyping(false); // Turn off typing on error
    });

    return () => {
      socketRef.current?.off("newMessage");
      socketRef.current?.off("chatbotResponse");
      socketRef.current?.off("error");
      setIsChatbotTyping(false); // Reset on unmount
    };
  }, [currentUser?.id, dispatch]);

  // Add useEffect to handle recent link display
  useEffect(() => {
    // This effect triggers a re-render when a link is added
    if (recentLinkTimestamp) {
      // Force a state update after a delay to ensure link rendering
      const timer = setTimeout(() => {
        console.log("Re-rendering after link added");
        setRecentLinkTimestamp(null);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [recentLinkTimestamp]);

  // Add a function to remove markdown links from text but preserve the content
  const removeMarkdownLinks = (content: string): string => {
    if (!content) return "";

    // Replace markdown links with just their text content
    // [link text](http://example.com) becomes link text
    return content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadDialogOpen(true);
      setUploadMessage(`Đã tải lên file: ${file.name}`);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile || !socketRef.current || !currentUser || !selectedRoom)
      return;

    // Close dialog immediately
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadMessage("");

    // Start upload process
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadToDrive(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success && response.fileUrl) {
        // Create temporary message for immediate UI update
        const tempMessage: Message = {
          id: Date.now(),
          messageText: uploadMessage.trim(),
          isRead: false,
          createdAt: new Date().toISOString(),
          referenceLink: response.fileUrl,
          sender: {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            avatarUrl: currentUser.avatarUrl || "",
            userStudent: currentUser.userStudent,
            userStudentAcademic: currentUser.userStudentAcademic,
            userInstructor: currentUser.userInstructor,
          },
          receiver: {
            id: selectedRoom.instructor.id,
            username: selectedRoom.instructor.fullName,
            email: "",
            role: selectedRoom.instructor.role,
            avatarUrl: selectedRoom.instructor.avatarUrl,
          },
        };

        // Add to Redux store immediately
        dispatch(addMessage(tempMessage));

        // Update local state immediately for sender
        setChatRooms((prev) =>
          prev.map((room) => {
            if (room.id === selectedRoom.id) {
              return {
                ...room,
                messages: [
                  ...room.messages,
                  {
                    id: tempMessage.id,
                    content: tempMessage.messageText,
                    sender: "user",
                    timestamp: tempMessage.createdAt,
                    avatar: currentUser.avatarUrl,
                    name: currentUser.username,
                    isRead: false,
                    senderId: currentUser.id,
                    receiverId: selectedRoom.instructor.id,
                    referenceLink: tempMessage.referenceLink,
                  },
                ].sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                ),
              };
            }
            return room;
          })
        );

        // Send message through socket
        socketRef.current.emit("sendMessage", {
          receiverId: selectedRoom.instructor.id,
          messageText: uploadMessage.trim(),
          referenceLink: response.fileUrl,
        });

        // Scroll to bottom after adding message
        scrollToBottom();
      } else {
        console.error("Upload failed:", response.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadCancel = () => {
    setSelectedFile(null);
    setUploadMessage("");
    setUploadDialogOpen(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setEmojiAnchorEl(null);
  };

  const handleEmojiButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  return (
    <Box sx={{ height: "100%", display: "flex" }}>
      {/* Left Panel - Chat List */}
      <Paper
        elevation={2}
        sx={{
          width: 360,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "4px 0 0 4px",
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
            Tin nhắn
          </Typography>

          {/* Chat Type Tabs - Only show for instructors and students */}
          {currentUser?.role !== "admin" && (
            <Tabs
              value={chatType}
              onChange={(_, newValue) => setChatType(newValue)}
              sx={{ mb: 1 }}
            >
              <Tab
                label="Tin nhắn riêng"
                value="private"
                sx={{ textTransform: "none" }}
              />
              <Tab
                label="Tin nhắn lớp"
                value="group"
                sx={{ textTransform: "none" }}
              />
            </Tabs>
          )}

          {/* Class Selection for Instructors */}
          {chatType === "group" && currentUser?.role === "instructor" && (
            <List sx={{ py: 2, width: "100%" }}>
              {currentClassInstructor?.map((item) => (
                <ListItemButton
                  key={item.academicClass.id}
                  selected={selectedClass?.id === item.academicClass.id}
                  onClick={() =>
                    setSelectedClass({ id: item.academicClass.id })
                  }
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor:
                      selectedClass?.id === item.academicClass.id
                        ? "primary.50"
                        : undefined,
                    border:
                      selectedClass?.id === item.academicClass.id
                        ? "1px solid"
                        : "1px solid #eee",
                    borderColor:
                      selectedClass?.id === item.academicClass.id
                        ? "primary.main"
                        : "#eee",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        fontWeight={600}
                        color={
                          selectedClass?.id === item.academicClass.id
                            ? "primary.main"
                            : undefined
                        }
                      >
                        {item.academicClass.classCode} -{" "}
                        {item.academicClass.className}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {item.academicClass.semester}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
          {chatType === "group" && currentUser?.role !== "instructor" && (
            <List sx={{ p: 0, width: "100%" }}>
              {currentUser?.userStudentAcademic?.academicClass && (
                <ListItemButton selected disabled>
                  <ListItemText
                    primary={
                      <Typography fontWeight={600} color={"primary.main"}>
                        {
                          currentUser.userStudentAcademic.academicClass
                            .classCode
                        }{" "}
                        -{" "}
                        {
                          currentUser.userStudentAcademic.academicClass
                            .className
                        }
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {currentUser.userStudentAcademic.academicClass.semester}
                      </Typography>
                    }
                  />
                </ListItemButton>
              )}
            </List>
          )}
        </Box>

        {/* Only show the rest if chatType is private */}
        {chatType === "private" && (
          <>
            {/* Search and Filters */}
            <Box sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Lọc theo vai trò</InputLabel>
                  <Select
                    value={userTypeFilter}
                    label="Lọc theo vai trò"
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                  >
                    {USER_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={filterUnread}
                      onChange={(e) => setFilterUnread(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Chưa đọc"
                />
              </Box>
            </Box>

            {/* Chat List */}
            <List
              sx={{
                flex: 1,
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
              }}
            >
              <ListItemButton
                key="chatbot"
                selected={selectedRoom?.id === -1}
                onClick={() => {
                  const chatbotRoom = chatRooms.find((room) => room.id === -1);
                  if (chatbotRoom) {
                    handleSelectRoom(chatbotRoom);
                  }
                }}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: (theme) =>
                    selectedRoom?.id === -1
                      ? theme.palette.action.selected
                      : "transparent",
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={CHATBOT.avatarUrl}
                    sx={{ bgcolor: "primary.main" }}
                  >
                    <SmartToy />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography fontWeight={500}>{CHATBOT.fullName}</Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      AI Assistant
                    </Typography>
                  }
                />
              </ListItemButton>

              {(searchQuery ? searchResults : getFilteredChatRooms())
                .filter((item) => item.id !== -1)
                .map((item) => {
                  // For search results, construct chat room structure
                  const roomData = searchQuery
                    ? {
                        id: Number(item.id),
                        instructor: {
                          id: item.id,
                          fullName:
                            item.userInstructor?.fullName ||
                            item.userStudent?.fullName ||
                            item.userStudentAcademic?.fullName ||
                            item.username, // Fallback to username
                          avatarUrl: item.avatarUrl || "", // Provide default empty string
                          role: item.role,
                          online: false,
                        },
                        messages: [],
                        unread: 0,
                      }
                    : item;

                  return (
                    <ListItemButton
                      key={roomData.id}
                      selected={selectedRoom?.id === roomData.id}
                      onClick={() => handleSelectRoom(roomData)}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover" },
                        "&.Mui-selected": { bgcolor: "action.selected" },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          badgeContent={
                            roomData.unread > 0 ? roomData.unread : null
                          }
                          color="error"
                        >
                          <Avatar src={roomData.instructor.avatarUrl || ""} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box>
                              <Typography
                                fontWeight={roomData.unread > 0 ? 600 : 400}
                              >
                                {roomData.instructor.fullName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {USER_TYPE_OPTIONS.find(
                                  (opt) =>
                                    opt.value ===
                                    allUsers.find(
                                      (u) => u.id === roomData.instructor.id
                                    )?.role
                                )?.label || roomData.instructor.role}
                              </Typography>
                            </Box>
                            {roomData.messages.length > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatLastMessageTime(
                                  roomData.messages[
                                    roomData.messages.length - 1
                                  ].timestamp
                                )}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color={
                                roomData.unread > 0
                                  ? "text.primary"
                                  : "text.secondary"
                              }
                              sx={{
                                fontWeight: roomData.unread > 0 ? 500 : 400,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {roomData.messages.length > 0
                                ? roomData.messages[
                                    roomData.messages.length - 1
                                  ].content
                                : "Chưa có tin nhắn"}
                            </Typography>
                            {roomData.instructor.role ===
                              "student_academic" && (
                              <Typography variant="caption" color="primary">
                                {`Mã SV: ${
                                  allUsers.find(
                                    (u) => u.id === roomData.instructor.id
                                  )?.userStudentAcademic?.studentCode || ""
                                }`}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  );
                })}
            </List>
          </>
        )}
      </Paper>

      {/* Right Panel - Chat Content */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0 4px 4px 0",
          borderLeft: "1px solid",
          borderColor: "divider",
        }}
      >
        {chatType === "group" ? (
          currentUser?.role === "instructor" ? (
            selectedClass?.id ? (
              <GroupChatBox
                open={true}
                onClose={() => {}}
                socket={socketRef.current}
                classId={selectedClass.id}
                fullWidth={location.pathname === "/instructor/chats"}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6">
                  Hãy chọn lớp để bắt đầu chat nhóm
                </Typography>
              </Box>
            )
          ) : (
            <GroupChatBox
              open={true}
              onClose={() => {}}
              socket={socketRef.current}
              fullWidth={location.pathname === "/instructor/chats"}
            />
          )
        ) : selectedRoom ? (
          <>
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                borderBottom: "1px solid",
                borderColor: "divider",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar src={selectedRoom.instructor.avatarUrl} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={"500"}>
                    {selectedRoom.instructor.fullName}
                  </Typography>
                  <Typography variant="caption">
                    {selectedRoom.instructor.role === "Student_academic"
                      ? "Sinh viên học thuật"
                      : selectedRoom.instructor.role === "Student"
                      ? "Sinh viên"
                      : selectedRoom.instructor.role === "Snstructor"
                      ? "Giảng viên"
                      : selectedRoom.instructor.role === "Admin"
                      ? "Quản trị viên"
                      : selectedRoom.instructor.role}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                sx={{
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
                onClick={() => setUserInfoOpen(true)}
              >
                <Person />
              </IconButton>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                bgcolor: "grey.50",
                height: "calc(100vh - 280px)",
              }}
            >
              <Stack spacing={2}>
                {selectedRoom.messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.sender !== "user" && (
                      <Avatar
                        src={msg.avatar}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                    )}
                    <Box
                      sx={{
                        maxWidth: "70%",
                        p: 2,
                        bgcolor: msg.sender === "user" ? "#FFF4E5" : "grey.100",
                        color: "text.primary",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                    >
                      <div
                        style={{
                          wordBreak: "break-word",
                          fontSize: 16,
                          lineHeight: 1.7,
                        }}
                      >
                        {msg.content
                          ? parse(
                              removeMarkdownLinks(msg.content),
                              chatHtmlParserOptions
                            )
                          : null}
                      </div>
                      {isValidUrl(msg.referenceLink) && (
                        <Box
                          key={`link-${msg.id}-${
                            recentLinkTimestamp || "default"
                          }`}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            mt: msg.content ? 1.5 : 0,
                            pt: msg.content ? 1 : 0,
                            border: "1px solid",
                            borderColor:
                              msg.sender === "user"
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(25, 118, 210, 0.2)",
                            borderRadius: 1,
                            p: 1.5,
                            backgroundColor:
                              msg.sender === "user"
                                ? "rgba(255, 255, 255, 0.1)"
                                : "rgba(25, 118, 210, 0.05)",
                            mb: 1,
                            animation: "fadeIn 0.5s ease-in-out",
                            "@keyframes fadeIn": {
                              "0%": {
                                opacity: 0,
                                transform: "translateY(10px)",
                              },
                              "100%": {
                                opacity: 1,
                                transform: "translateY(0)",
                              },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                bgcolor:
                                  msg.sender === "user"
                                    ? "primary.light"
                                    : "primary.main",
                                color: "white",
                                borderRadius: "50%",
                                p: 0.7,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {getPageNameFromUrl(msg.referenceLink || "") ===
                              "Khóa học" ? (
                                <School fontSize="small" />
                              ) : (
                                <Article fontSize="small" />
                              )}
                            </Box>
                            <Typography
                              variant="subtitle2"
                              color="primary.main"
                              sx={{ fontWeight: 600 }}
                            >
                              {getPageNameFromUrl(msg.referenceLink || "")}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontSize: 13,
                              pl: 0.5,
                              mb: 1,
                            }}
                          >
                            {shortenUrl(msg.referenceLink || "")}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant={
                                msg.sender === "user" ? "outlined" : "contained"
                              }
                              size="small"
                              color="primary"
                              endIcon={<OpenInNew fontSize="small" />}
                              href={msg.referenceLink || "#"}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                console.log("Link clicked:", msg.referenceLink);
                              }}
                              sx={{
                                textTransform: "none",
                                ...(msg.sender === "user"
                                  ? {
                                      color: "primary.main",
                                      borderColor: "primary.main",
                                      "&:hover": {
                                        borderColor: "primary.dark",
                                        backgroundColor: "primary.lighter",
                                      },
                                    }
                                  : {
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                      fontWeight: 500,
                                      borderRadius: "8px",
                                    }),
                              }}
                            >
                              Truy cập
                            </Button>
                          </Box>
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                          mt: 0.5,
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatLastMessageTime(msg.timestamp)}
                        </Typography>
                        {msg.sender === "user" && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {msg.isRead ? (
                              <DoneAll
                                fontSize="small"
                                color="primary"
                                sx={{ fontSize: 16 }}
                              />
                            ) : (
                              <Done
                                fontSize="small"
                                color="action"
                                sx={{ fontSize: 16 }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
                {/* Add typing indicator for chatbot */}
                {selectedRoom?.id === -1 && isChatbotTyping && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Avatar
                      src={CHATBOT.avatarUrl}
                      sx={{ width: 28, height: 28 }}
                    />
                    <Card
                      sx={{
                        bgcolor: "grey.100",
                        px: 2,
                        py: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <CircularProgress size={8} />
                      <Typography variant="body2" color="text.secondary">
                        Đang suy nghĩ...
                      </Typography>
                    </Card>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  accept="*/*"
                />
                {selectedRoom?.id !== -1 && (
                  <>
                    <Tooltip title="Tải file lên">
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        sx={{ mb: 2 }}
                      >
                        <AttachFile
                          color={isUploading ? "disabled" : "primary"}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chọn emoji">
                      <IconButton
                        size="small"
                        onClick={handleEmojiButtonClick}
                        sx={{ mb: 2 }}
                      >
                        <EmojiEmotions color="primary" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color="primary"
                          onClick={handleSend}
                          disabled={!message.trim() || isUploading}
                        >
                          <Send />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
              {isUploading && (
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "action.hover",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <CircularProgress
                    size={16}
                    variant="determinate"
                    value={uploadProgress}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Đang tải lên file... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Emoji Picker Popover */}
            <Popover
              open={Boolean(emojiAnchorEl)}
              anchorEl={emojiAnchorEl}
              onClose={handleEmojiClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              sx={{
                zIndex: 999999999999,
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={350}
                height={400}
                searchDisabled
                skinTonesDisabled
                previewConfig={{
                  showPreview: false,
                }}
              />
            </Popover>

            {/* Upload Confirmation Dialog */}
            <Dialog
              open={uploadDialogOpen}
              onClose={handleUploadCancel}
              maxWidth="sm"
              fullWidth
              sx={{
                zIndex: 999999999999,
              }}
            >
              <DialogTitle>Xác nhận tải file lên</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    File: {selectedFile?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Kích thước:{" "}
                    {(selectedFile?.size || 0) / 1024 / 1024 > 1
                      ? `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(
                          2
                        )} MB`
                      : `${((selectedFile?.size || 0) / 1024).toFixed(2)} KB`}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Nhập tin nhắn kèm theo file (không bắt buộc)"
                    value={uploadMessage}
                    onChange={(e) => setUploadMessage(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleUploadCancel} color="inherit">
                  Hủy
                </Button>
                <Button
                  onClick={handleUploadConfirm}
                  variant="contained"
                  color="primary"
                >
                  Tải lên
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          // Empty state
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">Chọn một cuộc trò chuyện</Typography>
            <Typography variant="body2">
              Hoặc bắt đầu cuộc trò chuyện mới từ danh sách bên trái
            </Typography>
          </Box>
        )}
      </Paper>

      {/* User Info Dialog */}
      {selectedRoom && (
        <UserInfoDialog
          open={userInfoOpen}
          onClose={() => setUserInfoOpen(false)}
          user={selectedRoom.instructor}
          allUsers={allUsers}
        />
      )}
    </Box>
  );
};

// Update the UserInfoDialog interface
interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    role: string;
    avatarUrl: string;
  };
  allUsers: Array<any>; // Use your User interface type here
}

const UserInfoDialog = ({ open, onClose, user, allUsers }: UserDialogProps) => {
  // Find full user data
  const userData = allUsers.find((u) => u.id === user.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Thông tin người dùng
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 3, mt: 2 }}>
          <Avatar
            src={user.avatarUrl}
            sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
          />
          <Typography variant="h6">{user.fullName}</Typography>
          <Typography variant="subtitle1" color="primary">
            {user.role === "Student"
              ? "Học viên"
              : user.role === "Student_academic"
              ? "Sinh viên học thuật"
              : user.role === "Instructor"
              ? "Giảng viên"
              : user.role === "Admin"
              ? "Quản trị viên"
              : user.role}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Basic Info */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin cơ bản
            </Typography>
            <Paper sx={{ p: 2 }}>
              {userData?.email && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{userData.email}</Typography>
                </Box>
              )}
              {userData?.phone && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography>{userData.phone}</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Student Academic Info */}
          {userData?.userStudentAcademic && (
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Thông tin học thuật
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã sinh viên
                  </Typography>
                  <Typography>
                    {userData.userStudentAcademic.studentCode}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Khóa học
                  </Typography>
                  <Typography>
                    {userData.userStudentAcademic.academicYear}
                  </Typography>
                </Box>

                {userData.userStudentAcademic.academicClass && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mã Lớp
                    </Typography>
                    <Typography>
                      {userData.userStudentAcademic.academicClass.classCode}
                    </Typography>
                  </Box>
                )}
                {userData.userStudentAcademic.academicClass && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lớp
                    </Typography>
                    <Typography>
                      {userData.userStudentAcademic.academicClass.className}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}

          {/* Student Info */}
          {userData?.userStudent && (
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Thông tin học viên
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trình độ học vấn
                  </Typography>
                  <Typography>{userData.userStudent.educationLevel}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nghề nghiệp
                  </Typography>
                  <Typography>{userData.userStudent.occupation}</Typography>
                </Box>
                {userData.userStudent.bio && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Giới thiệu
                    </Typography>
                    <Typography>{userData.userStudent.bio}</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}

          {/* Instructor Info */}
          {userData?.userInstructor && (
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Thông tin giảng viên
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Chức danh
                  </Typography>
                  <Typography>
                    {userData.userInstructor.professionalTitle}
                  </Typography>
                </Box>
                {userData.userInstructor.specialization && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Chuyên môn
                    </Typography>
                    <Typography>
                      {userData.userInstructor.specialization}
                    </Typography>
                  </Box>
                )}
                {userData.userInstructor.bio && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Giới thiệu
                    </Typography>
                    <Typography>{userData.userInstructor.bio}</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

// Fix the getPageNameFromUrl function to handle empty URLs
const getPageNameFromUrl = (url: string): string => {
  if (!url || typeof url !== "string" || url.trim() === "") return "";

  try {
    if (url.includes("/course/")) {
      return "Khóa học";
    } else if (url.includes("/article/")) {
      return "Bài viết";
    } else if (url.includes("/document/")) {
      return "Tài liệu";
    } else if (url.includes("/lesson/")) {
      return "Bài học";
    } else {
      return "Tham khảo";
    }
  } catch (error) {
    return "Tham khảo";
  }
};

export default ChatCommon;
