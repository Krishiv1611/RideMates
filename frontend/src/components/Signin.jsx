import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import client from "../api/client";
import GoogleSignInButton from "./GoogleSignInButton";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await client.post(`/users/signin`, { email: email.toLowerCase(), password });

      if (data?.token) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          navigate("/create");
        }, 1500); // Delay so toast is shown
      } else {
        toast.error(data?.message || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0e0e12", fontFamily: "'Poppins', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <div className="bg-[#111218] w-full max-w-md p-8 rounded-2xl shadow-lg border border-[#242533]">
        <h1 className="text-3xl font-semibold text-center text-white">RideMates</h1>
        <p className="text-center text-gray-400 mt-1 mb-8">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#14151c] placeholder-gray-400 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#14151c] placeholder-gray-400 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]"
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#f72585] hover:bg-[#e31d78] text-white font-medium text-base py-3 rounded-lg transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-[#2a2a35] flex-1" />
          <span className="text-sm text-gray-400">or</span>
          <div className="h-px bg-[#2a2a35] flex-1" />
        </div>

        <GoogleSignInButton onSuccess={() => {
          toast.success("Login successful!");
          setTimeout(() => navigate("/create"), 800);
        }} />

        <p className="text-center text-gray-400 mt-4 text-sm">New to RideMates? <Link to="/" className="text-[#f72585] hover:underline">Register</Link></p>
      </div>
    </div>
  );
};

export default Signin;

