"use client";

import axios from "axios";
import { ChangeEvent, useState } from "react";

export default function VideoUpload() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleUpload = async () => {
    if (!videoFile) return alert("Please select a video");

    const formData = new FormData();
    formData.append("video", videoFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    try {
      setStatus("Uploading...");
      const response = await axios.post(
        "http://localhost:3000/api/v1/videos/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setStatus(`✅ Uploaded successfully. Video ID: ${response.data.videoId}`);
    } catch (error) {
      setStatus("❌ Upload failed.");
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Upload Video</h1>

        <label className="block mb-2 text-sm font-medium">Select Video:</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) setVideoFile(e.target.files[0]);
          }}
          className="block w-full mb-4"
        />

        <label className="block mb-2 text-sm font-medium">Custom Thumbnail (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) setThumbnailFile(e.target.files[0]);
          }}
          className="block w-full mb-4"
        />

        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Upload
        </button>

        {status && <p className="mt-4 text-center">{status}</p>}
      </div>
    </div>
  );
}
