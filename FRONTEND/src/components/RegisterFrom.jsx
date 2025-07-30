import React, { useState } from "react";
import { registerUser } from "../api/user.api.js";
import { useNavigate } from "react-router-dom";

function RegisterForm({ onRegister, onToggle }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const res = await registerUser(name.trim(), email.trim(), password);
      setSuccess(res.message || "Registration successful!");
      onRegister?.(res);
      navigate("/dashboard"); // Navigate to dashboard instead of login
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white font-mono p-4 md:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-lg border-l-4 border-green-500 shadow-lg p-6">
        <h1 className="text-3xl font-bold tracking-wider text-green-400 flex items-center justify-center mb-6">
          <span className="text-4xl mr-3">📝</span> REGISTER
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm text-green-300 font-semibold flex items-center">
              <span className="mr-2">👤</span> Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-green-300 font-semibold flex items-center">
              <span className="mr-2">📧</span> Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-green-300 font-semibold flex items-center">
              <span className="mr-2">🔒</span> Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className="bg-gray-900 border border-gray-700 text-green-300 px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-400 p-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white font-bold py-3 text-base hover:bg-green-700 transition rounded-md mt-2 flex items-center justify-center shadow-md"
          >
            <span className="mr-2">✅</span> REGISTER
          </button>
        </form>

        <div className="mt-6 text-center">
          <p
            className="text-green-400 font-mono cursor-pointer select-none inline-block"
            onClick={onToggle}
          >
            Already have an account?{" "}
            <span className="underline hover:text-green-300 transition-colors">
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
