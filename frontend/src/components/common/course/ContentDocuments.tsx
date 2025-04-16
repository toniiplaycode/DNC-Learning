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
import {
  deleteDocument,
  fetchDocumentsByCourse,
} from "../../../features/documents/documentsSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useParams } from "react-router-dom";
import { selectCourseDocuments } from "../../../features/documents/documentsSelectors";
import { toast } from "react-toastify";

interface ContentDocumentsProps {
  isInstructor?: boolean;
}

interface GroupedDocuments {
  [key: string]: {
    section: any;
    documents: typeof documentsCourse;
    orderNumber: number;
  };
}

const ContentDocuments: React.FC<ContentDocumentsProps> = ({
  isInstructor = false,
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

  const handleConfirmDelete = async () => {
    console.log("Deleting document with ID:", documentToDelete);

    await dispatch(deleteDocument(Number(documentToDelete)));
    await dispatch(fetchDocumentsByCourse(Number(id)));
    await toast.success("Xóa tài liệu thành công");

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

  const groupDocumentsBySection = (
    documents: typeof documentsCourse
  ): GroupedDocuments => {
    // First, group documents
    const groups = documents.reduce((groups, doc) => {
      const sectionId = doc?.courseSection?.id || "common";
      if (!groups[sectionId]) {
        groups[sectionId] = {
          section: doc.courseSection,
          documents: [],
          orderNumber: doc.courseSection?.orderNumber ?? Infinity,
        };
      }
      groups[sectionId].documents.push(doc);
      return groups;
    }, {} as GroupedDocuments);

    return groups;
  };

  const getSortedSections = (groupedDocuments: GroupedDocuments) => {
    // Convert to array and sort by orderNumber
    return Object.entries(groupedDocuments).sort(([, a], [, b]) => {
      // Common documents (no section) will appear first
      if (!a.section) return -1;
      if (!b.section) return 1;

      return a.section.orderNumber - b.section.orderNumber;
    });
  };

  const sortDocumentsInSection = (documents: typeof documentsCourse) => {
    return [...documents].sort((a, b) => {
      // Sort by orderNumber if available, otherwise by title
      if (a.orderNumber !== undefined && b.orderNumber !== undefined) {
        return a.orderNumber - b.orderNumber;
      }
      return a.title.localeCompare(b.title);
    });
  };

  return (
    <Box>
      <List sx={{ bgcolor: "background.paper" }}>
        {getSortedSections(groupDocumentsBySection(documentsCourse))
          .filter(([, group]) => group.section || group.documents.length > 0)
          .map(([sectionId, { section, documents }]) => (
            <Fragment key={sectionId}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {section
                  ? `Phần ${section.orderNumber} - ${section.title}`
                  : "Tài liệu chung"}
              </Typography>
              {sortDocumentsInSection(documents).map((doc) => (
                <ListItem
                  key={doc.id}
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
              ))}
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
