import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterNav from "./FooterNav";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const BASE_URL = "";
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      const { data } = await client.get(`/reserve/myReservations`);
      const sortedReservations = (data?.reservations || []).sort(
        (a, b) => new Date(a.ride.date) - new Date(b.ride.date)
      );
      setReservations(sortedReservations);
    } catch (e) {
      console.error("Error fetching reservations:", e);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      const { data } = await client.delete(`/reserve/cancelReservation/${reservationId}`);
      toast.success(data?.message || "Reservation cancelled");
      setReservations((prev) => prev.filter((res) => res._id !== reservationId));
    } catch (e) {
      toast.error("Something went wrong while cancelling");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white p-6 font-poppins">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 className="text-2xl font-semibold mb-6 text-center">My Bookings</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading your bookings...</p>
      ) : reservations.length === 0 ? (
        <p className="text-center text-gray-500">
          You haven’t booked any rides yet.
        </p>
      ) : (
        <ul className="space-y-6">
          {reservations.map((res) => (
            <li key={res._id} className="bg-[#111218] p-5 rounded-xl shadow-sm border border-[#242533]">
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
              {res.ride?.createdBy?._id && (
                <button
                  onClick={() => navigate(`/chat/${res.ride._id}/${res.ride.createdBy._id}`)}
                  className="mt-2 bg-[#2a2a35] hover:bg-[#343446] text-white px-4 py-2 rounded ml-3"
                >
                  Chat with Driver
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


