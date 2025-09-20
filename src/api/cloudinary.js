// The configuration is now read from your .env file
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error("Cloudinary configuration is missing. Check your .env file.");
    alert("Upload service is not configured correctly.");
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'File upload failed');
    }

    const data = await response.json();
    return data.secure_url; // This is the URL of the uploaded file
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    alert(`Failed to upload file: ${error.message}`);
    return null;
  }
};