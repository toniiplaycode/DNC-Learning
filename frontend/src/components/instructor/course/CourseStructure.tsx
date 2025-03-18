import React, { useState } from "react";
import { CheckCircle, ExpandMore } from "@mui/icons-material";
import { Add, Edit, ExpandLess, Delete } from "@mui/icons-material";
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

interface CourseStructureProps {
  sections: any[];
  handleContentClick: (content: any) => void;
  handleAddSection: (sectionId?: number) => void;
  handleSectionToggle: (sectionId: number) => void;
  expandedSections: number[];
  handleEditSection: (sectionId: number) => void;
  selectedContent: any;
  getContentIcon: (type: string) => React.ReactNode;
  handleOpenEditContentModal: (content: any) => void;
  handleOpenAddContentModal: (sectionId: number, type: string) => void;
  onDeleteContent?: (contentId: number, sectionId: number) => void;
  onDeleteSection?: (sectionId: number) => void;
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
  onDeleteSection,
}) => {
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

  // Thêm state cho dialog xác nhận xóa
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<"section" | "content">(
    "section"
  );
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    sectionId?: number;
  }>({ id: 0 });

  const handleToggleSection = (sectionId: number) => {
    if (openSections.includes(sectionId)) {
      setOpenSections(openSections.filter((id) => id !== sectionId));
    } else {
      setOpenSections([...openSections, sectionId]);
    }
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

  // Xử lý khi click vào nút xóa section
  const handleDeleteSectionClick = (sectionId: number) => {
    setDeleteType("section");
    setItemToDelete({ id: sectionId });
    setOpenDeleteDialog(true);
    handleCloseActionMenu();
  };

  // Xử lý khi click vào nút xóa content
  const handleDeleteContentClick = (contentId: number, sectionId: number) => {
    setDeleteType("content");
    setItemToDelete({ id: contentId, sectionId: sectionId });
    setOpenDeleteDialog(true);
    handleCloseActionMenu();
  };

  // Xử lý khi xác nhận xóa
  const handleConfirmDelete = () => {
    // Đóng dialog xác nhận
    setOpenDeleteDialog(false);

    // Xử lý xóa dựa vào deleteType
    if (deleteType === "section" && onDeleteSection) {
      onDeleteSection(itemToDelete.id);
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
            {sections.map((section: any) => (
              <Box key={section.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  onClick={() => handleSectionToggle(section.id)}
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

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* Thêm nút chỉnh sửa section */}
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSection(section.id);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Nút xóa section */}
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

                {/* Phần nội dung section hiện tại giữ nguyên */}
                {expandedSections.includes(section.id) && (
                  <List disablePadding>
                    {section.contents.map((content: any) => (
                      <ListItem
                        key={content.id}
                        component="div"
                        onClick={() => handleContentClick(content)}
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
                            getContentIcon(content.type)
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={content.title}
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {content.duration
                                ? `${content.duration} • ${content.type}`
                                : content.type}
                            </Typography>
                          }
                        />

                        {/* Thêm nút edit cho từng bài học */}
                        <Box onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditContentModal(content);
                            }}
                            sx={{
                              opacity: 0.6,
                              "&:hover": { opacity: 1 },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Nút xóa nội dung */}
                        <Tooltip title="Xóa nội dung">
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContentClick(content.id, section.id);
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
                      onClick={() =>
                        handleOpenAddContentModal(section.id, "video")
                      }
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
                  handleOpenAddContentModal(selectedSectionId, "document");
                  handleCloseActionMenu();
                }
              }}
            >
              <ListItemIcon>
                <Add color="primary" />
              </ListItemIcon>
              <ListItemText>Thêm tài liệu</ListItemText>
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
