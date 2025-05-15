export function getFileIdFromUrl(url: string): string {
  // Xử lý URL dạng /file/d/{fileId}/view hoặc /presentation/d/{fileId}/edit
  const fileIdMatch = url.match(/\/d\/([^\/]+)/);
  return fileIdMatch ? fileIdMatch[1] : "";
}

// Format thời gian
export const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Lỗi khi định dạng ngày:", error);
    return "Lỗi định dạng";
  }
};

// Format thời gian (giờ:phút)
export const formatTime = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return "Không hợp lệ";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Lỗi khi định dạng thời gian:", error);
    return "Lỗi định dạng";
  }
};
