import React, { useState, useEffect, useCallback } from "react";
import { usePdf } from "../../contexts/PdfContext";

/**
 * Entire card is clickable (anchor wraps the layout).
 * Hover effects:
 *  - card: slightly elevated shadow + translate
 *  - thumbnail: smooth scale up (zoom preview)
 *
 * Behavior:
 *  - if video.youtube.url exists, clicking opens that URL
 *  - otherwise clicking opens a YouTube search for the title
 */
const VideoCard = ({ video }) => {
  const title = (video.title || "").toString();
  const description = (video.description || "").toString();
  const yt = video.youtube || null;
  const watchUrl = yt?.url
    ? yt.url
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
  const thumbnail = yt?.id
    ? `https://i.ytimg.com/vi/${yt.id}/hqdefault.jpg`
    : null;

  const handleClick = () => {
    window.open(watchUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className="block group cursor-pointer"
      aria-label={`Open video for ${title}`}
    >
      <div className="border rounded-md p-4 mb-4 bg-gray-50 flex gap-4 group-hover:shadow-lg">
        <div className="w-28 flex-shrink-0 overflow-hidden rounded-md">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-20 object-cover duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="bg-gray-200 rounded-md w-full h-20 flex items-center justify-center text-xs text-gray-600">
              No thumbnail
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-md mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default function YouTubeVideosPanel({ pdfUrl }) {
  const { activeFile } = usePdf();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCacheKey = useCallback(
    () => `youtube_suggestions_${activeFile?.id || "no_url"}`,
    [activeFile]
  );

  useEffect(() => {
    const cached = localStorage.getItem(getCacheKey());
    if (cached) {
      try {
        setVideos(JSON.parse(cached));
      } catch {
        setVideos([]);
      }
    } else {
      setVideos([]);
    }
    setError(null);
  }, [pdfUrl, getCacheKey]);

  const fetchYouTubeSuggestions = async () => {
    if (!pdfUrl) {
      setError("No PDF URL provided.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF.");
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("file", blob, "document.pdf");

      const suggestionsResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/youtube-suggestions`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!suggestionsResponse.ok) {
        const txt = await suggestionsResponse.text().catch(() => "");
        throw new Error(`Failed to fetch YouTube suggestions. ${txt || suggestionsResponse.statusText}`);
      }

      const data = await suggestionsResponse.json();
      const normalized = Array.isArray(data.videos)
        ? data.videos.map((v) => ({
            title: v.title || "",
            description: v.description || "",
            youtube: v.youtube || null,
          }))
        : [];

      setVideos(normalized);
      localStorage.setItem(getCacheKey(), JSON.stringify(normalized));
    } catch (err) {
      console.error("YouTube suggestions error:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(getCacheKey());
    setVideos([]);
    setError(null);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={fetchYouTubeSuggestions}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-red-400 text-white rounded hover:bg-red-500 disabled:opacity-50"
          >
            {isLoading ? "Getting Suggestions..." : "Suggest Videos"}
          </button>

          <button
            onClick={clearCache}
            disabled={isLoading}
            className="px-3 py-2 text-sm border rounded text-gray-700 hover:bg-gray-100"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div className="overflow-y-auto flex-1">
        {isLoading && videos.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div
              className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"
              style={{ borderTopColor: "#f87171" }}
            />
            <p className="mt-4 text-gray-600 font-medium">
              Generating suggestions—this may take a few minutes.
            </p>
          </div>
        ) : videos.length > 0 ? (
          videos.map((video, index) => <VideoCard key={index} video={video} />)
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Click "Suggest Videos" to get YouTube recommendations based on the
              PDF content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
