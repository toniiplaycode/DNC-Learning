import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Card,
  InputAdornment,
  Badge,
  Paper,
  Slide,
  Grow,
  CircularProgress,
  Button,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
} from "@mui/material";
import {
  Send,
  Close,
  Search,
  Link as LinkIcon,
  OpenInNew,
  Article,
  School,
  Person,
  Chat as ChatIcon,
  AttachFile,
  EmojiEmotions,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { io, Socket } from "socket.io-client";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { User } from "../../../features/auth/authApiSlice";
import {
  fetchMessagesByClass,
  sendGroupMessage,
  addMessage,
  setError,
} from "../../../features/group-messages/groupMessagesSlice";
import {
  selectAcademicClass,
  selectGroupMessagesByClass,
} from "../../../features/group-messages/groupMessagesSelector";
import { GroupMessage } from "../../../types/groupMessage.types";
import parse, { domToReact } from "html-react-parser";
import { fetchAcademicClassById } from "../../../features/academic-classes/academicClassesSlice";
import { uploadToDrive } from "../../../utils/uploadToDrive";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface AcademicClass {
  id: string;
  classCode: string;
  className: string;
  semester: string;
  status: string;
}

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

const getPageNameFromUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string" || url.trim() === "") return "";

  try {
    if (url.includes("/course") || url.includes("/courses")) {
      return "Khóa học";
    } else if (url.includes("/lesson") || url.includes("/lessons")) {
      return "Bài học";
    } else if (url.includes("/article")) {
      return "Bài viết";
    } else if (url.includes("/document")) {
      return "Tài liệu";
    } else {
      return "Tham khảo";
    }
  } catch (e) {
    return "Tham khảo";
  }
};

const isValidUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== "string" || url.trim() === "") return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch (e) {
    return false;
  }
};

const shortenUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string" || url.trim() === "") return "";

  try {
    const urlObj = new URL(url);
    return `${urlObj.hostname}${urlObj.pathname.substring(0, 20)}${
      urlObj.pathname.length > 20 ? "..." : ""
    }`;
  } catch (e) {
    return url.substring(0, 30) + (url.length > 30 ? "..." : "");
  }
};

interface GroupChatBoxProps {
  open: boolean;
  onClose: () => void;
  socket: Socket | null;
  classId?: string;
  fullWidth?: boolean;
}

