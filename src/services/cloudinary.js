import axios from 'axios';

const CLOUD_NAME = "dicyag9gdu";
const UPLOAD_PRESET = "campus-lost-found";

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Image upload failed");
    }
};