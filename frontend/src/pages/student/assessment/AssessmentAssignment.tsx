import React from "react";
import AssignmentContent from "../../../components/common/course/AssignmentContent";
import CustomContainer from "../../../components/common/CustomContainer";
import { Card, CardContent } from "@mui/material";
import { Typography } from "@mui/material";

// Mock data cho bài tập
const mockAssignment = {
  id: 1,
  title: "Bài tập: Xây dựng ứng dụng React Hooks",
  description:
    "Trong bài tập này, bạn sẽ áp dụng kiến thức về React Hooks để xây dựng một ứng dụng quản lý công việc (Todo App) đơn giản.",
  dueDate: "2024-04-15T23:59:59",
  points: 100,
  instructions: `
    ## Yêu cầu bài tập
    
    1. Sử dụng useState để quản lý danh sách công việc
    2. Sử dụng useEffect để lưu trữ dữ liệu vào localStorage
    3. Tạo ít nhất một custom hook
    4. Áp dụng useContext để quản lý theme (dark/light)
    
    ## Tiêu chí đánh giá
    
    - Đúng yêu cầu kỹ thuật (60%)
    - Code sạch, rõ ràng (20%)
    - UI/UX (20%)
    
    ## Hình thức nộp bài
    
    Nộp file .zip chứa source code của bạn.
  `,
  attachments: [
    {
      id: 1,
      name: "React_Hooks_Assignment_Guide.pdf",
      type: "pdf",
      size: "1.2 MB",
      url: "/path/to/document.pdf",
    },
    {
      id: 2,
      name: "starter_code.zip",
      type: "zip",
      size: "546 KB",
      url: "/path/to/starter_code.zip",
    },
  ],
  submissionTypes: ["file", "text"],
  maxFileSize: 10, // MB
  allowedFileTypes: [".zip", ".pdf", ".doc", ".docx", ".jpg", ".png"],
};

export const AssessmentAssignment = () => {
  return (
    <CustomContainer>
      <AssignmentContent
        assignmentData={{
          id: 1,
          title: "Bài tập: Xây dựng ứng dụng React Hooks",
          description:
            "Trong bài tập này, bạn sẽ áp dụng kiến thức về React Hooks để xây dựng một ứng dụng quản lý công việc (Todo App) đơn giản.",
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

      {/* Content description */}
      <Card sx={{ mt: 3, boxShadow: 0 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {mockAssignment.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              mb: 3,
              color: "text.secondary",
            }}
          >
            {mockAssignment.description}
          </Typography>
        </CardContent>
      </Card>
    </CustomContainer>
  );
};

// Thêm default export
export default AssessmentAssignment;
