interface CloudinaryResponse {
  url: string;
  // Add other response fields if needed
}

const CLOUDINARY_UPLOAD_PRESET = "chat-app";
const CLOUDINARY_CLOUD_NAME = "dj8ae1gpq";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const validateImageFile = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/png", "image/jpg"];
  return validTypes.includes(file.type);
};

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  if (!validateImageFile(file)) {
    throw new Error(
      "Invalid file type. Please upload JPG, JPEG or PNG files only."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data: CloudinaryResponse = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

export const createObjectURL = (file: File): string => {
  return URL.createObjectURL(file);
};
