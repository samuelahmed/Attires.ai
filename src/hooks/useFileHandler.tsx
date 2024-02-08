import { useState } from "react";

const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/bmp",
  "image/tiff",
  "image/gif",
];

const useFileHandler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const createMaskImg = async (imgUrl: string) => {
    try {
      const response = await fetch("/api/images/uploadMaskToS3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imgUrl }),
      });
      if (response.ok) {
        location.reload();
      } else {
        console.error("Response:", response);
        const responseBody = await response.text();
        console.error("Response body:", responseBody);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/images/uploadToS3", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      await createMaskImg(data.s3URL);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !SUPPORTED_FILE_TYPES.includes(file.type)) {
      setErrorMessage("Please upload a JPEG, PNG, BMP, TIFF, or GIF image.");
      return;
    }
    setUploading(true);
    try {
      await uploadFile(file);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };
  return {
    file,
    uploading,
    errorMessage,
    handleFileChange,
    handleSubmit,
  };
};

export default useFileHandler;
