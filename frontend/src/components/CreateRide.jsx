import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const BASE_URL = "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/rides/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          from,
          to,
          date,
          time,
          vehicleType: vehicle.toLowerCase(),
          pricePerSeat: Number(price),
          availableSeats: Number(seats),
          bookingMode: bookingMode.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Ride created successfully!");
        setTimeout(() => {
          navigate("/book");
        }, 1500);
      } else {
        toast.error(data.message || "Ride creation failed.");
      }
    } catch (error) {
      console.error("Error during ride creation:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{
        backgroundColor: "#1e1e24",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Book a Ride Button - Top Right */}
      <button
        onClick={() => navigate("/book")}
        className="absolute top-6 right-6 bg-gradient-to-r from-[#7209b7] to-[#f72585] text-white font-medium text-sm px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform"
      >
        Book a Ride
      </button>

      <div className="bg-[#111114] w-full max-w-lg p-10 rounded-3xl shadow-2xl border border-[#2e2e3e] mt-8">
        <h1
          className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#f72585] to-[#7209b7] text-center"
          style={{ letterSpacing: "0.1em" }}
        >
          RideMates
        </h1>
        <h3 className="text-center text-gray-400 mb-8 tracking-wide text-lg">
          Create a new ride
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            className="bg-[#1e1e24] placeholder-gray-400 text-white rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <input
            type="text"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            className="bg-[#1e1e24] placeholder-gray-400 text-white rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={todayDate}
            className="bg-[#1e1e24] text-gray-400 rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="bg-[#1e1e24] text-gray-400 rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <select
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            required
            className="bg-[#1e1e24] text-gray-400 rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          >
            <option value="" disabled>Select Vehicle Type</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="scooty">Scooty</option>
          </select>

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="bg-[#1e1e24] placeholder-gray-400 text-white rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          />

          <select
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
            className="bg-[#1e1e24] text-gray-400 rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          >
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

          <select
            value={bookingMode}
            onChange={(e) => setBookingMode(e.target.value)}
            required
            className="bg-[#1e1e24] text-gray-400 rounded-xl px-5 py-3 focus:outline-2 focus:outline-[#f72585] transition-shadow"
          >
            <option value="" disabled>Select Booking Mode</option>
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#f72585] to-[#7209b7] text-white font-medium text-lg py-3 rounded-xl hover:scale-105 transform transition-transform duration-300 shadow-md"
          >
            {loading ? "Creating..." : "Create Ride"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRide;





