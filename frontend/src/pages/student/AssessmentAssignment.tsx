import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Alert,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  Upload,
  Assignment,
  Description,
  DeleteOutline,
  InsertDriveFile,
  CloudUpload,
  Attachment,
  ArrowBack,
  Check,
  CalendarToday,
  Timer,
  Star,
  Person,
  MenuBook,
  Download,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import CustomContainer from "../../components/common/CustomContainer";
import ReactMarkdown from "react-markdown";

// Mock data cho bài tập
const mockAssignment = {
  id: 2,
  title: "Bài tập Redux Middleware",
  description: `
## Yêu cầu bài tập

### Mục tiêu
Xây dựng một ứng dụng React sử dụng Redux và Redux Middleware để quản lý trạng thái và tương tác với API.

### Chi tiết yêu cầu
1. Tạo một ứng dụng quản lý danh sách sản phẩm với các chức năng:
   - Hiển thị danh sách sản phẩm
   - Thêm sản phẩm mới
   - Xóa sản phẩm
   - Cập nhật thông tin sản phẩm
    
2. Sử dụng Redux để quản lý state của ứng dụng
    
3. Triển khai Redux Middleware:
   - Sử dụng Redux-Thunk hoặc Redux-Saga để xử lý các side effect
   - Xử lý tương tác với API (có thể sử dụng json-server hoặc API mẫu)
   - Triển khai middleware logging để ghi lại các actions
    
### Yêu cầu kỹ thuật
- Sử dụng React và Redux
- Sử dụng TypeScript để định nghĩa kiểu dữ liệu
- Tổ chức code theo cấu trúc rõ ràng (actions, reducers, store, components)
- Viết unit tests cho reducers và middleware
    
### Tiêu chí đánh giá
- Chức năng hoạt động đúng
- Mã nguồn rõ ràng, sạch sẽ và có tổ chức
- Sử dụng TypeScript đúng cách
- Xử lý lỗi và trạng thái loading
- Giao diện người dùng thân thiện
  `,
  course: "React & TypeScript Masterclass",
  instructor: "John Doe",
  dueDate: "2025-06-30T23:59:59",
  points: 200,
  status: "not_submitted", // not_submitted, submitted, graded
  attachments: [
    {
      id: 1,
      name: "Hướng dẫn bài tập.pdf",
      type: "pdf",
      size: 1024 * 1024 * 2.5, // 2.5MB
      url: "/documents/huong-dan.pdf",
    },
    {
      id: 2,
      name: "Mã nguồn khởi tạo.zip",
      type: "zip",
      size: 1024 * 1024 * 5.3, // 5.3MB
      url: "/documents/starter-code.zip",
    },
  ],
  submission: null, // Chưa nộp bài
};

// Định nghĩa kiểu cho file upload
interface FileWithPreview extends File {
  preview?: string;
}

const AssessmentAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Định dạng kích thước file
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Xử lý chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const newFiles = Array.from(event.target.files).map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    setFiles((prev) => [...prev, ...newFiles]);

    // Reset input để có thể chọn lại cùng file
    if (event.target) {
      event.target.value = "";
    }
  };

  // Xử lý xóa file
  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Xử lý tải xuống tài liệu bài tập
  const handleDownloadAttachment = (attachment: any) => {
    console.log("Downloading:", attachment.name);
    // Trong thực tế, bạn sẽ gọi API thực để tải tài liệu
    alert(`Đang tải xuống: ${attachment.name}`);
  };

  // Xử lý nộp bài
  const handleSubmitAssignment = () => {
    // Kiểm tra nếu không có file nào được chọn
    if (files.length === 0) {
      setSubmissionError("Vui lòng tải lên ít nhất một file");
      return;
    }

    // Mô phỏng gửi bài tập
    setTimeout(() => {
      setSubmitted(true);
      setShowSubmitConfirm(false);
    }, 1500);
  };

  // Hiển thị icon phù hợp cho từng loại file
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <Description color="error" />;
      case "zip":
      case "rar":
        return <Description color="warning" />;
      case "doc":
      case "docx":
        return <Description color="primary" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <Description color="success" />;
      default:
        return <InsertDriveFile />;
    }
  };

  return (
    <CustomContainer maxWidth="lg">
      {submitted ? (
        // Hiển thị khi đã nộp bài
        <Box>
          <Alert severity="success" icon={<Check />} sx={{ mb: 3, py: 2 }}>
            <Typography variant="h6">Nộp bài tập thành công!</Typography>
            <Typography variant="body2">
              Bài tập của bạn đã được nộp và đang chờ giảng viên chấm điểm.
            </Typography>
          </Alert>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {mockAssignment.title}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Chip label="Đã nộp" color="success" icon={<Check />} />
                <Chip
                  label={`${mockAssignment.points} điểm`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Bài làm đã nộp
              </Typography>

              <Paper sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
                <Stack spacing={2}>
                  {files.map((file, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        p: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      {file.type.includes("image") ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{ width: 40, height: 40, objectFit: "cover" }}
                        />
                      ) : (
                        <InsertDriveFile color="primary" />
                      )}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">{file.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {comment && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Ghi chú của bạn
                  </Typography>
                  <Paper sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
                    <Typography variant="body2">{comment}</Typography>
                  </Paper>
                </>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Thời gian nộp: {new Date().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/assessment")}
            >
              Quay lại danh sách
            </Button>
          </Box>
        </Box>
      ) : (
        // Hiển thị form nộp bài
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            {mockAssignment.title}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3, px: 3 }}>
                <CardContent>
                  {/* Sử dụng ReactMarkdown để hiển thị định dạng markdown */}
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <ReactMarkdown>{mockAssignment.description}</ReactMarkdown>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Tài liệu đính kèm
                  </Typography>

                  <List>
                    {mockAssignment.attachments.map((attachment) => (
                      <ListItem
                        key={attachment.id}
                        disablePadding
                        sx={{ mb: 1 }}
                      >
                        <ListItemIcon>
                          {getFileIcon(attachment.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={attachment.name}
                          secondary={formatFileSize(attachment.size)}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                          onClick={() => handleDownloadAttachment(attachment)}
                        >
                          Tải xuống
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Nộp bài
                  </Typography>

                  {/* File upload section */}
                  <Box
                    sx={{
                      border: "2px dashed",
                      borderColor: "primary.light",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      mb: 3,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                      ref={fileInputRef}
                    />
                    <CloudUpload color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                      Kéo thả file hoặc nhấn để chọn
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hỗ trợ: .zip, .pdf, .doc, .docx, .jpg, .png
                    </Typography>
                  </Box>

                  {/* Danh sách file đã chọn */}
                  {files.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        File đã chọn ({files.length})
                      </Typography>
                      <Stack spacing={1}>
                        {files.map((file, index) => (
                          <Paper
                            key={index}
                            sx={{
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              {file.type.includes("image") ? (
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <InsertDriveFile />
                              )}
                              <Box>
                                <Typography variant="body2">
                                  {file.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatFileSize(file.size)}
                                </Typography>
                              </Box>
                            </Stack>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <DeleteOutline />
                            </IconButton>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Ghi chú */}
                  <TextField
                    label="Ghi chú cho giảng viên (không bắt buộc)"
                    multiline
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    fullWidth
                    margin="normal"
                    placeholder="Nhập ghi chú hoặc thông tin bổ sung về bài làm của bạn"
                  />

                  {submissionError && (
                    <Alert severity="error" sx={{ my: 2 }}>
                      {submissionError}
                    </Alert>
                  )}

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={files.length === 0}
                      startIcon={<Upload />}
                      onClick={() => setShowSubmitConfirm(true)}
                    >
                      Nộp bài
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin bài tập
                  </Typography>

                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <MenuBook />
                      </ListItemIcon>
                      <ListItemText
                        primary="Khóa học"
                        secondary={mockAssignment.course}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary="Giảng viên"
                        secondary={mockAssignment.instructor}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary="Hạn nộp"
                        secondary={new Date(
                          mockAssignment.dueDate
                        ).toLocaleString()}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <Star />
                      </ListItemIcon>
                      <ListItemText
                        primary="Điểm tối đa"
                        secondary={mockAssignment.points}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Dialog xác nhận nộp bài */}
          <Dialog
            open={showSubmitConfirm}
            onClose={() => setShowSubmitConfirm(false)}
          >
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Bạn đang nộp {files.length} file. Bạn có chắc chắn muốn nộp bài
                không?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Lưu ý: Sau khi nộp, bạn sẽ không thể chỉnh sửa bài làm.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowSubmitConfirm(false)}>Hủy</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitAssignment}
              >
                Xác nhận nộp bài
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </CustomContainer>
  );
};

export default AssessmentAssignment;
