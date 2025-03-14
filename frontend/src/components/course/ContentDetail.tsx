import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Card } from "@mui/material";
import { CardContent } from "@mui/material";
import {
  CheckCircleOutline,
  CircleOutlined,
  VideoCall,
} from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { Box } from "@mui/material";
import QuizContent from "./QuizContent";
import AssignmentContent from "./AssignmentContent";
import React, { useState } from "react";

// Thêm nhiều câu hỏi mẫu hơn
const mockQuestions = [
  {
    id: 1,
    content: "useState hook được sử dụng để làm gì?",
    options: [
      "Quản lý side effects",
      "Quản lý state trong functional component",
      "Tối ưu performance",
      "Xử lý routing",
    ],
    correctAnswer: 1,
    explanation:
      "useState là hook cơ bản để quản lý state trong functional component.",
  },
  {
    id: 2,
    content: "useEffect hook được gọi khi nào?",
    options: [
      "Chỉ khi component mount",
      "Sau mỗi lần render",
      "Khi dependencies thay đổi",
      "Tất cả các trường hợp trên",
    ],
    correctAnswer: 3,
    explanation:
      "useEffect có thể được gọi trong cả 3 trường hợp tùy vào cách sử dụng dependencies.",
  },
  {
    id: 3,
    content: "useMemo hook dùng để làm gì?",
    options: [
      "Tối ưu performance bằng cách cache giá trị",
      "Quản lý state",
      "Xử lý side effects",
      "Tạo ref",
    ],
    correctAnswer: 0,
    explanation:
      "useMemo giúp tối ưu performance bằng cách cache giá trị tính toán.",
  },
  {
    id: 4,
    content: "useCallback hook khác gì với useMemo?",
    options: [
      "useCallback cache function, useMemo cache value",
      "useCallback cache value, useMemo cache function",
      "Không có sự khác biệt",
      "Không thể so sánh",
    ],
    correctAnswer: 0,
    explanation:
      "useCallback được sử dụng để cache function references, trong khi useMemo cache giá trị tính toán.",
  },
  {
    id: 5,
    content: "Custom hooks trong React là gì?",
    options: [
      "Các hooks có sẵn của React",
      "Function bắt đầu bằng use và có thể tái sử dụng logic",
      "Class components",
      "Thư viện bên thứ 3",
    ],
    correctAnswer: 1,
    explanation:
      "Custom hooks là các function bắt đầu bằng use và cho phép tái sử dụng logic giữa các components.",
  },
];

// Cập nhật ContentDetail component
const ContentDetail: React.FC<ContentDetailProps> = ({
  content,
}: {
  content: ContentItem;
}) => {
  return (
    <Box>
      {/* Main content area */}
      {content.type === "video" && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", bgcolor: "black", mb: 2 }}>
            {/* Video player component */}
          </Box>
        </Box>
      )}

      {content.type === "meet" && (
        <Box sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <Typography>Link meeting: {content.url}</Typography>
            <Button
              variant="contained"
              startIcon={<VideoCall />}
              onClick={() => window.open(content.url)}
            >
              Tham gia buổi học
            </Button>
          </Stack>
        </Box>
      )}

      {content.type === "quiz" && (
        <Box sx={{ mb: 4 }}>
          <QuizContent
            quizData={{
              id: content.id,
              title: content.title,
              description: content.description,
              timeLimit: 30,
              passingScore: content.passingScore || 70,
              maxAttempts: content.maxAttempts || 2,
              questions: mockQuestions,
            }}
            onComplete={(score) => {
              console.log("Quiz completed with score:", score);
              // Thêm logic cập nhật trạng thái hoàn thành
            }}
          />
        </Box>
      )}

      {content.type === "assignment" && (
        <Box sx={{ mb: 4 }}>
          <AssignmentContent
            assignmentData={{
              id: content.id,
              title: content.title,
              description: content.description,
              dueDate: "23:59 15/03/2024",
              maxFileSize: 10,
              allowedFileTypes: [
                ".pdf",
                ".doc",
                ".docx",
                ".zip",
                ".rar",
                ".js",
                ".ts",
                ".tsx",
              ],
              maxFiles: 5,
            }}
            onSubmit={(files, note) => {
              console.log("Files:", files);
              console.log("Note:", note);
              // Thêm logic xử lý submit
            }}
          />
        </Box>
      )}

      {/* Content description */}
      <Card sx={{ mt: 3, boxShadow: 0 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {content.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              mb: 3,
              color: "text.secondary",
            }}
          >
            {content.description}
          </Typography>

          {content.objectives && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Mục tiêu bài học:
              </Typography>
              <List dense>
                {content.objectives.map((obj, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleOutline color="success" />
                    </ListItemIcon>
                    <ListItemText primary={obj} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {content.prerequisites && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Yêu cầu trước khi học:
              </Typography>
              <List dense>
                {content.prerequisites.map((req, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CircleOutlined sx={{ fontSize: 8 }} />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContentDetail;
