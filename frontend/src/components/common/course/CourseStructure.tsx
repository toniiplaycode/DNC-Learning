import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  PlayCircle,
  Description,
  Assignment,
  Quiz,
  VideoCall,
  MenuBook,
  Link as LinkIcon,
  CheckCircle,
  Lock,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

interface ContentItem {
  id: number;
  type:
    | "video"
    | "slide"
    | "meet"
    | "quiz"
    | "assignment"
    | "document"
    | "link";
  title: string;
  description: string;
  duration?: string;
  url: string;
  completed: boolean;
  locked: boolean;
  maxAttempts?: number;
  passingScore?: number;
  objectives?: string[];
  prerequisites?: string[];
  keywords?: string[];
}

interface Section {
  id: number;
  title: string;
  progress: number;
  contents: ContentItem[];
  materials?: {
    id: number;
    title: string;
    type: string;
    url: string;
  }[];
}

interface CourseStructureProps {
  sections: Section[];
  handleContentClick: (content: ContentItem) => void;
}

const CourseStructure: React.FC<CourseStructureProps> = ({
  sections,
  handleContentClick,
}) => {
  const [expandedSections, setExpandedSections] = useState<number[]>(
    sections.map((section) => section.id)
  );

  const handleSectionToggle = (sectionId: number) => {
    setExpandedSections((prevExpanded) =>
      prevExpanded.includes(sectionId)
        ? prevExpanded.filter((id) => id !== sectionId)
        : [...prevExpanded, sectionId]
    );
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle color="primary" />;
      case "slide":
        return <Description color="info" />;
      case "assignment":
        return <Assignment color="warning" />;
      case "quiz":
        return <Quiz color="error" />;
      case "meet":
        return <VideoCall color="secondary" />;
      case "document":
        return <MenuBook color="success" />;
      case "link":
        return <LinkIcon color="info" />;
      default:
        return <Description />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Nội dung khóa học
      </Typography>
      <Stack spacing={2}>
        {sections.map((section) => (
          <Card key={section.id} variant="outlined">
            <ListItem
              button
              onClick={() => handleSectionToggle(section.id)}
              sx={{ py: 2 }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle1">{section.title}</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        ml: "auto",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        {section.progress}%
                      </Typography>
                      {expandedSections.includes(section.id) ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </Box>
                  </Box>
                }
                secondary={
                  <LinearProgress
                    variant="determinate"
                    value={section.progress}
                    sx={{ mt: 1, height: 5, borderRadius: 5 }}
                  />
                }
              />
            </ListItem>

            {expandedSections.includes(section.id) && (
              <List disablePadding>
                {section.contents.map((content) => (
                  <ListItem
                    key={content.id}
                    onClick={() => handleContentClick(content)}
                    sx={{
                      pl: 4,
                      opacity: content.locked ? 0.5 : 1,
                      cursor: content.locked ? "not-allowed" : "pointer",
                      "&:hover": {
                        bgcolor: !content.locked ? "action.hover" : "inherit",
                      },
                    }}
                  >
                    <ListItemIcon>
                      {content.completed ? (
                        <CheckCircle color="success" />
                      ) : content.locked ? (
                        <Lock color="disabled" />
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
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default CourseStructure;
