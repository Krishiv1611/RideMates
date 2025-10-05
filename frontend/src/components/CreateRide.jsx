import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterNav from "./FooterNav"; // Adjust the path if needed
import client from "../api/client";

const CreateRide = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [bookingMode, setBookingMode] = useState("");
  const [loading, setLoading] = useState(false);
  const todayDate = new Date().toISOString().split("T")[0];

  const navigate = useNavigate();
  const BASE_URL = "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await client.post(`/rides/create`, {
        from,
        to,
        date,
        time,
        vehicleType: vehicle.toLowerCase(),
        pricePerSeat: Number(price),
        availableSeats: Number(seats),
        bookingMode: bookingMode.toLowerCase(),
      });

      toast.success(data?.message || "Ride created successfully!");
    } catch (error) {
      console.error("Error during ride creation:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative pb-24" style={{ backgroundColor: "#0e0e12", fontFamily: "'Poppins', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="bg-[#111218] w-full max-w-md p-8 rounded-2xl shadow-lg border border-[#242533] mt-8">
        <h3 className="text-center text-white text-xl font-semibold mb-6">Create a ride</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input type="text" placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} required className="bg-[#14151c] placeholder-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]" />
          <input type="text" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} required className="bg-[#14151c] placeholder-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={todayDate} className="bg-[#14151c] text-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="bg-[#14151c] text-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]" />
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} required className="bg-[#14151c] text-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]">
            <option value="" disabled>Select Vehicle Type</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="scooty">Scooty</option>
          </select>
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-[#14151c] placeholder-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]" />
          <select value={seats} onChange={(e) => setSeats(e.target.value)} required className="bg-[#14151c] text-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]">
            <option value="" disabled>Select Seats</option>
            {vehicle === "car" ? (
              <>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </>
            ) : vehicle ? (
              <>
                <option value="1">1</option>
                <option value="2">2</option>
              </>
            ) : null}
          </select>
          <select value={bookingMode} onChange={(e) => setBookingMode(e.target.value)} required className="bg-[#14151c] text-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f72585] border border-[#242533]">
            <option value="" disabled>Select Booking Mode</option>
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </select>
          <button type="submit" disabled={loading} className={`bg-[#f72585] hover:bg-[#e31d78] text-white font-medium text-base py-3 rounded-lg transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>{loading ? "Creating..." : "Create Ride"}</button>
        </form>
      </div>

      <FooterNav />
    </div>
  );
};

export default CreateRide;
