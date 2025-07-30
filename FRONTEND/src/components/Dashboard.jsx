import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { customShortUrl, getAllUrl } from "../api/shorturl.api";
import { getCurrentUser, logoutUser } from "../api/user.api";

// Get base URL from environment variables
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'https://url-shortner-eight-lime.vercel.app';

function Dashboard() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [userUrls, setUserUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const qrRef = useRef(null);

  // Fetch all URLs created by the user
  const fetchUserUrls = async () => {
    // Only fetch URLs if user is authenticated
    if (!user) {
      console.log("Not fetching URLs - no user authenticated");
      return;
    }

    setLoadingUrls(true);
    try {
      console.log("Fetching URLs for user:", user.name, user._id);
      const response = await getAllUrl();
      console.log("User URLs response:", response.data);

      if (Array.isArray(response.data)) {
        setUserUrls(response.data);
        console.log(
          `Loaded ${response.data.length} URLs for user ${user.name}`
        );
      } else {
        console.error("Unexpected response format:", response.data);
        setUserUrls([]);
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
      if (error.response && error.response.status === 401) {
        console.log("Authentication error - token may be invalid");
        // Don't immediately redirect - try refreshing the token first
        try {
          // Try to refresh user data instead of immediately logging out
          await fetchCurrentUser();
          // If successful, try fetching URLs again
          const response = await getAllUrl();
          if (Array.isArray(response.data)) {
            setUserUrls(response.data);
          }
        } catch (refreshError) {
          console.error("Failed to refresh authentication:", refreshError);
          setError("Your session has expired. Please log in again.");
          // Only redirect after refresh attempt fails
          navigate("/login");
        }
      } else {
        setError(`Error loading URLs: ${error.message}`);
      }
    } finally {
      setLoadingUrls(false);
    }
  };

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

    setSubmitting(true);
    try {
      const response = await customShortUrl(url, slug);
      console.log(response.data);
      setShortUrl(response.data.shortUrl);
      setSuccess("✅ URL shortened successfully!");
      // Clear form after successful submission
      setUrl("");
      setSlug("");
      // Refresh the list of URLs after creating a new one
      fetchUserUrls();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("URL Error:", error);

      // Handle different error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        const message = error.response.data.message || "Unknown error";

        if (status === 409) {
          setError(`⚠️ ${message}`);
        } else if (status === 401) {
          setError(`⚠️ Authentication error: ${message}. Please log in again.`);
        } else {
          setError(`⚠️ Error (${status}): ${message}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError("⚠️ No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`⚠️ Request error: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
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

  const downloadQRCode = () => {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = pngFile;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Function to fetch current user
  const fetchCurrentUser = async () => {
    setLoadingUser(true);
    try {
      console.log("Fetching current user...");
      const data = await getCurrentUser();
      console.log("Current user data:", data);

      if (data && data.user) {
        console.log("User authenticated:", data.user.name, data.user._id);
        setUser(data.user);
      } else {
        console.log("No user data returned from API");
        // If no user is found, redirect to login
        setError("Please log in to view your URLs");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);

      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token"); // Clear invalid token
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Authentication error: " + (error.message || "Unknown error"));
      }

      navigate("/login");
    } finally {
      setLoadingUser(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Fetch user when component mounts
  useEffect(() => {
    fetchCurrentUser();

    // Add custom scrollbar and loader styles
    const style = document.createElement("style");
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(31, 41, 55, 0.5);
        border-radius: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(34, 197, 94, 0.6);
        border-radius: 6px;
        transition: background 0.2s ease;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(34, 197, 94, 0.9);
      }

      /* Loader animation */
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

      /* Pulse animation for loading states */
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [navigate]);

  // Fetch URLs when user changes
  useEffect(() => {
    if (user) {
      fetchUserUrls();
    }
  }, [user]);

  // Show loading screen while fetching user
  if (loadingUser) {
    return (
      <div className="min-h-screen w-full bg-gray-900 text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="loader mb-4 mx-auto"></div>
          <h2 className="text-xl text-green-400 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-400">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full bg-gray-900 text-white font-mono overflow-y-auto custom-scrollbar">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header with user info and logout */}
          <div className="w-full flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-green-500">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider flex items-center">
            <span className="text-3xl md:text-4xl mr-2 text-green-400">🔗</span>
            <span className="text-green-400">URL SHORTENER</span>
          </h1>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-md bg-green-600 flex items-center justify-center text-white font-bold border border-green-400 shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-green-300 text-sm md:text-base">
                    {user.name}
                  </span>
                  <span className="text-gray-400 text-xs hidden md:inline">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center"
              >
                <span className="mr-1">⬅️</span> Logout
              </button>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Left Column - URL Creation Form */}
          <div className="w-full lg:w-2/5">
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col space-y-6 bg-gray-800 p-6 rounded-lg border-l-4 border-green-500 shadow-lg"
            >
              <h2 className="text-xl font-bold text-green-400 border-b border-gray-700 pb-2">
                Create Short URL
              </h2>

              <div className="space-y-2">
                <label
                  htmlFor="longUrl"
                  className="text-sm text-green-300 font-semibold flex items-center"
                >
                  <span className="mr-2">📎</span> Long URL
                </label>
                <div className="relative">
                  <input
                    id="longUrl"
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={submitting}
                    className={`bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full text-sm transition-all duration-200 ${
                      submitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-600'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="customSlug"
                  className="text-sm text-green-300 font-semibold flex items-center"
                >
                  <span className="mr-2">🏷️</span> Custom Slug (Optional)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-gray-400 bg-gray-800 px-3 py-2 rounded-md border border-gray-700">
                    <span className="text-green-400 mr-1">🌐</span>
                    <span className="break-all">{BASE_URL.replace(/^https?:\/\//, '')}/</span>
                    <span className="text-green-300 font-semibold">your-custom-slug</span>
                  </div>
                  <input
                    id="customSlug"
                    type="text"
                    placeholder="Enter custom slug (optional)"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={submitting}
                    className={`bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full text-sm transition-all duration-200 ${
                      submitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-600'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !url.trim()}
                className={`font-bold py-4 text-base transition-all duration-200 rounded-md mt-4 flex items-center justify-center shadow-lg transform ${
                  submitting || !url.trim()
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white shadow-green-500/25'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="loader mr-3"></div>
                    <span className="animate-pulse">SHORTENING...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2 text-lg">⚡</span>
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

              {shortUrl && (
                <div className="mt-4 bg-gray-900 border border-green-700 rounded-md p-4">
                  <p className="text-green-400 text-sm mb-2">
                    Your shortened URL:
                  </p>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-sm break-all hover:text-green-400"
                  >
                    {shortUrl}
                  </a>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={handleCopy}
                      type="button"
                      className={`px-3 py-1 text-xs rounded-md ${
                        copied
                          ? "bg-green-700"
                          : "bg-blue-700 hover:bg-blue-800"
                      } text-white`}
                    >
                      {copied ? "✓ COPIED!" : "📋 COPY"}
                    </button>
                    <button
                      onClick={downloadQRCode}
                      type="button"
                      className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md text-xs"
                    >
                      ⬇ QR CODE
                    </button>
                  </div>
                  <div
                    ref={qrRef}
                    className="mt-3 p-2 bg-white rounded-md inline-block"
                  >
                    <QRCodeSVG value={shortUrl} size={120} />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - URL List */}
          <div className="w-full lg:w-3/5">
            <div className="bg-gray-800 rounded-lg border-l-4 border-green-500 shadow-lg min-h-96">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-green-400 flex items-center">
                  <span className="mr-2">📋</span> Your URLs
                </h2>
                <span className="bg-green-700 text-xs px-3 py-1 rounded-md text-white">
                  {userUrls.length} total
                </span>
              </div>

              {loadingUser ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-yellow-400 animate-pulse flex flex-col items-center">
                    <div className="loader mb-2"></div>
                    <p>Loading user data...</p>
                  </div>
                </div>
              ) : !user ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-red-500 m-4 rounded-md bg-gray-900">
                  <p className="text-red-400 mb-2">
                    Please log in to view your URLs
                  </p>
                  <Link
                    to="/login"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    Go to Login
                  </Link>
                </div>
              ) : loadingUrls ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-yellow-400 flex flex-col items-center">
                    <div className="loader mb-4"></div>
                    <p className="animate-pulse text-lg">Loading your URLs...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
                  </div>
                </div>
              ) : userUrls.length > 0 ? (
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-4">
                  <div className="space-y-3">
                    {userUrls.reverse().map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-700 rounded-md p-3 bg-gray-900 hover:bg-gray-800 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <span className="text-green-400 mr-2">URL:</span>
                            <p className="text-green-300 font-medium">
                              {item.full_url}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-blue-900 text-xs px-2 py-1 rounded-md text-blue-200 flex items-center">
                              <span className="mr-1">👁️</span> {item.clicks}{" "}
                              visits
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-400 text-xs truncate hover:text-clip hover:overflow-visible">
                            <span className="text-gray-500 mr-1">
                              Short URL:
                            </span>{" "}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            <span className="mr-1">🔗</span>
                            <span className="text-green-300">
                              {BASE_URL}/{item.short_url}
                            </span>
                          </p>
                        </div>

                        <div className="flex space-x-2 border-t border-gray-700 pt-2">
                          <a
                            href={`${BASE_URL}/${item.short_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded-md transition-colors flex items-center"
                          >
                            <span className="mr-1">🌐</span> Visit
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${BASE_URL}/${item.short_url}`
                              );
                              const el = document.getElementById(
                                `copy-msg-${item._id}`
                              );
                              if (el) {
                                el.classList.remove("hidden");
                                setTimeout(
                                  () => el.classList.add("hidden"),
                                  2000
                                );
                              }
                            }}
                            className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-md transition-colors flex items-center relative"
                          >
                            <span className="mr-1">📋</span> Copy
                            <span
                              id={`copy-msg-${item._id}`}
                              className="absolute -top-8 left-0 bg-green-800 text-white text-xs px-2 py-1 rounded-md shadow-md hidden"
                            >
                              Copied!
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              // Generate QR code using the API and download it directly
                              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                `${BASE_URL}/${item.short_url}`
                              )}`;

                              // Create a link element to download the image
                              const link = document.createElement("a");
                              link.href = qrUrl;
                              link.download = `qrcode-${item.short_url}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md transition-colors flex items-center"
                          >
                            <span className="mr-1">📱</span> QR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-green-500 m-4 rounded-md bg-gray-900">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="text-gray-400 mb-2">
                    You haven't created any URLs yet.
                  </p>
                  <p className="text-green-400 text-sm">
                    Create your first short URL using the form!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
export default Dashboard;
