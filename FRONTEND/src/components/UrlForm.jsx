import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createShortUrl } from "../api/shorturl.api";

function UrlForm() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setCopied(false);

    if (!url.trim()) {
      setError("⛔ Enter a URL!");
      return;
    }

    try {
      const response = await createShortUrl(url);
      setShortUrl(response.data.short_url);
    } catch (error) {
      console.error("URL Error:", error);
      setError("⚠️ Could not shorten it, try again.");
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

  // Prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono p-4 md:p-6 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <Link
          to="/login"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-bold text-sm flex items-center"
        >
          <span className="mr-2">🔐</span> Make custom URLs
        </Link>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider flex items-center text-green-400">
          <span className="text-5xl mr-3">🔗</span> URL SHORTENER
        </h1>

        <div className="w-full bg-gray-800 p-6 rounded-lg border-l-4 border-green-500 shadow-lg">
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
                type="text"
                placeholder="https://example.com/very-long-url..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-lg"
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white font-bold py-3 text-lg hover:bg-green-700 transition-colors rounded-md flex items-center justify-center shadow-md"
            >
              <span className="mr-2">⚡</span> SHORTEN THIS LINK
            </button>

            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </form>
        </div>

        {shortUrl && (
          <div className="w-full bg-gray-800 p-6 rounded-lg border-l-4 border-green-500 shadow-lg flex flex-col items-center space-y-4">
            <h2 className="text-xl font-bold text-green-400">
              Your Shortened URL
            </h2>

            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-300 text-lg font-bold break-all hover:underline"
            >
              {shortUrl}
            </a>

            <button
              onClick={handleCopy}
              type="button"
              className={`px-6 py-2 rounded-md font-bold transition-colors shadow-md ${
                copied
                  ? "bg-green-700 text-white"
                  : "bg-blue-700 hover:bg-blue-600 text-white"
              }`}
            >
              {copied ? "✅ COPIED!" : "📋 COPY LINK"}
            </button>

            <div className="mt-4 flex flex-col items-center">
              <p className="text-sm text-green-300 mb-2">
                Scan with your phone
              </p>
              <div className="p-3 bg-white rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    shortUrl
                  )}`}
                  alt="QR Code"
                  width="150"
                  height="150"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UrlForm;
