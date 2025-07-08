import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false); // optional loading state

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, branch, email, password, year, mobile }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        toast.success("Registration successful!");
        localStorage.setItem("token", data.token);

        setTimeout(() => {
          navigate("/create");
        }, 1500); // wait for toast to show
      } else {
        toast.error(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: "#1e1e24",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="bg-[#111114] w-full max-w-lg p-10 rounded-3xl shadow-2xl border border-[#2e2e3e]">
        <h1
          className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#f72585] to-[#7209b7] text-center"
          style={{ letterSpacing: "0.1em" }}
        >
          RideMates
        </h1>
        <h3 className="text-center text-gray-400 mb-8 tracking-wide text-lg">
          One-step solution for JIIT students
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#1e1e24] placeholder-gray-400 text-white rounded-xl px-5 py-3 text-base focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <input
            type="email"
            placeholder="Email (@mail.jiit.ac.in only)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="^[a-zA-Z0-9._%+-]+@mail\.jiit\.ac\.in$"
            className="bg-[#1e1e24] placeholder-gray-400 text-white rounded-xl px-5 py-3 text-base focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#1e1e24] placeholder-gray-400 text-white rounded-xl px-5 py-3 text-base focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            pattern="^[6-9]{1}[0-9]{9}$"
            className="bg-[#1e1e24] placeholder-gray-400 text-white rounded-xl px-5 py-3 text-base focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="bg-[#1e1e24] text-gray-400 rounded-xl px-5 py-3 text-base focus:outline-2 focus:outline-[#f72585] transition-shadow"
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
            className="bg-[#1e1e24] text-gray-400 rounded-xl px-5 py-3 text-base focus:outline-2 focus:outline-[#f72585] transition-shadow"
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
            className={`${
              loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
            } bg-gradient-to-r from-[#f72585] to-[#7209b7] text-white font-medium text-lg py-3 rounded-xl transform transition-transform duration-300 shadow-md`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#f72585] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

