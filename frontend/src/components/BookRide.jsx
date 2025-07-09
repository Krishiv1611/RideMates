import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterNav from "./FooterNav"; // Adjust path as per your folder structure

const BookRide = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seatInputs, setSeatInputs] = useState({});
  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch(`${BASE_URL}/rides/availableRides`);
        const data = await response.json();
        if (response.ok) {
          setRides(data.rides);
        } else {
          toast.error(data.message || "Failed to fetch rides");
        }
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
      const response = await fetch(`${BASE_URL}/reservation/book/${rideId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ seatsBooked }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Booking successful");
        // Optional: refresh ride list here
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("An error occurred while booking the ride");
    }
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-[#1e1e24] text-white font-poppins">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 className="text-3xl font-bold mb-6 text-center text-[#f72585]">Available Rides</h2>

      {loading ? (
        <p className="text-center text-gray-300">Loading rides...</p>
      ) : rides.length === 0 ? (
        <p className="text-center text-gray-400">No rides available at the moment.</p>
      ) : (
        <ul className="space-y-6">
          {rides.map((ride) => {
            const isFull = ride.availableSeats === 0;

            return (
              <li
                key={ride._id}
                className={`relative p-6 rounded-xl shadow-md border ${
                  isFull
                    ? "bg-[#2a2a2a] border-[#444] text-gray-400"
                    : "bg-[#111114] border-[#2e2e3e] text-white"
                }`}
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

                <div className="mt-4 flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="Seats"
                    value={seatInputs[ride._id] || ""}
                    onChange={(e) => handleInputChange(ride._id, e.target.value)}
                    disabled={isFull}
                    className={`px-3 py-1 rounded-md w-24 ${
                      isFull
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-[#2a2a35] text-white"
                    }`}
                  />
                  <button
                    onClick={() => book(ride._id)}
                    disabled={isFull}
                    className={`px-4 py-2 rounded-lg ${
                      isFull
                        ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                        : "bg-[#f72585] hover:bg-pink-600 text-white"
                    }`}
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




