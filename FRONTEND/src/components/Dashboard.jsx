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
  const navigate = useNavigate();
  const qrRef = useRef(null);

  // Fetch all URLs created by the user
  const fetchUserUrls = async () => {
    // Only fetch URLs if user is authenticated
    if (!user) {
      console.log("Not fetching URLs - no user authenticated");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

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
      const response = await customShortUrl(url, slug);
      console.log(response.data);
      setShortUrl(response.data.shortUrl);
      // Refresh the list of URLs after creating a new one
      fetchUserUrls();
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
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(34, 197, 94, 0.5);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(34, 197, 94, 0.8);
      }

      /* Loader animation */
      .loader {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(34, 197, 94, 0.3);
        border-radius: 50%;
        border-top-color: #22c55e;
        animation: spin 1s ease-in-out infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
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

  return (
    <>
      <div className="w-screen h-screen bg-gray-900 text-white font-mono p-4 md:p-6 flex flex-col items-center overflow-hidden">
        {/* Header with user info and logout */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-green-500">
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

        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
          {/* Left Column - URL Creation Form */}
          <div className="w-full md:w-2/5">
            <form
              onSubmit={handleSubmit}
              className="w-full h-full flex flex-col space-y-4 bg-gray-800 p-5 rounded-lg border-l-4 border-green-500 shadow-lg"
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
                    type="text"
                    placeholder="https://example.com/very-long-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-xs">
                      {BASE_URL.replace(/^https?:\/\//, '')}/
                    </span>
                  </div>
                  <input
                    id="customSlug"
                    type="text"
                    placeholder="my-custom-url"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-green-300 pl-48 px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white font-bold py-3 text-base hover:bg-green-700 transition rounded-md mt-2 flex items-center justify-center shadow-md"
              >
                <span className="mr-2">⚡</span> SHORTEN THIS LINK
              </button>

              {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 p-3 rounded-md text-sm">
                  {error}
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
          <div className="w-full md:w-3/5">
            <div className="bg-gray-800 rounded-lg border-l-4 border-green-500 shadow-lg h-full">
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
              ) : loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-yellow-400 animate-pulse flex flex-col items-center">
                    <div className="loader mb-2"></div>
                    <p>Loading your URLs...</p>
                  </div>
                </div>
              ) : userUrls.length > 0 ? (
                <div className="h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar p-3">
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
    </>
  );
}
export default Dashboard;
