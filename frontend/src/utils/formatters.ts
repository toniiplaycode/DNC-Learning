export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export function getFileIdFromUrl(url: string): string {
  // Xử lý URL dạng /file/d/{fileId}/view hoặc /presentation/d/{fileId}/edit
  const fileIdMatch = url.match(/\/d\/([^\/]+)/);
  return fileIdMatch ? fileIdMatch[1] : "";
}
