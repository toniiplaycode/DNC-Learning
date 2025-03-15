import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  CloudUpload,
  AttachFile,
  Description,
  Delete,
  Link as LinkIcon,
  Image,
  Code,
  Archive,
} from "@mui/icons-material";

interface AssignmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface AssignmentContentProps {
  assignmentData: {
    id: number;
    title: string;
    description: string;
    dueDate?: string;
    maxFileSize: number; // in MB
    allowedFileTypes: string[];
    maxFiles: number;
    status?: "not_started" | "in_progress" | "submitted" | "graded";
    score?: number;
    feedback?: string;
  };
  onSubmit: (files: File[], note: string) => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return <Image />;
  if (fileType.startsWith("text/")) return <Description />;
  if (fileType.includes("zip") || fileType.includes("rar")) return <Archive />;
  if (fileType.includes("javascript") || fileType.includes("typescript"))
    return <Code />;
  return <AttachFile />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const AssignmentContent: React.FC<AssignmentContentProps> = ({
  assignmentData,
  onSubmit,
}) => {
  const [files, setFiles] = useState<AssignmentFile[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.size <= assignmentData.maxFileSize * 1024 * 1024 &&
        assignmentData.allowedFileTypes.some(
          (type) => file.type.includes(type) || file.name.endsWith(type)
        )
    );

    const newFiles = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles((prev) =>
      [...prev, ...newFiles].slice(0, assignmentData.maxFiles)
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onSubmit(files as unknown as File[], note);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      {/* Assignment Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            {assignmentData.dueDate && (
              <Chip
                label={`Hạn nộp: ${assignmentData.dueDate}`}
                color="warning"
              />
            )}
            <Chip
              label={`Tối đa ${assignmentData.maxFiles} file`}
              variant="outlined"
            />
            <Chip
              label={`Dung lượng tối đa: ${assignmentData.maxFileSize}MB`}
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileSelect}
            accept={assignmentData.allowedFileTypes.join(",")}
          />

          <Stack spacing={3}>
            {/* File List */}
            {files.length > 0 && (
              <List>
                {files.map((file) => (
                  <ListItem
                    key={file.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFile(file.id)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {/* Upload Button */}
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= assignmentData.maxFiles}
              >
                Chọn file
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Định dạng cho phép: {assignmentData.allowedFileTypes.join(", ")}
              </Typography>
            </Box>

            {/* Note */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú về bài nộp của bạn (không bắt buộc)"
            />

            {/* Submit Button */}
            <Box sx={{ textAlign: "right" }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={files.length === 0 || uploading}
              >
                {uploading ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LinearProgress
                      sx={{ width: 100, mr: 1 }}
                      color="inherit"
                    />
                    Đang tải lên...
                  </Box>
                ) : (
                  "Nộp bài"
                )}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Xem trước bài nộp</DialogTitle>
        <DialogContent>
          <List>
            {files.map((file) => (
              <ListItem key={file.id}>
                <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>
          {note && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ghi chú:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {note}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentContent;
