import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { CertificateStatus } from "../../types/certificate.types";

// Base selectors
export const selectCertificatesState = (state: RootState) => state.certificates;
export const selectAllCertificates = (state: RootState) =>
  state.certificates.certificates;
export const selectUserCertificates = (state: RootState) =>
  state?.certificates?.userCertificates ?? [];
export const selectCourseCertificates = (state: RootState) =>
  state.certificates.courseCertificates;
export const selectCurrentCertificate = (state: RootState) =>
  state.certificates.currentCertificate;
export const selectVerificationResult = (state: RootState) =>
  state.certificates.verificationResult;
export const selectCertificatesStatus = (state: RootState) =>
  state.certificates.status;
export const selectCertificatesError = (state: RootState) =>
  state.certificates.error;

// Derived selectors
export const selectActiveCertificates = createSelector(
  [selectUserCertificates],
  (certificates) =>
    certificates.filter((c) => c.status === CertificateStatus.ACTIVE)
);

export const selectExpiredCertificates = createSelector(
  [selectUserCertificates],
  (certificates) =>
    certificates.filter((c) => c.status === CertificateStatus.EXPIRED)
);

export const selectRevokedCertificates = createSelector(
  [selectUserCertificates],
  (certificates) =>
    certificates.filter((c) => c.status === CertificateStatus.REVOKED)
);

// Check if a user has a certificate for a course
export const selectHasCertificateForCourse = (courseId: number) =>
  createSelector([selectUserCertificates], (certificates) =>
    certificates.some(
      (c) => c.courseId === courseId && c.status === CertificateStatus.ACTIVE
    )
  );

// Get a certificate for a specific course if it exists
export const selectCertificateForCourse = (courseId: number) =>
  createSelector([selectUserCertificates], (certificates) =>
    certificates.find((c) => c.courseId === courseId)
  );

// Select certificate count by status
export const selectCertificateCountByStatus = createSelector(
  [selectUserCertificates],
  (certificates) => {
    return {
      active: certificates.filter((c) => c.status === CertificateStatus.ACTIVE)
        .length,
      expired: certificates.filter(
        (c) => c.status === CertificateStatus.EXPIRED
      ).length,
      revoked: certificates.filter(
        (c) => c.status === CertificateStatus.REVOKED
      ).length,
      total: certificates.length,
    };
  }
);

// Select recently issued certificates
export const selectRecentCertificates = createSelector(
  [selectUserCertificates],
  (certificates) => {
    return [...certificates]
      .sort(
        (a, b) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      )
      .slice(0, 5); // Get the 5 most recent certificates
  }
);
