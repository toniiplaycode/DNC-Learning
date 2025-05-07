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
  CircularProgress,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close,
  Send,
  Circle,
  ArrowBack,
  Person,
  Search,
  SmartToy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  setMessages,
  addMessage,
  setSelectedReceiver,
  markMessageAsRead,
  fetchMessagesByUser,
} from "../../../features/messages/messagesSlice";

import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { selectAllMessages } from "../../../features/messages/messagesSelector";
import ChatErrorBoundary from "./ChatErrorBoundary";
import { fetchUsers } from "../../../features/users/usersApiSlice";
import { selectAllUsers } from "../../../features/users/usersSelectors";
import parse, { domToReact } from "html-react-parser";

// Add CHATBOT constant at the top
const CHATBOT = {
  id: "-1",
  fullName: "DNC Assistant",
  email: "chatbot@dnc.com",
  role: "chatbot",
  avatarUrl: "/src/assets/chatbot.png",
  online: true,
};

interface Message {
  id: number;
  messageText: string;
  isRead: boolean;
  createdAt: string;
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
  messages: Message[];
  unread: number;
}

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

const chatHtmlParserOptions = {
  replace: (domNode: any) => {
    if (domNode.type === "tag") {
      const { name, children } = domNode;
      if (name === "ol" || name === "ul") {
        return (
          <ol style={{ margin: "0 0 0 20px", paddingLeft: "20px" }}>
            {domToReact(children, chatHtmlParserOptions)}
          </ol>
        );
      }
      if (name === "li") {
        return (
          <li style={{ marginBottom: "4px", fontSize: 16 }}>
            {domToReact(children, chatHtmlParserOptions)}
          </li>
        );
      }
      if (name === "p") {
        return (
          <p style={{ margin: "0 0 8px 0", fontSize: 16, lineHeight: 1.7 }}>
            {domToReact(children, chatHtmlParserOptions)}
          </p>
        );
      }
      if (name === "strong" || name === "b") {
        return (
          <strong style={{ fontWeight: 600 }}>
            {domToReact(children, chatHtmlParserOptions)}
          </strong>
        );
      }
    }
  },
};

