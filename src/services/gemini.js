// src/services/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export const generateImageLabels = async (file) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const imagePart = await fileToGenerativePart(file);

    const result = await model.generateContent([
      "Describe the object in this image with a comma-separated list of keywords. Focus on material, color, and type. For example: 'brown, leather, wallet'",
      imagePart,
    ]);

    const response = await result.response;
    const text = response.text();
    // Clean up the text, remove markdown and extra spaces
    const cleanedText = text.replace(/`/g, '').replace(/\n/g, '');
    const labels = cleanedText.split(',').map(label => label.trim()).filter(label => label !== '');
    return labels;
  } catch (error) {
    console.error("Error generating labels with Gemini API:", error);
    return [];
  }
};