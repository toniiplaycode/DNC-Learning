import React, { useEffect } from "react";
import AssignmentContent from "../../../components/common/course/AssignmentContent";
import CustomContainer from "../../../components/common/CustomContainer";
import { Card, CardContent } from "@mui/material";
import { Typography } from "@mui/material";
import { useAppSelector } from "../../../app/hooks";
import { useParams } from "react-router-dom";
import { fetchAssignmentById } from "../../../features/assignments/assignmentsSlice";
import { useAppDispatch } from "../../../app/hooks";
import { selectCurrentAssignment } from "../../../features/assignments/assignmentsSelectors";

export const AssessmentAssignment = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const currentAssignment = useAppSelector(selectCurrentAssignment);

  useEffect(() => {
    if (id) {
      dispatch(fetchAssignmentById(Number(id)));
    }
  }, [id]);

  return (
    <CustomContainer>
      <AssignmentContent
        assignmentData={{
          id: Number(currentAssignment?.id),
          assignmentId: Number(currentAssignment?.id),
          title: currentAssignment?.title || "",
          description: currentAssignment?.description || "",
          dueDate: currentAssignment?.dueDate || "",
          maxFileSize: 10,
          allowedFileTypes: [
            ".pdf",
            ".doc",
            ".docx",
            ".zip",
            ".rar",
            ".js",
            ".ts",
            ".tsx",
          ],
          maxFiles: 5,
        }}
        onSubmit={(files, note) => {
          console.log("Files:", files);
          console.log("Note:", note);
          // Thêm logic xử lý submit
        }}
      />

      {/* Content description */}
      <Card sx={{ mt: 3, boxShadow: 0 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentAssignment?.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              mb: 3,
              color: "text.secondary",
            }}
          >
            {currentAssignment?.description}
          </Typography>
        </CardContent>
      </Card>
    </CustomContainer>
  );
};

// Thêm default export
export default AssessmentAssignment;
