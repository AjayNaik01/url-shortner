import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createShortUrl } from "../api/shorturl.api";

// Get base URL from environment variables
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'https://url-shortner-eight-lime.vercel.app';

function UrlForm() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShortUrl("");
    setCopied(false);

    if (!url.trim()) {
      setError("⛔ Enter a URL!");
      return;
    }

    setLoading(true);
    try {
      const response = await createShortUrl(url);
      const fullShortUrl = `${BASE_URL}/${response.data.short_url}`;
      setShortUrl(fullShortUrl);
      setSuccess("✅ URL shortened successfully!");
      setUrl(""); // Clear the input
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("URL Error:", error);
      if (error.response) {
        const message = error.response.data.message || "Unknown error";
        setError(`⚠️ ${message}`);
      } else {
        setError("⚠️ Could not shorten it, try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Add custom styles and prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Add custom styles for loader
    const style = document.createElement("style");
    style.textContent = `
      .loader {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(34, 197, 94, 0.2);
        border-radius: 50%;
        border-top-color: #22c55e;
        border-right-color: #22c55e;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.overflow = "auto";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-screen bg-gray-900 text-white font-mono p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider flex items-center text-green-400">
          <span className="text-2xl mr-2">🔗</span> URL SHORTENER
        </h1>
        <Link
          to="/login"
          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors font-bold text-sm flex items-center"
        >
          <span className="mr-1">🔐</span> Make custom URLs
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-center space-y-6">
        <div className="w-full bg-gray-800 p-5 rounded-lg border-l-4 border-green-500 shadow-lg">
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="url-input"
                className="text-sm text-green-300 font-semibold flex items-center"
              >
                <span className="mr-2">📎</span> Enter a long URL to shorten
              </label>
              <input
                id="url-input"
                type="url"
                placeholder="https://example.com/very-long-url..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className={`bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full text-lg transition-all duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-600'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={`font-bold py-4 text-lg transition-all duration-200 rounded-md flex items-center justify-center shadow-lg transform ${
                loading || !url.trim()
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white shadow-green-500/25'
              }`}
            >
              {loading ? (
                <>
                  <div className="loader mr-3"></div>
                  <span className="animate-pulse">SHORTENING...</span>
                </>
              ) : (
                <>
                  <span className="mr-2 text-xl">⚡</span>
                  <span className="font-semibold">SHORTEN THIS LINK</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-900 bg-opacity-40 border border-red-500 text-red-300 p-4 rounded-md text-sm flex items-center animate-pulse">
                <span className="mr-2 text-lg">❌</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-900 bg-opacity-40 border border-green-500 text-green-300 p-4 rounded-md text-sm flex items-center animate-bounce">
                <span className="mr-2 text-lg">✅</span>
                <span>{success}</span>
              </div>
            )}
          </form>
        </div>

        {shortUrl && (
          <div className="w-full bg-gray-800 p-4 rounded-lg border-l-4 border-green-500 shadow-lg">
            <h2 className="text-lg font-bold text-green-400 mb-3 text-center">
              Your Shortened URL
            </h2>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-300 text-base font-bold break-all hover:underline block text-center md:text-left"
                >
                  {shortUrl}
                </a>

                <div className="flex justify-center md:justify-start mt-2">
                  <button
                    onClick={handleCopy}
                    type="button"
                    className={`px-4 py-2 rounded-md font-bold transition-colors shadow-md text-sm ${
                      copied
                        ? "bg-green-700 text-white"
                        : "bg-blue-700 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {copied ? "✅ COPIED!" : "📋 COPY LINK"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-xs text-green-300 mb-1">
                  Scan with phone
                </p>
                <div className="p-1 bg-white rounded">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      shortUrl
                    )}`}
                    alt="QR Code"
                    width="100"
                    height="100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UrlForm;
