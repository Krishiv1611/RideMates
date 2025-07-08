import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          navigate("/create");
        }, 1500); // Delay so toast is shown
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
            } bg-gradient-to-r from-[#f72585] to-[#7209b7] text-white font-medium text-lg py-3 rounded-xl transform transition-transform duration-300 shadow-md`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          New to RideMates?{" "}
          <Link to="/" className="text-[#f72585] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;

