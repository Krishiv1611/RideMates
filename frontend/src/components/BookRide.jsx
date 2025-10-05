import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterNav from "./FooterNav"; // Adjust path as per your folder structure
import client from "../api/client";

const BookRide = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seatInputs, setSeatInputs] = useState({});
  const BASE_URL = "";
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const { data } = await client.get(`/rides/availableRides`);
        setRides(data?.rides || []);
      } catch (error) {
        console.error("Error fetching rides:", error);
        toast.error("An error occurred while fetching rides");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const handleInputChange = (rideId, value) => {
    setSeatInputs((prev) => ({
      ...prev,
      [rideId]: value,
    }));
  };

  const book = async (rideId) => {
    const seatsBooked = parseInt(seatInputs[rideId]);

    if (!seatsBooked || seatsBooked <= 0) {
      toast.error("Please enter a valid seat count");
      return;
    }

    try {
      const { data } = await client.post(`/reserve/book/${rideId}`, { seatsBooked });
      toast.success(data?.message || "Booking successful");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("An error occurred while booking the ride");
    }
  };

  const search = async () => {
    if (!searchDate) {
      toast.info("Choose a date to search");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: searchDate });
      if (searchTime) params.set("time", searchTime);
      const { data } = await client.get(`/rides/search?${params.toString()}`);
      setRides(data?.rides || []);
    } catch (e) {
      toast.error("No rides found for given filters");
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-[#0e0e12] text-white font-poppins">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 className="text-2xl font-semibold mb-4 text-center">Available Rides</h2>

      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Date</label>
          <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="bg-[#14151c] text-gray-300 rounded-lg px-3 py-2 border border-[#242533]" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-400 mb-1">Time (optional)</label>
          <input type="time" value={searchTime} onChange={(e) => setSearchTime(e.target.value)} className="bg-[#14151c] text-gray-300 rounded-lg px-3 py-2 border border-[#242533]" />
        </div>
        <button onClick={search} className="px-4 py-2 rounded-lg bg-[#f72585] hover:bg-[#e31d78]">Search</button>
        <button onClick={() => { setSearchDate(""); setSearchTime(""); setLoading(true); (async()=>{ try { const { data } = await client.get(`/rides/availableRides`); setRides(data?.rides||[]);} catch{} finally{ setLoading(false);} })(); }} className="px-4 py-2 rounded-lg bg-[#2a2a35] hover:bg-[#343446]">Clear</button>
      </div>

      {loading ? (
        <p className="text-center text-gray-300">Loading rides...</p>
      ) : rides.length === 0 ? (
        <p className="text-center text-gray-400">No rides available at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {rides.map((ride) => {
            const isFull = ride.availableSeats === 0;

            return (
              <li
                key={ride._id}
                className={`relative p-5 rounded-xl shadow-sm border ${isFull ? "bg-[#1a1a1f] border-[#2c2c38] text-gray-400" : "bg-[#111218] border-[#242533] text-white"}`}
              >
                {isFull && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    FULL
                  </span>
                )}
                <p><strong>From:</strong> {ride.from}</p>
                <p><strong>To:</strong> {ride.to}</p>
                <p><strong>Date:</strong> {new Date(ride.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {ride.time}</p>
                <p><strong>Vehicle:</strong> {ride.vehicleType}</p>
                <p><strong>Price per Seat:</strong> ₹{ride.pricePerSeat}</p>
                <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
                <p><strong>Driver Name:</strong> {ride.createdBy?.name}</p>
                <p><strong>Contact:</strong> {ride.createdBy?.mobile} / {ride.createdBy?.email}</p>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Seats"
                    value={seatInputs[ride._id] || ""}
                    onChange={(e) => handleInputChange(ride._id, e.target.value)}
                    disabled={isFull}
                    className={`px-3 py-2 rounded-lg w-24 border ${isFull ? "bg-[#1a1a1f] text-gray-400 border-[#2c2c38] cursor-not-allowed" : "bg-[#14151c] text-white border-[#242533]"}`}
                  />
                  <button
                    onClick={() => book(ride._id)}
                    disabled={isFull}
                    className={`px-4 py-2 rounded-lg ${isFull ? "bg-[#2a2a35] text-gray-400 cursor-not-allowed" : "bg-[#f72585] hover:bg-[#e31d78] text-white"}`}
                  >
                    {isFull ? "Full" : "Book"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <FooterNav />
    </div>
  );
};

export default BookRide;




