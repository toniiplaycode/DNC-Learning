import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import "../../../styles/fonts.css";

interface CertificateDetailProps {
  open: boolean;
  onClose: () => void;
  certificate: {
    id: number;
    course_title: string;
    certificate_number: string;
    issue_date: string;
    expiry_date?: string;
    student_name: string;
    student_code: string;
    grade: string;
    instructor_name: string;
    instructor_title: string;
    certificate_url: string;
  };
}

const CertificateDetail: React.FC<CertificateDetailProps> = ({
  open,
  onClose,
  certificate,
}) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          Chi tiết chứng chỉ
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ p: 2 }}>
          {/* Certificate Template */}
          <Box
            sx={{
              width: "100%",
              aspectRatio: "1.414/1",
              backgroundColor: "#fff",
              borderRadius: 1,
              mb: 3,
              position: "relative",
              border: "1px solid #FFD700",
              overflow: "hidden",
            }}
          >
            {/* Background Design */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              {/* Top Corner */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  borderTop: "100px solid #1e3c72",
                  borderRight: "100px solid transparent",
                  transform: "rotate(0deg)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  borderTop: "100px solid #1e3c72",
                  borderLeft: "100px solid transparent",
                  transform: "rotate(0deg)",
                }}
              />
              {/* Bottom Corner */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  borderBottom: "100px solid #1e3c72",
                  borderRight: "100px solid transparent",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  borderBottom: "100px solid #1e3c72",
                  borderLeft: "100px solid transparent",
                }}
              />
            </Box>

            {/* Border Frame */}
            <Box
              sx={{
                position: "absolute",
                top: "20px",
                left: "20px",
                right: "20px",
                bottom: "20px",
                border: "2px solid #FFD700",
              }}
            />

            {/* Logo */}
            <Box
              sx={{
                position: "absolute",
                top: "40px",
                left: "40px",
                width: "100px",
                height: "100px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src="/src/assets/logo.png"
                alt="Logo"
                style={{
                  width: "100%",
                  height: "auto",
                }}
              />
            </Box>

            {/* Certificate Content */}
            <Box
              sx={{
                position: "relative",
                height: "100%",
                p: 6,
                pt: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: "bold",
                  mb: 1,
                  letterSpacing: "0.1em",
                }}
              >
                CERTIFICATE
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  letterSpacing: "0.2em",
                }}
              >
                OF ACHIEVEMENT
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 1,
                  color: "#FFD700",
                  fontWeight: "medium",
                }}
              >
                THIS CERTIFICATE IS PRESEND TO:
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  color: theme.palette.primary.main,
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "4rem",
                  mb: 3,
                  textTransform: "capitalize",
                  letterSpacing: "0.05em",
                  lineHeight: 1.2,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {certificate.student_name}
              </Typography>

              {/* Course Information */}
              <Typography
                variant="body1"
                sx={{
                  maxWidth: "80%",
                  mb: 2,
                  color: theme.palette.text.primary,
                  lineHeight: 1.6,
                }}
              >
                for successfully completing the course
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.primary.main,
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "2.5rem",
                  fontWeight: "normal",
                  mb: 2,
                  lineHeight: 1.3,
                  maxWidth: "80%",
                  margin: "0 auto",
                }}
              >
                {certificate.course_title}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  mb: 4,
                  color: theme.palette.text.secondary,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Grade
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {certificate.grade}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Issue Date
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {new Date(certificate.issue_date).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Certificate ID
                  </Typography>
                  <Typography
                    variant="h6"
                    color="primary.main"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {certificate.certificate_number}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: "80%",
                  mb: 4,
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                Hopefully this achievement will be the first step towards bigger
                success.
                <br />
                keep trying and give your best
              </Typography>

              {/* Signatures */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  width: "100%",
                  mt: "auto",
                  pt: 4,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      borderTop: `2px solid ${theme.palette.divider}`,
                      pt: 1,
                      color: theme.palette.text.primary,
                      fontFamily: "'Great Vibes', cursive",
                      fontSize: "1.8rem",
                      lineHeight: 1,
                    }}
                  >
                    {certificate.instructor_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {certificate.instructor_title}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      borderTop: `2px solid ${theme.palette.divider}`,
                      pt: 1,
                      color: theme.palette.text.primary,
                      fontWeight: "medium",
                    }}
                  >
                    Connor Hamilton
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Academic Director
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
            }}
          >
            <Button variant="outlined" startIcon={<ShareIcon />} size="small">
              Chia sẻ
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              size="small"
            >
              Tải về
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateDetail;
