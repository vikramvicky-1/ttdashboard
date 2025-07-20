import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { currentMode } = useStateContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement login logic here
    console.log("Login attempt:", formData);

    // Simulate login process
    setTimeout(() => {
      setLoading(false);
      // For now, just navigate to dashboard
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        currentMode === "Dark"
          ? "bg-main-dark-bg text-gray-200"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div
        className={`max-w-md w-full space-y-8 p-8 ${
          currentMode === "Dark" ? "bg-secondary-dark-bg" : "bg-white"
        } rounded-xl shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className={`text-3xl font-bold ${
              currentMode === "Dark" ? "text-gray-200" : "text-gray-900"
            }`}
          >
            Welcome Back
          </h2>
          <p
            className={`mt-2 text-sm ${
              currentMode === "Dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  currentMode === "Dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  currentMode === "Dark"
                    ? "bg-[#23272e] text-gray-200 border-gray-600 placeholder-gray-500"
                    : "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                }`}
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${
                  currentMode === "Dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  currentMode === "Dark"
                    ? "bg-[#23272e] text-gray-200 border-gray-600 placeholder-gray-500"
                    : "bg-white text-gray-900 border-gray-300 placeholder-gray-400"
                }`}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p
              className={`text-xs ${
                currentMode === "Dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Demo: Use any email and password to proceed
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
