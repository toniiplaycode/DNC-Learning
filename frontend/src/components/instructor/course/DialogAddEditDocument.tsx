import React, { useState, useEffect, useMemo } from "react";
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
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectAllCourseSectionsByCourseId } from "../../../features/course-sections/courseSectionSelector";
import { fetchCourseSectionsByCourseId } from "../../../features/course-sections/courseSectionApiSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import {
  createDocument,
  fetchDocumentsByCourse,
} from "../../../features/documents/documentsSlice";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";
import { toast } from "react-toastify";

// First define the document type enum to match backend
export enum DocumentType {
  PDF = "pdf",
  SLIDE = "slide",
  CODE = "code",
  LINK = "link",
  TXT = "txt",
  DOCX = "docx",
  XLSX = "xlsx",
}

export enum DocumentStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

// Define interface matching backend entity
interface DocumentFormData {
  id?: number;
  instructorId: number;
  courseSectionId?: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: DocumentType;
  uploadDate?: Date;
  downloadCount?: number;
  status: DocumentStatus;
}

// Định nghĩa kiểu DocumentItem
interface DocumentItem {
  id: number;
  title: string;
  description?: string;
  url: string;
  documentType: "pdf" | "slide" | "code" | "link" | "txt" | "docx" | "xlsx";
  fileType?: string;
  sectionId?: number;
  visibility?: "all" | "enrolled" | "premium";
  isDownloadable?: boolean;
}

// Định nghĩa props cho component
interface DialogAddEditDocumentProps {
  open: boolean;
  onClose: () => void;
  initialSectionId?: number;
  documentToEdit?: DocumentItem;
  editMode: boolean;
}

