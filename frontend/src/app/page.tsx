"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Video {
  id: string;
  movieId: string;
  processingStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/videos/all");
        setVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 px-2">
          <h1 className="text-3xl font-bold text-gray-800">StreamGenix</h1>
          <Link
            href="/videoupload"
            className="text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg shadow transition"
          >
            Upload Video
          </Link>
        </div>

        {/* Video Grid */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-2">
            {videos.map((video) => {
              const videoId = video.movieId.replace("output/", "");
              return (
                <Link
                  key={video.id}
                  href={`/stream/${videoId}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 overflow-hidden"
                >
                  <div className="relative w-full aspect-video bg-gray-200">
                    <img
                      src={`http://localhost:3000/output/${videoId}/thumbnail.jpg`}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-800 font-medium truncate">
                      {videoId}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
