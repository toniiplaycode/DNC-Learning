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
  Checkbox,
  IconButton,
  Tooltip,
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
  CheckCircle,
  Lock,
} from "@mui/icons-material";

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
  completed?: boolean;
}

interface Document {
  id: string;
  instructorId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
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
  setActiveTab?: (tab: number) => void;
  onMarkAsCompleted?: (lessonId: string) => void;
  userProgress?: Array<{
    id: string;
    userId: string;
    lessonId: string;
    completedAt: string;
    lastAccessed: string;
    lesson: {
      id: string;
      sectionId: string;
      title: string;
      contentType: string;
      contentUrl: string | null;
      content: string;
      duration: number | null;
      orderNumber: number;
      isFree: boolean;
    };
  }>;
}

const CourseStructure: React.FC<CourseStructureProps> = ({
  sections = [],
  handleLessonClick,
  setActiveTab,
  onMarkAsCompleted,
  userProgress = [],
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(
    (sections || []).reduce(
      (acc, section) => ({ ...acc, [section.id]: true }),
      {}
    )
  );
  const [activeLesson, setActiveLesson] = useState<string | undefined>();

  // Effect để tự động chọn lesson được mở khóa mới nhất và mở section tương ứng
  useEffect(() => {
    if (!sections.length) return;

    const allLessons = sections.flatMap((section) => section.lessons);

    // Tìm lesson được mở khóa mới nhất
    let latestUnlockedLesson = null;
    for (let i = allLessons.length - 1; i >= 0; i--) {
      const lesson = allLessons[i];
      if (!isLessonLocked(lesson.id, 0, i)) {
        latestUnlockedLesson = lesson;
        break;
      }
    }

    if (latestUnlockedLesson) {
      // Set active lesson
      setActiveLesson(latestUnlockedLesson.id);
      handleLessonClick?.(latestUnlockedLesson.id);

      // Chỉ mở section chứa lesson được chọn, đóng tất cả section khác
      const sectionWithActiveLesson = sections.find((section) =>
        section.lessons.some((lesson) => lesson.id === latestUnlockedLesson.id)
      );

      if (sectionWithActiveLesson) {
        // Đóng tất cả section và chỉ mở section chứa lesson được chọn
        const newExpandedSections = sections.reduce(
          (acc, section) => ({
            ...acc,
            [section.id]: section.id === sectionWithActiveLesson.id,
          }),
          {}
        );

        setExpandedSections(newExpandedSections);
      }
    }
  }, [sections]);

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

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(
      (progress) => progress.lessonId === lessonId && progress.completedAt
    );
  };

  const isLessonLocked = (
    lessonId: string,
    sectionIndex: number,
    lessonIndex: number
  ) => {
    // First lesson of first section is always unlocked
    if (sectionIndex === 0 && lessonIndex === 0) return false;

    // Get all lessons in order
    const allLessons = sections.flatMap((section) => section.lessons);
    const currentLessonIndex = allLessons.findIndex(
      (lesson) => lesson.id === lessonId
    );

    // If this is the first lesson, check if it's in the first section
    if (currentLessonIndex === 0) return false;

    // Check if any previous lesson is not completed
    for (let i = 0; i < currentLessonIndex; i++) {
      const previousLesson = allLessons[i];
      if (!isLessonCompleted(previousLesson.id)) {
        return true; // Lock if any previous lesson is not completed
      }
    }

    return false;
  };

  return (
    <List sx={{ width: "100%" }}>
      {sortedSections.map((section, sectionIndex) => (
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
              {section.lessons.map((lesson, lessonIndex) => {
                const completed = isLessonCompleted(lesson.id);
                const locked = isLessonLocked(
                  lesson.id,
                  sectionIndex,
                  lessonIndex
                );

                return (
                  <ListItem
                    key={lesson.id}
                    sx={{
                      pl: 4,
                      cursor: locked ? "not-allowed" : "pointer",
                      bgcolor:
                        activeLesson === lesson.id
                          ? "rgba(25, 118, 210, 0.08)"
                          : "transparent",
                      borderLeft:
                        activeLesson === lesson.id
                          ? "4px solid #ff9f1c"
                          : "none",
                      opacity: locked ? 0.7 : 1,
                    }}
                    onClick={() => {
                      if (!locked) {
                        setActiveLesson(lesson.id);
                        handleLessonClick?.(lesson.id);
                        setActiveTab?.(0);
                      }
                    }}
                  >
                    <ListItemIcon>
                      {locked ? (
                        <Tooltip title="Hoàn thành bài học trước để mở khóa">
                          <Lock color="disabled" />
                        </Tooltip>
                      ) : (
                        getContentIcon(lesson.contentType)
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${section.orderNumber}.${lesson.orderNumber} ${lesson.title}`}
                      secondary={
                        lesson.duration
                          ? `${lesson.duration} phút`
                          : lesson.content
                      }
                      secondaryTypographyProps={{
                        sx: {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: "1.4em",
                          maxHeight: "2.8em",
                        },
                      }}
                    />
                    {!locked && (
                      <Tooltip
                        title={
                          completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"
                        }
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsCompleted?.(lesson.id);
                          }}
                          color={completed ? "success" : "default"}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                );
              })}

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
                      <ListItemText primary={doc.title} />
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