const DialogAddEditDocument: React.FC<DialogAddEditDocumentProps> = ({
  open,
  onClose,
  initialSectionId,
  documentToEdit,
  editMode,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const sectionData = useAppSelector(selectAllCourseSectionsByCourseId);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (id) {
      const courseId = Number(id);
      if (!isNaN(courseId)) {
        dispatch(fetchCourseSectionsByCourseId(courseId));
      } else {
        console.error("Invalid course ID:", id);
      }
    }
  }, [dispatch, id]);

  console.log("sectionData", sectionData, currentUser);

  // Initialize form state matching backend structure
  const [documentForm, setDocumentForm] = useState<DocumentFormData>({
    instructorId: Number(currentUser?.userInstructor?.id), // Set this from logged in user
    title: "",
    description: "",
    fileUrl: "",
    fileType: DocumentType.PDF,
    courseSectionId: initialSectionId || undefined,
    status: DocumentStatus.ACTIVE,
  });

  // Fix the sorting issue by creating a new array
  const sortedSections = useMemo(() => {
    return [...sectionData].sort((a, b) => a.orderNumber - b.orderNumber);
  }, [sectionData]);

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

        // Nếu không có sectionId trong documentToEdit, tìm từ sectionData
        if (!sectionId) {
          for (const section of sectionData) {
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
          id: documentToEdit.id,
          instructorId: Number(currentUser?.userInstructor?.id), // Set this from logged in user
          title: documentToEdit.title || "",
          description: documentToEdit.description || "",
          fileUrl: documentToEdit.url || "",
          fileType: documentToEdit.documentType as DocumentType,
          courseSectionId: sectionId || undefined,
          status: DocumentStatus.ACTIVE,
        });
      } else {
        // Khi thêm mới
        setDocumentForm({
          instructorId: Number(currentUser?.userInstructor?.id), // Set this from logged in user
          title: "",
          description: "",
          fileUrl: "",
          fileType: DocumentType.PDF,
          courseSectionId: initialSectionId || undefined,
          status: DocumentStatus.ACTIVE,
        });
      }

      // Reset upload state
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      setFileUploadError(null);
    }
  }, [open, editMode, documentToEdit, initialSectionId, sectionData]);

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
      let fileUrl = documentForm.fileUrl;
      const courseId = Number(id);

      if (isNaN(courseId)) {
        toast.error("Invalid course ID");
        return;
      }

      if (!documentForm.instructorId || isNaN(documentForm.instructorId)) {
        toast.error("Invalid instructor ID");
        return;
      }

      // If there's a file selected, upload it first
      if (selectedFile) {
        fileUrl = await simulateFileUpload();
      }

      // Prepare data with validated IDs
      const submittedData = {
        ...(editMode && documentToEdit ? { id: documentToEdit.id } : {}),
        instructorId: Number(documentForm.instructorId),
        title: documentForm.title,
        description: documentForm.description,
        fileUrl: fileUrl,
        fileType: documentForm.fileType,
        courseSectionId: documentForm.courseSectionId
          ? Number(documentForm.courseSectionId)
          : undefined,
        status: documentForm.status,
      };

      await dispatch(createDocument(submittedData));
      await dispatch(fetchDocumentsByCourse(courseId));
      toast.success("Thêm tài liệu thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi submit form:", error);
      toast.error("Có lỗi xảy ra khi thêm tài liệu");
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

          {/* Document Type Selector */}
          <FormControl fullWidth required>
            <InputLabel>Loại tài liệu</InputLabel>
            <Select
              value={documentForm.fileType}
              label="Loại tài liệu"
              onChange={(e) =>
                setDocumentForm({
                  ...documentForm,
                  fileType: e.target.value as DocumentType,
                })
              }
            >
              <MenuItem value={DocumentType.PDF}>PDF Document</MenuItem>
              <MenuItem value={DocumentType.SLIDE}>Slide Presentation</MenuItem>
              <MenuItem value={DocumentType.CODE}>Source Code</MenuItem>
              <MenuItem value={DocumentType.LINK}>External Link</MenuItem>
              <MenuItem value={DocumentType.TXT}>Text Document</MenuItem>
              <MenuItem value={DocumentType.DOCX}>Word Document</MenuItem>
              <MenuItem value={DocumentType.XLSX}>Excel Spreadsheet</MenuItem>
            </Select>
            <FormHelperText>
              Chọn loại tài liệu phù hợp với nội dung
            </FormHelperText>
          </FormControl>

          {/* Chọn section */}
          <FormControl fullWidth required>
            <InputLabel>Chọn phần học</InputLabel>
            <Select
              value={documentForm.courseSectionId || ""}
              label="Chọn phần học"
              onChange={(e) =>
                setDocumentForm({
                  ...documentForm,
                  courseSectionId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            >
              <MenuItem value="">Không thuộc phần học nào</MenuItem>
              {sortedSections.map((section) => (
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
            value={documentForm.fileUrl}
            onChange={(e) =>
              setDocumentForm({ ...documentForm, fileUrl: e.target.value })
            }
            placeholder="https://example.com/document.pdf"
            helperText="Có thể để trống nếu bạn tải file lên trực tiếp"
            required={!selectedFile}
          />

          {/* Chế độ hiển thị */}
          <FormControl fullWidth>
            <InputLabel>Chế độ hiển thị</InputLabel>
            <Select
              value={documentForm.status}
              label="Chế độ hiển thị"
              onChange={(e) =>
                setDocumentForm({
                  ...documentForm,
                  status: e.target.value as DocumentStatus,
                })
              }
            >
              <MenuItem value={DocumentStatus.ACTIVE}>Hoạt động</MenuItem>
              <MenuItem value={DocumentStatus.ARCHIVED}>Lưu trữ</MenuItem>
            </Select>
          </FormControl>

          {/* Cho phép tải xuống */}
          <FormControl>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                id="downloadable"
                checked={documentForm.status === DocumentStatus.ACTIVE}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    status: e.target.checked
                      ? DocumentStatus.ACTIVE
                      : DocumentStatus.ARCHIVED,
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
            !documentForm.courseSectionId ||
            !documentForm.title ||
            (!documentForm.fileUrl && !selectedFile) ||
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
