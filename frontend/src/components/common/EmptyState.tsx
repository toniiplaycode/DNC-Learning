import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface EmptyStateProps {
  icon: React.ReactElement<SvgIconComponent>;
  title: string;
  description: string;
  maxWidth?: number;
  height?: number | string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  maxWidth = 400,
  height = 300,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        height,
        maxWidth,
        mx: "auto",
        my: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          mb: 3,
          "& .MuiSvgIcon-root": {
            fontSize: 60,
            color: "primary.main",
            opacity: 0.8,
          },
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        color="text.primary"
        gutterBottom
        sx={{ fontWeight: 500, textAlign: "center" }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        sx={{ maxWidth: 300 }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

export default EmptyState;
