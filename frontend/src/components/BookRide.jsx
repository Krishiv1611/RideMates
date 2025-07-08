import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookRide = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = "http://localhost:8000"; // Your backend URL

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

  return (
    <div className="min-h-screen p-6 bg-[#1e1e24] text-white font-poppins">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 className="text-3xl font-bold mb-6 text-center text-[#f72585]">Available Rides</h2>

      {loading ? (
        <p className="text-center text-gray-300">Loading rides...</p>
      ) : rides.length === 0 ? (
        <p className="text-center text-gray-400">No rides available at the moment.</p>
      ) : (
        <ul className="space-y-6">
          {rides.map((ride) => (
            <li
              key={ride._id}
              className="bg-[#111114] p-6 rounded-xl shadow-md border border-[#2e2e3e]"
            >
              <p><strong>From:</strong> {ride.from}</p>
              <p><strong>To:</strong> {ride.to}</p>
              <p><strong>Date:</strong> {new Date(ride.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {ride.time}</p>
              <p><strong>Vehicle:</strong> {ride.vehicleType}</p>
              <p><strong>Price per Seat:</strong> ₹{ride.pricePerSeat}</p>
              <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
              <p><strong>Driver Name:</strong> {ride.createdBy?.name}</p>
              <p><strong>Contact:</strong> {ride.createdBy?.mobile} / {ride.createdBy?.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookRide;

