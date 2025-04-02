import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { DocumentType } from "../../types/document.types";

// Base selectors
export const selectDocumentsState = (state: RootState) => state.documents;
export const selectAllDocuments = (state: RootState) =>
  state.documents.documents;
export const selectCourseDocuments = (state: RootState) =>
  state.documents.courseDocuments;
export const selectSectionDocuments = (state: RootState) =>
  state.documents.sectionDocuments;
export const selectCurrentDocument = (state: RootState) =>
  state.documents.currentDocument;
export const selectDocumentsStatus = (state: RootState) =>
  state.documents.status;
export const selectDocumentsError = (state: RootState) => state.documents.error;

// Derived selectors
export const selectDocumentsByType = (type: DocumentType) =>
  createSelector([selectAllDocuments], (documents) =>
    documents.filter((doc) => doc.fileType === type)
  );

export const selectCourseDocumentsByType = (type: DocumentType) =>
  createSelector([selectCourseDocuments], (documents) =>
    documents.filter((doc) => doc.fileType === type)
  );

export const selectSectionDocumentsByType = (type: DocumentType) =>
  createSelector([selectSectionDocuments], (documents) =>
    documents.filter((doc) => doc.fileType === type)
  );

// Chọn document theo ID
export const selectDocumentById = (id: number) =>
  createSelector(
    [selectAllDocuments],
    (documents) => documents.find((doc) => doc.id === id) || null
  );

// Đếm số lượng documents theo loại
export const selectDocumentCountByType = createSelector(
  [selectAllDocuments],
  (documents) => {
    const counts = {
      pdf: 0,
      docx: 0,
      xlsx: 0,
      video: 0,
      image: 0,
      other: 0,
      total: documents.length,
    };

    documents.forEach((doc) => {
      switch (doc.fileType) {
        case DocumentType.PDF:
          counts.pdf++;
          break;
        case DocumentType.WORD:
          counts.docx++;
          break;
        case DocumentType.EXCEL:
          counts.xlsx++;
          break;
        case DocumentType.VIDEO:
          counts.video++;
          break;
        case DocumentType.IMAGE:
          counts.image++;
          break;
        case DocumentType.OTHER:
          counts.other++;
          break;
      }
    });

    return counts;
  }
);

// Tìm document theo tên (title hoặc description)
export const selectDocumentsBySearchTerm = (searchTerm: string) =>
  createSelector([selectAllDocuments], (documents) => {
    if (!searchTerm) return documents;

    const lowerCaseSearch = searchTerm.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowerCaseSearch) ||
        doc.description.toLowerCase().includes(lowerCaseSearch)
    );
  });
