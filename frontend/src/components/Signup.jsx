import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import client from "../api/client";
import GoogleSignInButton from "./GoogleSignInButton";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false); // optional loading state

  const navigate = useNavigate();
  const BASE_URL = "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await client.post(`/users/signup`, { name, branch, email, password, year, mobile });

      if (data?.token) {
        toast.success("Registration successful!");
        localStorage.setItem("token", data.token);

        setTimeout(() => {
          navigate("/create");
        }, 1500); // wait for toast to show
      } else {
        toast.error(data?.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0e0e12", fontFamily: "'Poppins', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <div className="bg-[#111218] w-full max-w-md p-8 rounded-2xl shadow-lg border border-[#242533]">
        <h1 className="text-3xl font-semibold text-center text-white">Create your account</h1>
        <p className="text-center text-gray-400 mt-1 mb-8">Use your @mail.jiit.ac.in email</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#14151c] placeholder-gray-400 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]"
          />

          <input
            type="email"
            placeholder="Email (@mail.jiit.ac.in only)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="^[a-zA-Z0-9._%+-]+@mail\.jiit\.ac\.in$"
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

          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            pattern="^[6-9]{1}[0-9]{9}$"
            className="bg-[#14151c] placeholder-gray-400 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]"
          />

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="bg-[#14151c] text-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]"
          >
            <option value="" disabled>
              Select Year
            </option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>

          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            className="bg-[#14151c] text-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]"
          >
            <option value="" disabled>
              Select Branch
            </option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="MNC">MNC</option>
            <option value="ECM">ECM</option>
            <option value="Biotechnology">Biotechnology</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#f72585] hover:bg-[#e31d78] text-white font-medium text-base py-3 rounded-lg transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-[#2a2a35] flex-1" />
          <span className="text-sm text-gray-400">or</span>
          <div className="h-px bg-[#2a2a35] flex-1" />
        </div>

        <GoogleSignInButton onSuccess={() => {
          toast.success("Registration successful!");
          setTimeout(() => navigate("/create"), 800);
        }} />

        <p className="text-center text-gray-400 mt-4 text-sm">Already have an account? <Link to="/signin" className="text-[#f72585] hover:underline">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;

