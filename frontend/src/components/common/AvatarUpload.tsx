import React, { useState } from "react";
import {
  Box,
  Avatar,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { PhotoCamera, Close } from "@mui/icons-material";

interface AvatarUploadProps {
  currentAvatar: string;
  onAvatarChange: (file: File) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
}) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
        return;
      }

      // Kiểm tra định dạng file
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setOpen(true);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onAvatarChange(selectedFile);
    }
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  return (
    <>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <IconButton
            component="label"
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleFileSelect}
            />
            <PhotoCamera />
          </IconButton>
        }
      >
        <Avatar src={currentAvatar} sx={{ width: 120, height: 120 }} />
      </Badge>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Xem trước ảnh đại diện
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewUrl && (
            <Box textAlign="center">
              <Avatar
                src={previewUrl}
                sx={{ width: 200, height: 200, margin: "0 auto" }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {selectedFile?.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvatarUpload;
