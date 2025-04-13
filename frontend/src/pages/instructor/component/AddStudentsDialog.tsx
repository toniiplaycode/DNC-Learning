import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const AddStudentsDialog = ({ open, onClose, classData, onSubmit }) => {
  const [tabValue, setTabValue] = useState(0);
  const [singleStudent, setSingleStudent] = useState({
    studentCode: "",
    fullName: "",
    email: "",
    phone: "",
  });
  const [importedStudents, setImportedStudents] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSingleStudentSubmit = () => {
    onSubmit([singleStudent]);
    setSingleStudent({ studentCode: "", fullName: "", email: "", phone: "" });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const formattedData = jsonData.map((row: any) => ({
        studentCode: row["Mã sinh viên"],
        fullName: row["Họ và tên"],
        email: row["Email"],
        phone: row["Số điện thoại"],
      }));

      setImportedStudents(formattedData);
      validateData(formattedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const validateData = (data) => {
    const newErrors = data
      .map((student, index) => {
        const errors = [];
        if (!student.studentCode) errors.push("Thiếu mã sinh viên");
        if (!student.fullName) errors.push("Thiếu họ tên");
        if (!student.email) errors.push("Thiếu email");
        return errors.length > 0 ? { row: index + 1, errors } : null;
      })
      .filter(Boolean);

    setErrors(newErrors);
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Mã sinh viên": "SV001",
        "Họ và tên": "Nguyễn Văn A",
        Email: "example@gmail.com",
        "Số điện thoại": "0123456789",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_import_students.xlsx");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Thêm sinh viên vào lớp {classData?.academicClass.className}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Mã lớp: {classData?.academicClass.classCode}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Thêm thủ công" />
          <Tab label="Nhập từ file Excel" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Mã sinh viên"
              value={singleStudent.studentCode}
              onChange={(e) =>
                setSingleStudent({
                  ...singleStudent,
                  studentCode: e.target.value,
                })
              }
              required
            />
            <TextField
              label="Họ và tên"
              value={singleStudent.fullName}
              onChange={(e) =>
                setSingleStudent({ ...singleStudent, fullName: e.target.value })
              }
              required
            />
            <TextField
              label="Email"
              type="email"
              value={singleStudent.email}
              onChange={(e) =>
                setSingleStudent({ ...singleStudent, email: e.target.value })
              }
              required
            />
            <TextField
              label="Số điện thoại"
              value={singleStudent.phone}
              onChange={(e) =>
                setSingleStudent({ ...singleStudent, phone: e.target.value })
              }
            />
            <Button
              variant="contained"
              onClick={handleSingleStudentSubmit}
              disabled={
                !singleStudent.studentCode ||
                !singleStudent.fullName ||
                !singleStudent.email
              }
            >
              Thêm sinh viên
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              sx={{ mr: 2 }}
            >
              Tải file mẫu
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Tải file lên
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>

          {errors.length > 0 && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: "error.light" }}>
              <Typography color="error" variant="subtitle2" gutterBottom>
                Lỗi dữ liệu:
              </Typography>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2" color="error">
                  Dòng {error.row}: {error.errors.join(", ")}
                </Typography>
              ))}
            </Paper>
          )}

          {importedStudents.length > 0 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã SV</TableCell>
                    <TableCell>Họ và tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importedStudents.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{student.studentCode}</TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const newStudents = [...importedStudents];
                            newStudents.splice(index, 1);
                            setImportedStudents(newStudents);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        {tabValue === 1 && (
          <Button
            variant="contained"
            onClick={() => onSubmit(importedStudents)}
            disabled={importedStudents.length === 0 || errors.length > 0}
          >
            Thêm {importedStudents.length} sinh viên
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
