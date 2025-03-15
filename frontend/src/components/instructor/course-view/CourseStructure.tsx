import { CheckCircle, ExpandMore } from "@mui/icons-material";
import { Add, Edit, ExpandLess } from "@mui/icons-material";
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
} from "@mui/material";
import { Box } from "@mui/material";

const CourseStructure = ({
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
}: {
  sections: any;
  handleContentClick: any;
  handleAddSection: any;
  handleSectionToggle: any;
  expandedSections: any;
  handleEditSection: any;
  selectedContent: any;
  getContentIcon: any;
  handleOpenEditContentModal: any;
  handleOpenAddContentModal: any;
}) => {
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
                      </ListItem>
                    ))}
                    <ListItem
                      component="div"
                      onClick={() => handleOpenAddContentModal(section.id)}
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
    </Stack>
  );
};

export default CourseStructure;