const GroupChatBox: React.FC<GroupChatBoxProps> = ({
  open,
  onClose,
  socket,
  classId: propClassId,
  fullWidth = false,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser) as User | null;
  const classId =
    propClassId || currentUser?.userStudentAcademic?.academicClass?.id;
  const [isConnected, setIsConnected] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );

  if (!classId) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          Vui lòng chọn lớp để bắt đầu chat nhóm.
        </Typography>
      </Box>
    );
  }

  useEffect(() => {
    if (!classId) return;
    dispatch(fetchAcademicClassById(parseInt(classId)))
      .unwrap()
      .catch((error) => {
        console.error("Error fetching academic class:", error);
      });
  }, [classId, dispatch]);

  const academicClass = useAppSelector(
    (state) => state.academicClasses.currentClass
  );

  const messagesSelector = React.useMemo(
    () => (classId ? selectGroupMessagesByClass(classId) : undefined),
    [classId]
  );

  const messages = useAppSelector((state) =>
    messagesSelector ? messagesSelector(state) : []
  );

  useEffect(() => {
    if (!classId) return;

    setIsLoading(true);
    dispatch(fetchMessagesByClass(classId))
      .unwrap()
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching group messages:", error);
        dispatch(setError(error.message || "Failed to fetch messages"));
        setIsLoading(false);
      });
  }, [classId, dispatch]);

  useEffect(() => {
    if (!socket || !currentUser?.id || !classId) return;

    console.log("Setting up group chat with:", {
      userId: currentUser.id,
      classId: classId,
    });

    socket.emit("joinClassRoom", { classId }, (response: any) => {
      if (response?.success) {
        console.log("Joined class room:", response);
        setIsConnected(true);
      } else {
        console.error("Failed to join class room");
      }
    });

    socket.on("userJoined", (data) => {
      console.log("User joined:", data);
      if (data.classId === classId) {
        setUsersInRoom((prev) => [...prev, data.userId]);
      }
    });

    socket.on("userLeft", (data) => {
      console.log("User left:", data);
      if (data.classId === classId) {
        setUsersInRoom((prev) => prev.filter((id) => id !== data.userId));
      }
    });

    socket.on("roomUsers", (data) => {
      console.log("Room users:", data);
      if (data.classId === classId) {
        setUsersInRoom(data.users);
      }
    });

    socket.on("newGroupMessage", (newMessage: GroupMessage) => {
      console.log("Received new group message:", newMessage);
      if (newMessage.classId === classId) {
        dispatch(addMessage(newMessage));
        console.log("Added new message to store");
        scrollToBottom();
      } else {
        console.log("Message is for a different class:", newMessage.classId);
      }
    });

    return () => {
      console.log("Cleaning up group chat");
      if (socket) {
        socket.emit("leaveClassRoom", { classId });
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("roomUsers");
        socket.off("newGroupMessage");
      }
    };
  }, [socket, currentUser, classId, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !socket || !currentUser || !classId) {
      console.log("Cannot send message:", {
        hasMessage: !!message.trim(),
        hasSocket: !!socket,
        hasUser: !!currentUser,
        hasClassId: !!classId,
        isConnected,
      });
      return;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = message.match(urlRegex);
    const referenceLink = matches && matches.length > 0 ? matches[0] : null;
    const isOnlyUrl =
      matches && matches.length === 1 && matches[0].trim() === message.trim();
    const messageText = isOnlyUrl ? "" : message.trim();

    const messageData = {
      classId,
      messageText: messageText || " ",
      referenceLink,
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
        role: currentUser.role,
        userStudentAcademic: currentUser.userStudentAcademic,
        userInstructor: currentUser.userInstructor,
      },
    };

    console.log("Sending message:", messageData);

    socket.emit("sendGroupMessage", messageData, (response: any) => {
      if (response?.error) {
        console.error("Error sending message:", response.error);
      } else {
        console.log("Message sent successfully:", response);
        setMessage("");
        scrollToBottom();
      }
    });
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
    if (!selectedFile || !socket || !currentUser || !classId) return;

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
        // Send message with the file link
        const messageData = {
          classId,
          messageText: uploadMessage.trim(),
          referenceLink: response.fileUrl,
          senderId: currentUser.id,
          sender: {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl,
            role: currentUser.role,
            userStudentAcademic: currentUser.userStudentAcademic,
            userInstructor: currentUser.userInstructor,
          },
        };

        socket.emit("sendGroupMessage", messageData, (response: any) => {
          if (response?.error) {
            console.error("Error sending message:", response.error);
          } else {
            console.log("Message sent successfully:", response);
            setMessage("");
            scrollToBottom();
          }
        });
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

  if (!academicClass) {
    return null;
  }

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: fullWidth ? "static" : "fixed",
          bottom: fullWidth ? undefined : 10,
          right: fullWidth ? undefined : 10,
          width: fullWidth ? "100%" : "500px",
          height: fullWidth ? "100vh" : "83.5%",
          zIndex: 99999999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Box>
            <Typography variant="h6">{academicClass?.className}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {academicClass?.classCode} - {academicClass?.semester}
              {!isConnected && " (Đang kết nối lại...)"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", opacity: 0.8 }}
            >
              {usersInRoom.length} người đang online
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                height: "100%",
                gap: 2,
              }}
            >
              <ChatIcon sx={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant="h6" textAlign="center">
                Chưa có tin nhắn nào
              </Typography>
              <Typography
                variant="body2"
                textAlign="center"
                color="text.secondary"
              >
                Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên
              </Typography>
            </Box>
          ) : (
            messages.map((msg: GroupMessage) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.senderId === currentUser?.id
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <Card
                  sx={{
                    maxWidth: "80%",
                    bgcolor:
                      msg.senderId === currentUser?.id ? "#FFF4E5" : "grey.100",
                    color: "text.primary",
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    {msg.senderId !== currentUser?.id && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Avatar
                          src={msg.sender.avatarUrl}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Stack>
                          <Typography variant="subtitle2">
                            {msg.sender.userInstructor?.fullName ||
                              msg.sender.userStudentAcademic?.fullName ||
                              msg.sender.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {msg.sender.role == "instructor"
                              ? "Giảng viên"
                              : "Sinh viên"}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    <div
                      style={{
                        wordBreak: "break-word",
                        fontSize: 16,
                        lineHeight: 1.7,
                      }}
                    >
                      {msg.messageText
                        ? parse(msg.messageText, chatHtmlParserOptions)
                        : null}
                    </div>
                    {isValidUrl(msg.referenceLink) && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          mt: msg.messageText ? 1.5 : 0,
                          pt: msg.messageText ? 1 : 0,
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            mt: 0.5,
                            borderRadius: 2,
                            bgcolor:
                              msg.senderId === currentUser?.id
                                ? "rgba(255, 244, 229, 0.7)"
                                : "rgba(25, 118, 210, 0.05)",
                            border:
                              msg.senderId === currentUser?.id
                                ? "1px solid rgba(255, 244, 229, 0.9)"
                                : "1px solid rgba(25, 118, 210, 0.2)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            position: "relative",
                            overflow: "hidden",
                            "&:hover": {
                              bgcolor:
                                msg.senderId === currentUser?.id
                                  ? "rgba(255, 244, 229, 0.9)"
                                  : "rgba(25, 118, 210, 0.1)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "4px",
                              height: "100%",
                              bgcolor: "primary.main",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                borderRadius: "50%",
                                p: 0.7,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {getPageNameFromUrl(msg.referenceLink) ===
                              "Khóa học" ? (
                                <School fontSize="small" />
                              ) : (
                                <Article fontSize="small" />
                              )}
                            </Box>
                            <Typography
                              variant="subtitle2"
                              color="primary.main"
                            >
                              {getPageNameFromUrl(msg.referenceLink)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontSize: 13,
                              pl: 0.5,
                            }}
                          >
                            {shortenUrl(msg.referenceLink)}
                          </Typography>
                          {msg.referenceLink && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                endIcon={<OpenInNew fontSize="small" />}
                                href={msg.referenceLink}
                                target="_blank"
                                rel="noreferrer"
                                sx={{
                                  textTransform: "none",
                                  mt: 0.5,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  fontWeight: 500,
                                  borderRadius: "8px",
                                }}
                              >
                                Truy cập
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.createdAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
              accept="*/*"
            />
            <Tooltip title="Tải file lên">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                sx={{ mb: 1 }}
              >
                <AttachFile color={isUploading ? "disabled" : "primary"} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chọn emoji">
              <IconButton
                size="small"
                onClick={handleEmojiButtonClick}
                sx={{ mb: 1 }}
              >
                <EmojiEmotions color="primary" />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              size="small"
              multiline
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
                      size="small"
                      onClick={handleSend}
                      disabled={!message.trim() || isUploading}
                    >
                      <Send
                        color={
                          message.trim() && !isUploading
                            ? "primary"
                            : "disabled"
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
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
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Kích thước:{" "}
                {(selectedFile?.size || 0) / 1024 / 1024 > 1
                  ? `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`
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
      </Paper>
    </Slide>
  );
};

export default GroupChatBox;