// Or for a more detailed approach with login prompt:
const ChatBox = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const messages = useAppSelector(selectAllMessages);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isMessagesInitialized, setIsMessagesInitialized] = useState(false);

  // Add new state for chatbot typing
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);

  // Primary useEffect for fetching messages
  useEffect(() => {
    const initializeMessages = async () => {
      if (!currentUser?.id || isMessagesInitialized) return;

      setIsLoadingMessages(true);

      try {
        const userId = Number(currentUser.id);
        if (isNaN(userId)) {
          throw new Error("Invalid user ID");
        }

        const result = await dispatch(fetchMessagesByUser(userId)).unwrap();

        if (result?.length > 0) {
          const processedRooms = processMessages(result);
          setChatRooms(processedRooms);
        }

        setIsMessagesInitialized(true);
      } catch (error) {
        console.error("❌ Failed to fetch messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    initializeMessages();
  }, [currentUser, isMessagesInitialized, dispatch]);

  // Secondary effects that depend on messages being loaded
  useEffect(() => {
    if (!isMessagesInitialized || !messages?.length) return;

    try {
      const processedRooms = processMessages(messages);
      setChatRooms(processedRooms);
    } catch (error) {
      console.error("Error processing messages:", error);
    }
  }, [messages, isMessagesInitialized]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setIsMessagesInitialized(false);
      setChatRooms([]);
      dispatch(setMessages([]));
    };
  }, []);

  const navigate = useNavigate();
  const allUsers = useAppSelector(selectAllUsers);
  const [open, setOpen] = useState(false);
  const [showInstructors, setShowInstructors] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [userInfoOpen, setUserInfoOpen] = useState(false);

  // Keep only one state declaration
  const processMessages = (messages: Message[]) => {
    if (!currentUser?.id || !messages) return [];

    // Create chatbot room first
    const chatbotRoom: ChatbotRoom = {
      id: -1,
      instructor: {
        id: "-1",
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
        })),
      unread: 0,
      isChatbot: true,
    };

    // Process regular messages
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
                otherUser.username,
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
            message.sender.username,
          isRead: message.isRead,
          senderId: message.sender.id,
          receiverId: message.receiver.id,
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

    // Combine chatbot room with other rooms
    return [chatbotRoom, ...Object.values(instructorMessages)];
  };

  // Update the fetch messages effect
  useEffect(() => {
    if (!currentUser?.id) return;

    setIsLoadingMessages(true);
    console.log("🔄 Fetching messages for user:", currentUser.id);

    // Immediate fetch
    dispatch(fetchMessagesByUser(Number(currentUser.id)))
      .unwrap()
      .then((messages) => {
        if (messages?.length > 0) {
          const processedRooms = processMessages(messages);
          setChatRooms(processedRooms);
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching messages:", error);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });
  }, [currentUser, dispatch, navigate]);

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

      // Hide typing indicator when receiving chatbot message
      if (message.sender.id === "-1") {
        setIsChatbotTyping(false);
      }

      setChatRooms((prev) => {
        // Handle chatbot messages
        if (message.sender.id === "-1" || message.receiver.id === "-1") {
          return prev.map((room) => {
            if (room.id === -1) {
              return {
                ...room,
                messages: [
                  ...room.messages,
                  {
                    id: message.id,
                    content: message.messageText,
                    sender:
                      message.sender.id === currentUser.id ? "user" : "support",
                    timestamp: message.createdAt,
                    avatar:
                      message.sender.id === currentUser.id
                        ? currentUser.avatarUrl
                        : CHATBOT.avatarUrl,
                    name:
                      message.sender.id === currentUser.id
                        ? currentUser.username
                        : CHATBOT.fullName,
                    isRead: true,
                    senderId: message.sender.id,
                    receiverId: message.receiver.id,
                  },
                ],
              };
            }
            return room;
          });
        }

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
                message.sender.userStudent?.fullName ||
                message.sender.userInstructor?.fullName ||
                message.sender.username,
              isRead: message.isRead,
              senderId: message.sender.id,
              receiverId: message.receiver.id,
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
                otherUser.username,
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
                  otherUser.username,
                isRead: message.isRead,
                senderId: message.sender.id,
                receiverId: message.receiver.id,
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

    // Trong useEffect xử lý socket
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

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newMessage");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
        setChatRooms([]);
        dispatch(setMessages([]));
        setIsChatbotTyping(false); // Reset typing state on cleanup
      }
    };
  }, [currentUser, dispatch]);

  // Hàm filter chat rooms
  const getFilteredChatRooms = () => {
    let rooms = [...chatRooms];
    if (filterUnread) {
      rooms = rooms.filter((room) => room.unread > 0);
    }
    return sortChatRooms(rooms);
  };

  // Add new state for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof allUsers>([]);

  // Thêm vào phần khai báo state trong ChatBox component
  const [filterUnread, setFilterUnread] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, []);

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

      // Clear chat rooms and messages on unmount
      setChatRooms([]);
      dispatch(setMessages([]));
    };
  }, [currentUser, dispatch]);

  // Add after existing useEffect for messages
  useEffect(() => {
    if (!currentUser.id) return;

    // Create chatbot room
    const chatbotRoom: ChatbotRoom = {
      id: -1,
      instructor: {
        id: CHATBOT.id,
        fullName: CHATBOT.fullName,
        avatarUrl: CHATBOT.avatarUrl,
        role: CHATBOT.role,
        online: true,
      },
      messages: [],
      unread: 0,
      isChatbot: true,
    };

    setChatRooms((prev) => {
      const existingRooms = prev.filter((room) => room.id !== -1);
      return [chatbotRoom, ...existingRooms];
    });
  }, [currentUser]);

  // Process messages into chat rooms
  useEffect(() => {
    if (!messages.length || !currentUser.id) return;

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
  }, [messages, currentUser, selectedRoom?.id]);

  // Update handleSend function
  const handleSend = async () => {
    if (!message.trim() || !selectedRoom || !socketRef.current) return;

    // Handle chatbot messages
    if (selectedRoom.id === -1) {
      console.log("💬 Sending message to chatbot:", {
        message: message.trim(),
        userId: currentUser?.id,
      });

      // Clear input before sending
      const messageText = message.trim();
      setMessage("");

      try {
        // Show typing indicator
        setIsChatbotTyping(true);

        // Only emit message, don't update UI here
        console.log("🚀 Sending to chatbot:", messageText);
        socketRef.current.emit("chatbotMessage", {
          messageText: messageText,
        });

        // Set a backup timeout to turn off typing indicator in case of no response
        setTimeout(() => {
          setIsChatbotTyping(false);
        }, 15000); // 15 seconds timeout
      } catch (error) {
        console.error("Error sending message to chatbot:", error);
        setIsChatbotTyping(false);
      }

      scrollToBottom();
      return;
    }

    if (!currentUser || !message.trim() || !selectedRoom || !socketRef.current)
      return;

    // Create temporary message structure matching Message interface
    const tempMessage: Message = {
      id: Date.now(), // temporary id
      messageText: message.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
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
      messageText: message.trim(),
    });

    // Clear input
    setMessage("");

    // Scroll to bottom
    scrollToBottom();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedRoom?.messages]);

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
                otherUser.username,
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
                  otherUser.username,
                isRead: message.isRead,
                senderId: message.sender.id,
                receiverId: message.receiver.id,
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
  }, [currentUser, dispatch]);

  // Add to your existing socket connection useEffect
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

      // Turn off typing indicator when response is received
      setIsChatbotTyping(false);

      // Add bot response to Redux store
      dispatch(
        addMessage({
          id: response.id,
          messageText: response.messageText,
          isRead: true,
          createdAt: response.createdAt,
          sender: {
            id: "-1",
            username: "DNC Assistant",
            email: "chatbot@dnc.com",
            role: "chatbot",
            avatarUrl: "/chatbot-avatar.png",
          },
          receiver: {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            avatarUrl: currentUser.avatarUrl,
          },
        })
      );

      // Update chat rooms with bot response
      setChatRooms((prev) => {
        return prev.map((room) => {
          if (room.id === -1) {
            return {
              ...room,
              messages: [
                ...room.messages,
                {
                  id: response.id,
                  content: response.messageText,
                  sender: "support",
                  timestamp: response.createdAt,
                  avatar: CHATBOT.avatarUrl,
                  name: CHATBOT.fullName,
                  isRead: true,
                  senderId: "-1",
                  receiverId: currentUser.id,
                },
              ],
            };
          }
          return room;
        });
      });

      scrollToBottom();
    });

    return () => {
      socketRef.current?.off("chatbotResponse");
    };
  }, [currentUser]);

  const handleMarkAsRead = (messageId: number) => {
    if (socketRef.current) {
      console.log("Marking message as read:", messageId);
      socketRef.current.emit("markAsRead", messageId);
    }
  };

  const handleSelectRoom = (room: ChatRoom | ChatbotRoom) => {
    console.log("🔄 Selecting room:", {
      roomId: room.id,
      isChatbot: room.id === -1,
    });

    setSelectedRoom(room);
    setShowInstructors(false);
    setIsChatbotTyping(false); // Reset typing indicator when changing rooms

    // Special handling for chatbot
    if (room.id === -1) {
      console.log("🤖 Selected chatbot room");
      dispatch(setSelectedReceiver("-1"));
      return;
    }

    dispatch(setSelectedReceiver(room.instructor.id));

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

  const handleClose = () => {
    setOpen(false);
    setShowInstructors(true);
    setIsChatbotTyping(false); // Reset typing state when closing chat
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

  // Update socket effect for chatbot messages
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

    // Add error handler
    socketRef.current.on("error", () => {
      setIsChatbotTyping(false); // Turn off typing on error
    });

    return () => {
      socketRef.current?.off("newMessage");
      socketRef.current?.off("error");
      setIsChatbotTyping(false); // Reset on unmount
    };
  }, [currentUser?.id, dispatch]);

  // Add function to calculate total unread messages
  const getTotalUnreadMessages = (rooms: ChatRoom[]) => {
    return rooms.reduce((total, room) => total + (room.unread || 0), 0);
  };

  // Add error handler for socket
  useEffect(() => {
    if (!currentUser?.id || !socketRef.current) return;

    // Add error handler
    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      setIsChatbotTyping(false); // Turn off typing indicator on error
    });

    return () => {
      socketRef.current?.off("error");
      setIsChatbotTyping(false); // Reset on unmount
    };
  }, [currentUser?.id]);

  return (
    <>
      {/* Chat Icon */}
      <Grow in={!open}>
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Badge
            badgeContent={getTotalUnreadMessages(chatRooms)}
            color="error"
            invisible={getTotalUnreadMessages(chatRooms) === 0}
          >
            <ChatIcon />
          </Badge>
        </Fab>
      </Grow>

      {/* Chat Box */}
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 10,
            right: 10,
            width: "500px",
            height: "88%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 99999999,
            borderRadius: 2,
            transformOrigin: "right",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 0.5,
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!showInstructors && (
                <IconButton
                  size="small"
                  sx={{ color: "white", mr: 1 }}
                  onClick={() => setShowInstructors(true)}
                >
                  <ArrowBack />
                </IconButton>
              )}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6">
                    {showInstructors
                      ? "Chọn người để chat"
                      : selectedRoom?.instructor.fullName}
                  </Typography>
                  {!showInstructors && selectedRoom?.instructor.online && (
                    <Circle sx={{ color: "#4caf50", fontSize: 12 }} />
                  )}
                </Box>
                {!showInstructors && selectedRoom?.instructor.role && (
                  <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                    {selectedRoom.instructor.role}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              {!showInstructors && selectedRoom?.instructor.id && (
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    mr: 1,
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  onClick={() => setUserInfoOpen(true)}
                >
                  <Person />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{ color: "white" }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {showInstructors ? (
              <>
                <Box sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filterUnread}
                        onChange={(e) => setFilterUnread(e.target.checked)}
                      />
                    }
                    label="Chỉ hiện tin nhắn chưa đọc"
                  />
                </Box>

                <List sx={{ flex: 1, overflowY: "auto" }}>
                  {isLoadingMessages ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <CircularProgress size={24} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Đang tải tin nhắn...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Chatbot List Item */}
                      <ListItemButton
                        key="chatbot"
                        selected={selectedRoom?.id === -1}
                        onClick={() => {
                          const chatbotRoom = chatRooms.find(
                            (room) => room.id === -1
                          );
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
                            <Typography fontWeight={500}>
                              {CHATBOT.fullName}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              AI Assistant
                            </Typography>
                          }
                        />
                      </ListItemButton>

                      {/* Regular chat rooms */}
                      {(searchQuery ? searchResults : getFilteredChatRooms())
                        .filter((item) => item.id !== -1)
                        .map((item) => {
                          // For existing chat rooms
                          if (!searchQuery) {
                            const lastMessage =
                              item.messages[item.messages.length - 1];
                            return (
                              <ListItemButton
                                key={item.id}
                                onClick={() => handleSelectRoom(item)}
                              >
                                <ListItemAvatar>
                                  <Badge
                                    overlap="circular"
                                    anchorOrigin={{
                                      vertical: "bottom",
                                      horizontal: "right",
                                    }}
                                    variant="dot"
                                    color={
                                      item.instructor.online
                                        ? "success"
                                        : "default"
                                    }
                                  >
                                    <Avatar src={item.instructor.avatarUrl} />
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
                                      <Typography>
                                        {item.instructor.fullName}
                                      </Typography>
                                      {lastMessage && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {formatLastMessageTime(
                                            lastMessage.timestamp
                                          )}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                  secondary={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          maxWidth: "70%",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {lastMessage
                                          ? lastMessage.content
                                          : "Không có tin nhắn"}
                                      </Typography>
                                      {item.unread > 0 && (
                                        <Badge
                                          badgeContent={item.unread}
                                          color="error"
                                        />
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItemButton>
                            );
                          }
                          // For search results
                          const fullName =
                            item.userStudent?.fullName ||
                            item.userInstructor?.fullName ||
                            item.userStudentAcademic?.fullName ||
                            item.username;
                          const role =
                            item.userInstructor?.professionalTitle ||
                            item.role.charAt(0).toUpperCase() +
                              item.role.slice(1);

                          return (
                            <ListItemButton
                              key={item.id}
                              onClick={() => {
                                // Create new chat room if doesn't exist
                                const existingRoom = chatRooms.find(
                                  (room) => room.id === Number(item.id)
                                );
                                if (!existingRoom) {
                                  const newRoom: ChatRoom = {
                                    id: Number(item.id),
                                    instructor: {
                                      id: item.id,
                                      fullName: fullName,
                                      avatarUrl: item.avatarUrl || "",
                                      role: role,
                                      online: false,
                                    },
                                    messages: [],
                                    unread: 0,
                                  };
                                  setChatRooms((prev) => [...prev, newRoom]);
                                  handleSelectRoom(newRoom);
                                } else {
                                  handleSelectRoom(existingRoom);
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar src={item.avatarUrl || ""} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={fullName}
                                secondary={
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {role}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          );
                        })}
                    </>
                  )}
                </List>
              </>
            ) : (
              // Chat room
              <>
                <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                  <Stack spacing={2}>
                    {selectedRoom?.messages
                      .slice() // Create a copy to avoid mutating original array
                      .sort(
                        (a, b) =>
                          new Date(a.timestamp).getTime() -
                          new Date(b.timestamp).getTime()
                      )
                      .map((msg) => (
                        <Box
                          key={msg.id}
                          sx={{
                            display: "flex",
                            justifyContent:
                              msg.sender === "user" ? "flex-end" : "flex-start",
                          }}
                        >
                          <Card
                            sx={{
                              maxWidth: "80%",
                              bgcolor:
                                msg.sender === "user"
                                  ? "primary.main"
                                  : "grey.100",
                            }}
                          >
                            <Box sx={{ p: 2 }}>
                              {msg.sender === "support" && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                  }}
                                >
                                  <Avatar
                                    src={msg.avatar}
                                    sx={{ width: 24, height: 24 }}
                                  />
                                  <Stack>
                                    <Typography variant="subtitle2">
                                      {msg.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {selectedRoom.instructor.role}
                                    </Typography>
                                  </Stack>
                                </Box>
                              )}
                              <div
                                style={{
                                  color:
                                    msg.sender === "user" ? "white" : undefined,
                                  wordBreak: "break-word",
                                  fontSize: 16,
                                  lineHeight: 1.7,
                                }}
                              >
                                {parse(msg.content, chatHtmlParserOptions)}
                              </div>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color={
                                    msg.sender === "user"
                                      ? "white"
                                      : "text.secondary"
                                  }
                                >
                                  {new Date(msg.timestamp).toLocaleString(
                                    "vi-VN",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )}
                                </Typography>
                                {msg.sender === "user" && (
                                  <Typography
                                    variant="caption"
                                    color={
                                      msg.sender === "user"
                                        ? "white"
                                        : "text.secondary"
                                    }
                                  >
                                    {msg.isRead ? "Đã xem" : "Đã gửi"}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Card>
                        </Box>
                      ))}
                    <div ref={messagesEndRef} />
                    {/* Add typing indicator component in the chat messages area */}
                    {selectedRoom?.id === -1 && isChatbotTyping && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          // p: 2,
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

                <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline={true}
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); // Prevent default to avoid newline
                        handleSend();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleSend}
                            disabled={!message.trim()}
                          >
                            <Send
                              color={message.trim() ? "primary" : "disabled"}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
          {selectedRoom && (
            <UserInfoDialog
              open={userInfoOpen}
              onClose={() => setUserInfoOpen(false)}
              user={{
                id: selectedRoom.instructor.id,
                fullName: selectedRoom.instructor.fullName,
                role: selectedRoom.instructor.role,
                avatarUrl: selectedRoom.instructor.avatarUrl,
                email: allUsers.find((u) => u.id === selectedRoom.instructor.id)
                  ?.email,
                phone: allUsers.find((u) => u.id === selectedRoom.instructor.id)
                  ?.phone,
                bio:
                  allUsers.find((u) => u.id === selectedRoom.instructor.id)
                    ?.userInstructor?.bio ||
                  allUsers.find((u) => u.id === selectedRoom.instructor.id)
                    ?.userStudent?.bio,
                occupation: allUsers.find(
                  (u) => u.id === selectedRoom.instructor.id
                )?.userStudent?.occupation,
                educationLevel: allUsers.find(
                  (u) => u.id === selectedRoom.instructor.id
                )?.userStudent?.educationLevel,
                professionalTitle: allUsers.find(
                  (u) => u.id === selectedRoom.instructor.id
                )?.userInstructor?.professionalTitle,
                specialization: allUsers.find(
                  (u) => u.id === selectedRoom.instructor.id
                )?.userInstructor?.specialization,
              }}
            />
          )}
        </Paper>
      </Slide>
    </>
  );
};

// New component in the same file
const UserInfoDialog = ({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    role: string;
    avatarUrl: string;
    email?: string;
    phone?: string;
    bio?: string;
    occupation?: string;
    educationLevel?: string;
    professionalTitle?: string;
    specialization?: string;
  };
}) => {
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
          <Typography color="text.secondary">{user.role}</Typography>
        </Box>

        <Grid container spacing={2}>
          {user.email && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography>{user.email}</Typography>
            </Grid>
          )}

          {user.phone && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Số điện thoại
              </Typography>
              <Typography>{user.phone}</Typography>
            </Grid>
          )}

          {user.professionalTitle && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Chức danh
              </Typography>
              <Typography>{user.professionalTitle}</Typography>
            </Grid>
          )}

          {user.specialization && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Chuyên môn
              </Typography>
              <Typography>{user.specialization}</Typography>
            </Grid>
          )}

          {user.educationLevel && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Trình độ học vấn
              </Typography>
              <Typography>{user.educationLevel}</Typography>
            </Grid>
          )}

          {user.occupation && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Nghề nghiệp
              </Typography>
              <Typography>{user.occupation}</Typography>
            </Grid>
          )}

          {user.bio && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Giới thiệu
              </Typography>
              <Typography>{user.bio}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default function WrappedChatBox() {
  return (
    <ChatErrorBoundary>
      <ChatBox />
    </ChatErrorBoundary>
  );
}
