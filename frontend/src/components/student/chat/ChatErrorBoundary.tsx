import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { useAppSelector } from "../../../app/hooks";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ChatErrorBoundaryClass extends React.Component<
  Props & { isAuthenticated: boolean },
  State
> {
  public state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat error:", error);
    console.error("Error info:", errorInfo);
  }

  render() {
    // Don't show error if user is not authenticated
    if (!this.props.isAuthenticated) {
      return null;
    }

    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography color="error" gutterBottom>
            Đã xảy ra lỗi trong ứng dụng chat
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide authentication state
const ChatErrorBoundary: React.FC<Props> = ({ children }) => {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <ChatErrorBoundaryClass isAuthenticated={!!currentUser}>
      {children}
    </ChatErrorBoundaryClass>
  );
};

export default ChatErrorBoundary;
