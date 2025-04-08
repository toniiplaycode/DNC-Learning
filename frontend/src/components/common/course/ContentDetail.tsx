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
import ContentDiscussion from "./ContentDiscussion";
import { useEffect, useState } from "react";
import { fetchLessonDiscussions } from "../../../features/discussions/discussionsSlice";
import { useAppDispatch } from "../../../app/hooks";
import { useAppSelector } from "../../../app/hooks";
import { selectLessonDiscussions } from "../../../features/discussions/discussionsSelectors";

// Helper function để lấy file ID từ Google Drive URL
function getFileIdFromUrl(url: string) {
  // Xử lý URL dạng /file/d/{fileId}/view hoặc /presentation/d/{fileId}/edit
  const fileIdMatch = url.match(/\/d\/([^\/]+)/);
  return fileIdMatch ? fileIdMatch[1] : "";
}

// Helper function to render file viewer based on file type
const renderFileViewer = (url: string, title: string, type: string) => {
  const fileId = getFileIdFromUrl(url);

  // Handle specific content types
  switch (type) {
    case "pdf":
      return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            title={title}
            frameBorder="0"
            allowFullScreen
          ></iframe>
          <Stack direction="row" spacing={2} my={2} justifyContent="center">
            <a
              href={`https://drive.google.com/file/d/${fileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="small" variant="contained">
                Mở trong Drive
              </Button>
            </a>
            <a
              href={`https://drive.google.com/uc?export=download&id=${fileId}`}
              download
            >
              <Button size="small" variant="outlined">
                Tải xuống
              </Button>
            </a>
          </Stack>
        </Box>
      );

    case "txt":
      return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            title={title}
            frameBorder="0"
            allowFullScreen
          ></iframe>
          <Stack direction="row" spacing={2} my={2} justifyContent="center">
            <a
              href={`https://drive.google.com/file/d/${fileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="small" variant="contained">
                Mở trong Drive
              </Button>
            </a>
            <a
              href={`https://drive.google.com/uc?export=download&id=${fileId}`}
              download
            >
              <Button size="small" variant="outlined">
                Tải xuống
              </Button>
            </a>
          </Stack>
        </Box>
      );

    case "docx":
    case "xlsx":
    case "slide":
      return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`}
            title={title}
            frameBorder="0"
            allowFullScreen
          ></iframe>
          <Stack direction="row" spacing={2} my={2} justifyContent="center">
            <a
              href={`https://drive.google.com/file/d/${fileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="small" variant="contained">
                Mở trong Drive
              </Button>
            </a>
            <a
              href={`https://drive.google.com/uc?export=download&id=${fileId}`}
              download
            >
              <Button size="small" variant="outlined">
                Tải xuống
              </Button>
            </a>
          </Stack>
        </Box>
      );

    default:
      return (
        <Box
          sx={{
            p: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" gutterBottom>
            Không thể hiển thị trực tiếp tệp này
          </Typography>
          <Stack direction="row" spacing={2} mt={2}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="contained">Mở tệp</Button>
            </a>
            {fileId && (
              <a
                href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                download
              >
                <Button variant="outlined">Tải xuống</Button>
              </a>
            )}
          </Stack>
        </Box>
      );
  }
};

// Cập nhật ContentDetail component
const ContentDetail = ({ content }: { content: any }) => {
  const dispatch = useAppDispatch();
  const lessonDiscussions = useAppSelector(selectLessonDiscussions);
  const [showDiscussion, setShowDiscussion] = useState(false);

  useEffect(() => {
    dispatch(fetchLessonDiscussions(Number(content?.id)));
    if (content.type == "quiz") {
      setShowDiscussion(false);
    } else {
      setShowDiscussion(true);
    }
  }, [dispatch, content?.id]);

  return (
    <Box>
      {/* Main content area */}
      {content.type === "video" && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", mb: 2 }}>
            {content.url && (
              <iframe
                width="100%"
                height="100%"
                src={
                  content.url.includes("youtube.com")
                    ? content.url.replace("watch?v=", "embed/").split("&")[0]
                    : content.url
                }
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
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
            lessonId={content.id}
            setShowDiscussion={setShowDiscussion}
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
              assignmentId: content.assignmentId,
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

      {content.type === "slide" && content.url && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", mb: 2, border: "1px solid #eee" }}>
            {renderFileViewer(content.url, content.title, "slide")}
          </Box>
        </Box>
      )}

      {content.type === "txt" && content.url && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", mb: 2, border: "1px solid #eee" }}>
            {renderFileViewer(content.url, content.title, "txt")}
          </Box>
        </Box>
      )}

      {content.type === "docx" && content.url && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", mb: 2, border: "1px solid #eee" }}>
            {renderFileViewer(content.url, content.title, "docx")}
          </Box>
        </Box>
      )}

      {content.type === "pdf" && content.url && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", mb: 2, border: "1px solid #eee" }}>
            {renderFileViewer(content.url, content.title, "pdf")}
          </Box>
        </Box>
      )}

      {content.type === "xlsx" && content.url && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ aspectRatio: "16/9", mb: 2, border: "1px solid #eee" }}>
            {renderFileViewer(content.url, content.title, "xlsx")}
          </Box>
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
                {content.objectives.map((obj: string, index: number) => (
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

      {showDiscussion && (
        <ContentDiscussion
          lessonId={content.id}
          lessonDiscussions={lessonDiscussions}
        />
      )}
    </Box>
  );
};

export default ContentDetail;
