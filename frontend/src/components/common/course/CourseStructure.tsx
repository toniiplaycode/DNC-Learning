import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip,
  Collapse,
  ListItemButton,
} from "@mui/material";
import {
  PlayCircle,
  Description,
  Quiz,
  ExpandMore,
  ExpandLess,
  InsertDriveFile,
  Assignment,
  TextSnippet,
  TableChart,
  PictureAsPdf,
  Slideshow,
} from "@mui/icons-material";
import { formatFileSize } from "../../../utils/formatters";

interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  contentType: string;
  contentUrl: string | null;
  content: string;
  duration: number | null;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  downloadCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  documents: Document[];
  progress?: number; // Optional progress field
}

interface CourseStructureProps {
  sections: Section[];
  handleLessonClick?: (lessonId: string) => void;
  activeLesson?: number;
}

const CourseStructure: React.FC<CourseStructureProps> = ({
  sections = [],
  handleLessonClick,
  activeLesson,
  setActiveTab,
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(
    (sections || []).reduce(
      (acc, section) => ({ ...acc, [section.id]: true }),
      {}
    )
  );

  // Effect để tự động mở section chứa active lesson
  useEffect(() => {
    if (activeLesson) {
      // Tìm section chứa active lesson
      const sectionWithActiveLesson = sections.find((section) =>
        section.lessons.some((lesson) => lesson.id === activeLesson.toString())
      );

      if (sectionWithActiveLesson) {
        // Đảm bảo section này được mở
        setExpandedSections((prev) => ({
          ...prev,
          [sectionWithActiveLesson.id]: true,
        }));
      }
    }
  }, [activeLesson, sections]);

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <PlayCircle color="primary" />;
      case "quiz":
        return <Quiz color="warning" />;
      case "assignment":
        return <Assignment color="warning" />;
      case "pdf":
        return <PictureAsPdf color="info" />;
      case "docx":
        return <Description color="info" />;
      case "xlsx":
        return <TableChart color="info" />;
      case "txt":
        return <TextSnippet color="info" />;
      case "slide":
        return <Slideshow color="info" />;
      default:
        return <Description color="info" />;
    }
  };

  // Sort sections by orderNumber
  const sortedSections = [...sections].sort(
    (a, b) => a.orderNumber - b.orderNumber
  );

  return (
    <List sx={{ width: "100%" }}>
      {sortedSections.map((section) => (
        <Box
          key={section.id}
          sx={{ mb: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
        >
          <ListItemButton
            onClick={() => handleSectionToggle(section.id)}
            sx={{ bgcolor: "background.paper" }}
          >
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">
                    Phần {section.orderNumber} - {section.title}
                  </Typography>
                  {section.progress !== undefined && (
                    <Chip
                      label={`${section.progress}% hoàn thành`}
                      color={section.progress === 100 ? "success" : "primary"}
                      size="small"
                    />
                  )}
                </Box>
              }
              secondary={section.description}
            />
            {expandedSections[section.id] ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse
            in={expandedSections[section.id]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {section.lessons.map((lesson) => (
                <ListItem
                  key={lesson.id}
                  sx={{
                    pl: 4,
                    cursor: "pointer",
                    bgcolor:
                      activeLesson === lesson.id
                        ? "rgba(25, 118, 210, 0.08)"
                        : "transparent",
                    borderLeft:
                      activeLesson === lesson.id ? "4px solid #ff9f1c" : "none",
                  }}
                  onClick={() => {
                    handleLessonClick?.(lesson.id);
                    setActiveTab?.(0);
                  }}
                >
                  <ListItemIcon>
                    {getContentIcon(lesson.contentType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${section.orderNumber}.${lesson.orderNumber} ${lesson.title}`}
                    secondary={
                      lesson.duration
                        ? `${lesson.duration} phút`
                        : lesson.content
                    }
                  />
                </ListItem>
              ))}

              {section.documents && section.documents.length > 0 && (
                <>
                  <ListItem sx={{ pl: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tài liệu học tập
                    </Typography>
                  </ListItem>
                  {section.documents.map((doc) => (
                    <ListItem
                      key={doc.id}
                      sx={{
                        pl: 6,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                      onClick={() => {
                        setActiveTab?.(1);
                      }}
                    >
                      <ListItemIcon>
                        <InsertDriveFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.title}
                        secondary={`${doc.fileType.toUpperCase()} • ${formatFileSize(
                          doc.fileSize
                        )}`}
                      />
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          </Collapse>
        </Box>
      ))}
    </List>
  );
};

export default CourseStructure;
