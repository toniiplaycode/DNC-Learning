import React, { useState } from "react";
import {
  CheckCircle,
  ExpandMore,
  Add,
  Edit,
  ExpandLess,
  Delete,
  MenuBook,
} from "@mui/icons-material";
import {
  Button,
  CardContent,
  Stack,
  Card,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Box } from "@mui/material";
import { deleteCourseSection } from "../../../features/course-sections/courseSectionApiSlice";
import { useAppDispatch } from "../../../app/hooks";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { deleteCourseLesson } from "../../../features/course-lessons/courseLessonsApiSlice";
import EmptyState from "../../../components/common/EmptyState";

interface CourseStructureProps {
  sections: any[];
  handleContentClick: (content: any) => void;
  handleAddSection: (sectionId?: number) => void;
  handleSectionToggle: (sectionId: number) => void;
  expandedSections: number[];
  handleEditSection: (sectionId: number) => void;
  selectedContent: any;
  getContentIcon?: (type: string, fileType?: string) => React.ReactNode; // Updated signature
  handleOpenEditContentModal: (content: any) => void;
  handleOpenAddContentModal: (sectionId: number) => void;
}

const CourseStructure: React.FC<CourseStructureProps> = ({
  sections,
  handleContentClick,
  handleAddSection,
  handleSectionToggle,
  expandedSections,
  handleEditSection,
  selectedContent,
  getContentIcon,
  handleOpenEditContentModal,
  handleOpenAddContentModal,
}) => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const courseID = Number(id);

  const [openSections, setOpenSections] = useState<number[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<"section" | "content">(
    "section"
  );
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    sectionId?: number;
    isDocument?: boolean;
  }>({ id: 0 });

  // Transform sections to include lessons and sort them
  const transformedSections = sections
    ?.map((section) => ({
      ...section,
      contents: [
        ...section.lessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.contentType,
          duration: lesson.duration ? `${lesson.duration} phút` : null,
          completed: false,
          orderNumber: lesson.orderNumber,
          isLesson: true,
          original: lesson,
        })),
      ].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)), // Sort by orderNumber
    }))
    .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)); // Sort sections by orderNumber

  const handleToggleSection = (sectionId: number) => {
    if (openSections.includes(sectionId)) {
      setOpenSections(openSections.filter((id) => id !== sectionId));
    } else {
      setOpenSections([...openSections, sectionId]);
    }
    handleSectionToggle(sectionId);
  };

  const handleDeleteSectionClick = (sectionId: number) => {
    setDeleteType("section");
    setItemToDelete({ id: sectionId });
    setOpenDeleteDialog(true);
  };

  const handleDeleteContentClick = (contentId: number) => {
    setDeleteType("content");
    setItemToDelete({ id: contentId });
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);

    if (deleteType == "section") {
      console.log("Delete section with ID:", itemToDelete.id);
      dispatch(deleteCourseSection(itemToDelete.id)).then(() => {
        dispatch(fetchCourseById(courseID));
        toast.success("Xóa phần học thành công");
      });
    } else if (deleteType == "content") {
      console.log("Delete content with ID:", itemToDelete.id);
      dispatch(deleteCourseLesson(itemToDelete.id)).then(() => {
        dispatch(fetchCourseById(courseID));
        toast.success("Xóa nội dung thành công");
      });
    }
  };

  return (
    <Stack spacing={3}>
      {/* Course Structure */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Nội dung khóa học</Typography>
            <Button
              startIcon={<Add />}
              size="small"
              onClick={() => handleAddSection()}
            >
              Thêm
            </Button>
          </Box>
          <Stack spacing={2}>
            {!sections || sections.length === 0 ? (
              <EmptyState
                icon={<MenuBook />}
                title="Chưa có nội dung khóa học"
                description="Hãy thêm phần học đầu tiên để bắt đầu xây dựng khóa học của bạn"
              />
            ) : (
              transformedSections.map((section: any) => (
                <Box key={section.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    onClick={() => handleToggleSection(section.id)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      py: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {expandedSections.includes(section.id) ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          Phần {section.orderNumber} - {section.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            ml: 1,
                            mt: 0.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "1.2em",
                            maxHeight: "2.4em",
                          }}
                        >
                          {section.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSection(section.id);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <Tooltip title="Xóa phần học">
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSectionClick(section.id);
                          }}
                          size="small"
                          sx={{ color: "error.main" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>

                  {expandedSections.includes(section.id) && (
                    <List disablePadding>
                      {section.contents.map((content: any) => (
                        <ListItem
                          key={content.id}
                          component="div"
                          onClick={() => handleContentClick(content.original)}
                          sx={{
                            pl: 4,
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                            bgcolor:
                              selectedContent?.id === content.id
                                ? "action.selected"
                                : "inherit",
                          }}
                        >
                          {content.original.isFree && (
                            <Typography
                              sx={{
                                position: "absolute",
                                top: 4,
                                left: 4,
                                transformOrigin: "center",
                                background:
                                  "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                                color: "white",
                                padding: "1px 2px",
                                borderRadius: "6px",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                                zIndex: 1,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                              }}
                              variant="caption"
                            >
                              Free
                            </Typography>
                          )}
                          <ListItemIcon>
                            {content.completed ? (
                              <CheckCircle color="success" />
                            ) : (
                              getContentIcon(content.type, content.fileType)
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={content.title}
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {content.duration
                                  ? `${content.duration}`
                                  : content.type}
                              </Typography>
                            }
                          />
                          <Box onClick={(e) => e.stopPropagation()}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditContentModal(content.original);
                              }}
                              sx={{
                                opacity: 0.6,
                                "&:hover": { opacity: 1 },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Box>
                          <Tooltip title="Xóa nội dung">
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteContentClick(content.id);
                              }}
                              size="small"
                              sx={{ color: "error.main" }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      ))}
                      <ListItem
                        component="div"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddContentModal(section.id);
                        }}
                        sx={{
                          pl: 4,
                          color: "primary.main",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <ListItemIcon>
                          <Add color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Thêm nội dung mới" />
                      </ListItem>
                    </List>
                  )}
                </Box>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          {deleteType === "section" ? "Xóa phần học?" : "Xóa nội dung?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteType === "section"
              ? "Bạn có chắc chắn muốn xóa phần học này? Tất cả nội dung trong phần học sẽ bị xóa và không thể khôi phục."
              : "Bạn có chắc chắn muốn xóa nội dung này? Hành động này không thể hoàn tác."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CourseStructure;
