import { api } from "../services/api";

interface UploadResponse {
  success: boolean;
  fileUrl: string;
  fileName?: string;
  fileId?: string;
  viewUrl?: string;
  downloadUrl?: string;
  directLink?: string;
  embedUrl?: string;
  mimeType?: string;
  message?: string;
}

/**
 * Upload a file to Google Drive
 * @param file The file to upload
 * @param onProgress Callback function to track upload progress (0-100)
 * @returns Promise with the uploaded file URL and additional information
 */
export const uploadToDrive = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  // Create form data
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Make request to your backend API
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    // Trả về đầy đủ thông tin từ API
    return {
      success: true,
      fileUrl: response.data.fileUrl,
      fileName: response.data.fileName,
      fileId: response.data.fileId,
      viewUrl: response.data.viewUrl,
      downloadUrl: response.data.downloadUrl,
      directLink: response.data.directLink,
      embedUrl: response.data.embedUrl,
      mimeType: response.data.mimeType,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      fileUrl: "",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Lấy URL phù hợp từ response tùy theo loại nội dung
 * @param response Response từ API upload
 * @param contentType Loại nội dung (video, image, pdf, etc.)
 * @returns URL phù hợp nhất cho loại nội dung
 */
export const getBestUrlForContent = (
  response: UploadResponse,
  contentType: string
): string => {
  if (!response || !response.success) return "";

  // Kiểm tra loại nội dung và trả về URL phù hợp
  if (contentType.includes("video")) {
    return response.embedUrl || response.fileUrl;
  } else if (
    contentType === "pdf" ||
    contentType === "docx" ||
    contentType === "slide"
  ) {
    return response.embedUrl || response.fileUrl;
  } else if (contentType === "image" || response.mimeType?.includes("image")) {
    return response.directLink || response.fileUrl;
  } else {
    // Mặc định
    return response.fileUrl;
  }
};

export default uploadToDrive;
