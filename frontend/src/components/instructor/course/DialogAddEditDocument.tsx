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
  updateDocument,
} from "../../../features/documents/documentsSlice";
import { toast } from "react-toastify";
import {
  uploadToDrive,
  getBestUrlForContent,
} from "../../../utils/uploadToDrive";

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
  id: string | number;
  instructorId: string | number;
  courseSectionId: string | number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  uploadDate?: string;
  downloadCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  courseSection?: {
    id: string | number;
    courseId: string | number;
    title: string;
    description: string;
    orderNumber: number;
    createdAt: string;
    updatedAt: string;
  };
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
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  // Cập nhật form khi mở modal và có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
      if (editMode && documentToEdit) {
        setDocumentForm({
          id: Number(documentToEdit.id),
          instructorId: Number(documentToEdit.instructorId),
          courseSectionId: Number(documentToEdit.courseSectionId),
          title: documentToEdit.title,
          description: documentToEdit.description || "",
          fileUrl: documentToEdit.fileUrl,
          fileType: documentToEdit.fileType as DocumentType,
          status: documentToEdit.status as DocumentStatus,
          downloadCount: documentToEdit.downloadCount,
          uploadDate: new Date(documentToEdit.uploadDate),
        });
      } else {
        // Reset form for new document
        setDocumentForm({
          instructorId: Number(currentUser?.userInstructor?.id),
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
      setUploadedFileUrl("");
    }
  }, [open, editMode, documentToEdit, initialSectionId, currentUser]);

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
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileUploadError(
          "Định dạng file không được hỗ trợ. Chỉ hỗ trợ PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT"
        );
        return;
      }

      setSelectedFile(file);
      setFileUploadError(null);
    }
  };

  // Tải file lên Google Drive
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setFileUploadError("Vui lòng chọn file để tải lên");
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    console.log("Bắt đầu tải file lên Drive:", selectedFile.name);

    try {
      console.log("Đang tải lên file:", selectedFile.name);
      const response = await uploadToDrive(selectedFile, (progress) => {
        setUploadProgress(progress);
        console.log(`Tiến độ tải lên: ${progress}%`);
      });

      console.log("Kết quả tải lên:", response);

      if (response.success) {
        // Lấy URL phù hợp nhất cho loại tài liệu
        const bestUrl = getBestUrlForContent(response, documentForm.fileType);
        console.log("Tải lên thành công, URL phù hợp:", bestUrl);
        console.log("Thông tin đầy đủ:", {
          fileUrl: response.fileUrl,
          directLink: response.directLink,
          embedUrl: response.embedUrl,
          fileType: documentForm.fileType,
        });

        setUploadedFileUrl(bestUrl);
        // Cập nhật fileUrl trong form
        setDocumentForm((prev) => ({
          ...prev,
          fileUrl: bestUrl,
        }));
        toast.success("Tải file lên thành công!");
        return bestUrl;
      } else {
        console.error("Lỗi tải lên:", response.message);
        setFileUploadError(response.message || "Tải lên thất bại");
        toast.error(
          "Tải file lên thất bại: " + (response.message || "Lỗi không xác định")
        );
        return null;
      }
    } catch (error) {
      console.error("Lỗi tải file:", error);
      setFileUploadError("Không thể tải file lên. Vui lòng thử lại.");
      toast.error(
        "Lỗi khi tải file: " +
          (error instanceof Error ? error.message : "Lỗi không xác định")
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      // Sử dụng uploadedFileUrl nếu đã tải lên, hoặc dùng fileUrl có sẵn
      let fileUrl = uploadedFileUrl || documentForm.fileUrl;
      const courseId = Number(id);

      if (isNaN(courseId)) {
        toast.error("Invalid course ID");
        return;
      }

      if (!documentForm.instructorId || isNaN(documentForm.instructorId)) {
        toast.error("Invalid instructor ID");
        return;
      }

      // Nếu có file được chọn nhưng chưa tải lên, thực hiện tải lên trước
      if (selectedFile && !uploadedFileUrl) {
        console.log("Có file chưa tải lên, tiến hành tải lên trước khi submit");
        const uploadedUrl = await handleFileUpload();
        if (uploadedUrl) {
          fileUrl = uploadedUrl;
        } else if (!documentForm.fileUrl) {
          // If upload failed and no URL provided, show error
          toast.error("Vui lòng cung cấp file hợp lệ hoặc URL");
          return;
        }
      }

      console.log("Đang submit form với URL file:", fileUrl);

      const submittedData = {
        ...(editMode ? { id: documentForm.id } : {}),
        instructorId: documentForm.instructorId,
        courseSectionId: documentForm.courseSectionId,
        title: documentForm.title,
        description: documentForm.description,
        fileUrl: fileUrl,
        fileType: documentForm.fileType,
        status: documentForm.status,
        ...(editMode
          ? {
              uploadDate: documentForm.uploadDate,
              downloadCount: documentForm.downloadCount,
            }
          : {}),
      };

      console.log("Dữ liệu submit:", submittedData);

      if (editMode) {
        await dispatch(updateDocument(submittedData));
      } else {
        await dispatch(createDocument(submittedData));
      }

      await dispatch(fetchDocumentsByCourse(courseId));
      toast.success(
        editMode ? "Cập nhật tài liệu thành công!" : "Thêm tài liệu thành công!"
      );
      onClose();
    } catch (error) {
      console.error("Lỗi khi submit form:", error);
      toast.error(
        editMode
          ? "Có lỗi xảy ra khi cập nhật tài liệu"
          : "Có lỗi xảy ra khi thêm tài liệu"
      );
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
          <FormControl fullWidth required error={!documentForm.courseSectionId}>
            <InputLabel>Chọn phần học</InputLabel>
            <Select
              value={documentForm.courseSectionId || ""}
              label="Chọn phần học"
              onChange={(e) =>
                setDocumentForm({
                  ...documentForm,
                  courseSectionId: Number(e.target.value),
                })
              }
            >
              {sortedSections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.title}
                </MenuItem>
              ))}
            </Select>
            {!documentForm.courseSectionId && (
              <FormHelperText error>
                Vui lòng chọn phần học cho tài liệu
              </FormHelperText>
            )}
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
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    id="document-upload"
                    type="file"
                    hidden
                    onChange={handleFileSelect}
                  />
                  <Stack direction="row" spacing={2} justifyContent="center">
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
                    {selectedFile && !isUploading && !uploadedFileUrl && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFileUpload}
                        disabled={isUploading}
                      >
                        Tải lên ngay
                      </Button>
                    )}
                  </Stack>
                  {uploadedFileUrl && (
                    <Typography
                      variant="subtitle2"
                      color="success.main"
                      sx={{ mt: 1 }}
                    >
                      File đã tải lên thành công! URL:{" "}
                      {uploadedFileUrl.substring(0, 50)}...
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Định dạng hỗ trợ: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
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
            helperText={
              uploadedFileUrl
                ? "Đã tải file lên thành công"
                : "Có thể để trống nếu bạn tải file lên trực tiếp"
            }
            required={!selectedFile && !uploadedFileUrl}
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
