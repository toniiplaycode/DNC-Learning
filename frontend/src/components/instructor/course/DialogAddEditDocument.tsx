import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Stack,
  LinearProgress,
  FormHelperText,
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";

// Định nghĩa kiểu DocumentItem
interface DocumentItem {
  id: number;
  title: string;
  description?: string;
  url: string;
  fileType?: string;
  fileSize?: number;
  sectionId?: number;
  visibility?: "all" | "enrolled" | "premium";
  isDownloadable?: boolean;
}

// Định nghĩa props cho component
interface DialogAddEditDocumentProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (documentData: any) => void;
  initialSectionId?: number;
  documentToEdit?: DocumentItem;
  sections: any[];
  editMode: boolean;
}

const DialogAddEditDocument: React.FC<DialogAddEditDocumentProps> = ({
  open,
  onClose,
  onSubmit,
  initialSectionId,
  documentToEdit,
  sections,
  editMode,
}) => {
  // State cho form document
  const [documentForm, setDocumentForm] = useState({
    title: "",
    description: "",
    url: "",
    sectionId: 0,
    visibility: "enrolled",
    isDownloadable: true,
  });

  // State quản lý upload file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Cập nhật form khi mở modal và có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && documentToEdit) {
        // Tìm section của document khi edit
        let sectionId = documentToEdit.sectionId || 0;

        // Nếu không có sectionId trong documentToEdit, tìm từ sections
        if (!sectionId) {
          for (const section of sections) {
            const docIndex = section.documents?.findIndex(
              (d: DocumentItem) => d.id === documentToEdit.id
            );
            if (docIndex !== -1) {
              sectionId = section.id;
              break;
            }
          }
        }

        setDocumentForm({
          title: documentToEdit.title || "",
          description: documentToEdit.description || "",
          url: documentToEdit.url || "",
          sectionId: sectionId,
          visibility: documentToEdit.visibility || "enrolled",
          isDownloadable: documentToEdit.isDownloadable !== false,
        });
      } else {
        // Khi thêm mới
        setDocumentForm({
          title: "",
          description: "",
          url: "",
          sectionId: initialSectionId || 0,
          visibility: "enrolled",
          isDownloadable: true,
        });
      }

      // Reset upload state
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      setFileUploadError(null);
    }
  }, [open, editMode, documentToEdit, initialSectionId, sections]);

  // Xử lý khi chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setFileUploadError("File quá lớn. Vui lòng chọn file nhỏ hơn 50MB");
        return;
      }

      // Kiểm tra định dạng file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileUploadError(
          "Định dạng file không được hỗ trợ. Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX"
        );
        return;
      }

      setSelectedFile(file);
      setFileUploadError(null);
    }
  };

  // Giả lập việc upload file và trả về URL
  const simulateFileUpload = () => {
    return new Promise<string>((resolve) => {
      setIsUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsUploading(false);
              resolve(`https://example.com/uploads/${selectedFile?.name}`);
            }, 500);
          }
          return newProgress;
        });
      }, 300);
    });
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      let fileUrl = documentForm.url;

      // Nếu có file được chọn, thực hiện upload
      if (selectedFile) {
        fileUrl = await simulateFileUpload();
      }

      // Chuẩn bị data để submit
      const submittedData = {
        ...(editMode && documentToEdit ? { id: documentToEdit.id } : {}),
        title: documentForm.title,
        description: documentForm.description,
        url: fileUrl,
        sectionId: documentForm.sectionId,
        visibility: documentForm.visibility,
        isDownloadable: documentForm.isDownloadable,
        fileType: selectedFile
          ? selectedFile.type
          : documentToEdit?.fileType || "",
        fileSize: selectedFile
          ? selectedFile.size
          : documentToEdit?.fileSize || 0,
      };

      // Gọi callback onSubmit từ prop
      onSubmit(submittedData);
    } catch (error) {
      console.error("Lỗi khi submit form:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {editMode ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Tiêu đề tài liệu */}
          <TextField
            label="Tiêu đề tài liệu"
            fullWidth
            required
            value={documentForm.title}
            onChange={(e) =>
              setDocumentForm({ ...documentForm, title: e.target.value })
            }
            placeholder="Nhập tiêu đề tài liệu"
          />

          {/* Mô tả tài liệu */}
          <TextField
            label="Mô tả tài liệu"
            fullWidth
            multiline
            rows={3}
            value={documentForm.description}
            onChange={(e) =>
              setDocumentForm({ ...documentForm, description: e.target.value })
            }
            placeholder="Mô tả ngắn về nội dung của tài liệu"
          />

          {/* Chọn section */}
          <FormControl fullWidth>
            <InputLabel>Chọn phần học</InputLabel>
            <Select
              value={documentForm.sectionId}
              label="Chọn phần học"
              onChange={(e) =>
                setDocumentForm({
                  ...documentForm,
                  sectionId: e.target.value as number,
                })
              }
            >
              <MenuItem value={0}>Không thuộc phần học nào</MenuItem>
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Nếu tài liệu không thuộc phần học cụ thể, chọn "Không thuộc phần
              học nào"
            </FormHelperText>
          </FormControl>

          {/* Tải lên file */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tải lên file tài liệu
            </Typography>
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                p: 3,
                textAlign: "center",
                borderRadius: 1,
                mb: 2,
              }}
            >
              {isUploading ? (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Đang tải lên...
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <input
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    id="document-upload"
                    type="file"
                    hidden
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="document-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                    >
                      {selectedFile
                        ? `Đã chọn: ${selectedFile.name}`
                        : "Chọn file tài liệu"}
                    </Button>
                  </label>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Định dạng hỗ trợ: PDF, DOC, DOCX, PPT, PPTX
                  </Typography>
                  {fileUploadError && (
                    <Typography
                      color="error"
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      {fileUploadError}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* URL tài liệu */}
          <TextField
            label="URL tài liệu"
            fullWidth
            value={documentForm.url}
            onChange={(e) =>
              setDocumentForm({ ...documentForm, url: e.target.value })
            }
            placeholder="https://example.com/document.pdf"
            helperText="Có thể để trống nếu bạn tải file lên trực tiếp"
            required={!selectedFile}
          />

          {/* Chế độ hiển thị */}
          <FormControl fullWidth>
            <InputLabel>Chế độ hiển thị</InputLabel>
            <Select
              value={documentForm.visibility}
              label="Chế độ hiển thị"
              onChange={(e) =>
                setDocumentForm({
                  ...documentForm,
                  visibility: e.target.value as "all" | "enrolled" | "premium",
                })
              }
            >
              <MenuItem value="all">Tất cả (Công khai)</MenuItem>
              <MenuItem value="enrolled">Học viên đã đăng ký</MenuItem>
              <MenuItem value="premium">Chỉ học viên premium</MenuItem>
            </Select>
          </FormControl>

          {/* Cho phép tải xuống */}
          <FormControl>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                id="downloadable"
                checked={documentForm.isDownloadable}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    isDownloadable: e.target.checked,
                  })
                }
              />
              <label htmlFor="downloadable" style={{ marginLeft: "8px" }}>
                Cho phép học viên tải xuống tài liệu
              </label>
            </Box>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !documentForm.title ||
            (!documentForm.url && !selectedFile) ||
            isUploading
          }
        >
          {isUploading
            ? "Đang tải lên..."
            : editMode
            ? "Cập nhật tài liệu"
            : "Thêm tài liệu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddEditDocument;
