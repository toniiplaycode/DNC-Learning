import React, { useState } from "react";
import {
  CheckCircle,
  ExpandMore,
  Add,
  Edit,
  ExpandLess,
  Delete,
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
  Menu,
  MenuItem,
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
  handleOpenAddContentModal: (sectionId: number, type: string) => void;
  onDeleteContent?: (contentId: number, sectionId: number) => void;
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
  onDeleteContent,
}) => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const courseID = Number(id);

  const [openSections, setOpenSections] = useState<number[]>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    null
  );
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

  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    sectionId: number
  ) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedSectionId(sectionId);
    setSelectedContentId(null);
  };

  const handleOpenContentMenu = (
    event: React.MouseEvent<HTMLElement>,
    contentId: number,
    sectionId: number
  ) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedContentId(contentId);
    setSelectedSectionId(sectionId);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedSectionId(null);
    setSelectedContentId(null);
  };

  const handleDeleteSectionClick = (sectionId: number) => {
    setDeleteType("section");
    setItemToDelete({ id: sectionId });
    setOpenDeleteDialog(true);
    handleCloseActionMenu();
  };

  const handleDeleteContentClick = (
    contentId: number,
    sectionId: number,
    isDocument: boolean
  ) => {
    setDeleteType("content Purchased by Tuan Duong from the Noun Project");
    setItemToDelete({ id: contentId, sectionId, isDocument });
    setOpenDeleteDialog(true);
    handleCloseActionMenu();
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    if (deleteType === "section") {
      console.log("Delete section with ID:", itemToDelete.id);
      dispatch(deleteCourseSection(itemToDelete.id)).then(() => {
        dispatch(fetchCourseById(courseID));
        toast.success("Xóa phần học thành công");
      });
    } else if (
      deleteType === "content" &&
      onDeleteContent &&
      itemToDelete.sectionId
    ) {
      onDeleteContent(itemToDelete.id, itemToDelete.sectionId);
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
            {transformedSections.map((section: any) => (
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
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {section.title}
                    </Typography>
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
                            <Typography variant="body2" color="text.secondary">
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
                              handleDeleteContentClick(
                                content.id,
                                section.id,
                                !content.isLesson
                              );
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
                        handleOpenActionMenu(e, section.id);
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
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Menu thêm nội dung */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        {selectedContentId === null && (
          <>
            <MenuItem
              onClick={() => {
                if (selectedSectionId !== null) {
                  handleOpenAddContentModal(selectedSectionId, "video");
                  handleCloseActionMenu();
                }
              }}
            >
              <ListItemIcon>
                <Add color="primary" />
              </ListItemIcon>
              <ListItemText>Thêm bài giảng video</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedSectionId !== null) {
                  handleOpenAddContentModal(selectedSectionId, "slide");
                  handleCloseActionMenu();
                }
              }}
            >
              <ListItemIcon>
                <Add color="primary" />
              </ListItemIcon>
              <ListItemText>Thêm slide</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedSectionId !== null) {
                  handleOpenAddContentModal(selectedSectionId, "quiz");
                  handleCloseActionMenu();
                }
              }}
            >
              <ListItemIcon>
                <Add color="primary" />
              </ListItemIcon>
              <ListItemText>Thêm bài kiểm tra</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedSectionId !== null) {
                  handleOpenAddContentModal(selectedSectionId, "assignment");
                  handleCloseActionMenu();
                }
              }}
            >
              <ListItemIcon>
                <Add color="primary" />
              </ListItemIcon>
              <ListItemText>Thêm bài tập</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

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
