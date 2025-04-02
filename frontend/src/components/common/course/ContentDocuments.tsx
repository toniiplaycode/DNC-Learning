import React, { useEffect, useState, Fragment } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  DialogContentText,
} from "@mui/material";
import {
  PictureAsPdf,
  Code,
  Download,
  Close,
  Delete,
  Description,
  TableChart,
  Slideshow,
  TextSnippet,
  LinkOff,
} from "@mui/icons-material";
import { fetchDocumentsByCourse } from "../../../features/documents/documentsSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useParams } from "react-router-dom";
import { selectCourseDocuments } from "../../../features/documents/documentsSelectors";

interface ContentDocumentsProps {
  isInstructor?: boolean;
  onDeleteDocument?: (documentId: number) => void;
}

const ContentDocuments: React.FC<ContentDocumentsProps> = ({
  isInstructor = false,
  onDeleteDocument,
}) => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const documentsCourse = useAppSelector(selectCourseDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchDocumentsByCourse(Number(id)));
  }, [dispatch, id]);

  const getFileIcon = (contentType: string) => {
    switch (contentType) {
      case "pdf":
        return <PictureAsPdf color="info" />;
      case "docx":
        return <Description color="info" />;
      case "xlsx":
        return <TableChart color="info" />;
      case "txt":
        return <TextSnippet color="info" />;
      case "slide":
        return <Slideshow color="info" />;
      case "code":
        return <Code color="info" />;
      case "link":
        return <LinkOff color="info" />;
      default:
        return <Description color="info" />;
    }
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const handleDownload = (url: string) => {
    window.open(
      `https://drive.google.com/uc?export=download&id=${getFileIdFromUrl(url)}`
    );
  };

  const handleDeleteClick = (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    setDocumentToDelete(docId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete !== null && onDeleteDocument) {
      onDeleteDocument(documentToDelete);
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  // Helper function để lấy file ID từ Google Drive URL
  function getFileIdFromUrl(url: string) {
    // Xử lý URL dạng /file/d/{fileId}/view hoặc /presentation/d/{fileId}/edit
    const fileIdMatch = url.match(/\/d\/([^\/]+)/);
    return fileIdMatch ? fileIdMatch[1] : "";
  }

  const renderPreview = (doc: Document) => {
    const fileId = getFileIdFromUrl(doc.fileUrl);

    // Handle specific content types
    switch (doc.fileType) {
      case "pdf":
        return (
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://drive.google.com/file/d/${fileId}/preview`}
              title={doc.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
            <Stack direction="row" spacing={2} my={2} justifyContent="center">
              <a
                href={`https://drive.google.com/file/d/${fileId}/view`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="small" variant="contained">
                  Mở trong Drive
                </Button>
              </a>
              <a
                href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                download
              >
                <Button size="small" variant="outlined">
                  Tải xuống
                </Button>
              </a>
            </Stack>
          </Box>
        );

      case "txt":
        return (
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://drive.google.com/file/d/${fileId}/preview`}
              title={doc.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
            <Stack direction="row" spacing={2} my={2} justifyContent="center">
              <a
                href={`https://drive.google.com/file/d/${fileId}/view`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="small" variant="contained">
                  Mở trong Drive
                </Button>
              </a>
              <a
                href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                download
              >
                <Button size="small" variant="outlined">
                  Tải xuống
                </Button>
              </a>
            </Stack>
          </Box>
        );

      case "docx":
      case "xlsx":
      case "slide":
        return (
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`}
              title={doc.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
            <Stack direction="row" spacing={2} my={2} justifyContent="center">
              <a
                href={`https://drive.google.com/file/d/${fileId}/view`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="small" variant="contained">
                  Mở trong Drive
                </Button>
              </a>
              <a
                href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                download
              >
                <Button size="small" variant="outlined">
                  Tải xuống
                </Button>
              </a>
            </Stack>
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="body1" gutterBottom>
              Không thể hiển thị trực tiếp tệp này
            </Typography>
            <Stack direction="row" spacing={2} mt={2}>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="contained">Mở tệp</Button>
              </a>
              {fileId && (
                <a
                  href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                  download
                >
                  <Button variant="outlined">Tải xuống</Button>
                </a>
              )}
            </Stack>
          </Box>
        );
    }
  };

  return (
    <Box>
      <List sx={{ bgcolor: "background.paper" }}>
        {documentsCourse?.map((doc) => (
          <Fragment key={doc.id}>
            <Typography variant="h6">
              Phần {doc?.courseSection?.orderNumber} -{" "}
              {doc?.courseSection?.title}
            </Typography>
            <ListItem
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc.fileUrl);
                    }}
                  >
                    Tải xuống
                  </Button>
                  {isInstructor && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleDeleteClick(e, doc.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Stack>
              }
            >
              <ListItemButton onClick={() => handlePreview(doc)}>
                <ListItemIcon>{getFileIcon(doc.fileType)}</ListItemIcon>
                <ListItemText
                  primary={doc.title}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {doc.fileSize} KB
                      </Typography>
                      <Chip
                        label={doc.fileType.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          </Fragment>
        ))}
      </List>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="xl"
        fullScreen={true}
        sx={{
          "& .MuiDialog-paper": {
            width: "90%",
            height: "90%",
            maxWidth: "none",
            maxHeight: "none",
            m: 0,
          },
        }}
      >
        {selectedDocument && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">{selectedDocument.title}</Typography>
                <IconButton onClick={() => setPreviewOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>{renderPreview(selectedDocument)}</DialogContent>
          </>
        )}
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa tài liệu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentDocuments;
