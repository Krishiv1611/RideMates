import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterNav from "./FooterNav";

const MyBookings = () => {
  const BASE_URL = "http://localhost:8000";
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reserve/myReservations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Sort upcoming first
        const sortedReservations = (data.reservations || []).sort(
          (a, b) => new Date(a.ride.date) - new Date(b.ride.date)
        );
        setReservations(sortedReservations);
      } else {
        toast.error(data.message || "Failed to fetch reservations");
      }
    } catch (e) {
      console.error("Error fetching reservations:", e);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/reserve/cancelReservation/${reservationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Reservation cancelled");
        setReservations((prev) =>
          prev.filter((res) => res._id !== reservationId)
        );
      } else {
        toast.error(data.message || "Failed to cancel reservation");
      }
    } catch (e) {
      toast.error("Something went wrong while cancelling");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e24] text-white p-6 font-poppins">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 className="text-3xl font-bold mb-6 text-center text-[#f72585]">
        My Bookings
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading your bookings...</p>
      ) : reservations.length === 0 ? (
        <p className="text-center text-gray-500">
          You haven’t booked any rides yet.
        </p>
      ) : (
        <ul className="space-y-6">
          {reservations.map((res) => (
            <li
              key={res._id}
              className="bg-[#111114] p-6 rounded-xl shadow-md border border-[#2e2e3e]"
            >
              <p>
                <strong>From:</strong> {res.ride?.from}
              </p>
              <p>
                <strong>To:</strong> {res.ride?.to}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(res.ride?.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {res.ride?.time}
              </p>
              <p>
                <strong>Vehicle:</strong> {res.ride?.vehicleType}
              </p>
              <p>
                <strong>Price/Seat:</strong> ₹{res.ride?.pricePerSeat}
              </p>
              <p>
                <strong>Seats Booked:</strong> {res.seatsBooked}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`${
                    res.status === "approved"
                      ? "text-green-400"
                      : res.status === "pending"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {res.status}
                </span>
              </p>

              {/* Show Cancel button only for approved or pending bookings of upcoming rides */}
              {["approved", "pending"].includes(res.status) &&
                new Date(res.ride?.date) >= new Date() && (
                  <button
                    onClick={() => cancelReservation(res._id)}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Cancel Booking
                  </button>
                )}
            </li>
          ))}
        </ul>
      )}
      <FooterNav />
    </div>
  );
};

export default MyBookings;


