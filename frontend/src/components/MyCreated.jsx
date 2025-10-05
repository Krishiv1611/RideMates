import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterNav from "./FooterNav";
import client from "../api/client";

const MyCreated = () => {
  const BASE_URL = "";
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const [formData, setFormData] = useState({
    vehicleType: "",
    from: "",
    to: "",
    date: "",
    time: "",
    pricePerSeat: "",
    availableSeats: "",
  });

  useEffect(() => {
    fetchMyCreatedRides();
  }, []);

  const fetchMyCreatedRides = async () => {
    setLoading(true);
    try {
      const { data } = await client.get(`/rides/mycreatedRides`);
      setRides(data?.rides || []);
    } catch (error) {
      toast.error("Something went wrong while fetching your rides.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;

    try {
      const { data } = await client.delete(`/rides/cancelRide/${rideId}`);
      toast.success(data?.message || "Ride cancelled successfully");
      fetchMyCreatedRides();
    } catch (error) {
      toast.error("Error cancelling ride");
    }
  };

  const openEditModal = (ride) => {
    setSelectedRide(ride);
    setFormData({
      vehicleType: ride.vehicleType,
      from: ride.from,
      to: ride.to,
      date: ride.date.slice(0, 10), // YYYY-MM-DD
      time: ride.time,
      pricePerSeat: ride.pricePerSeat,
      availableSeats: ride.availableSeats,
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const { data } = await client.put(`/rides/updateRide/${selectedRide._id}`, formData);
      toast.success(data?.message || "Ride updated successfully");
      setShowModal(false);
      fetchMyCreatedRides();
    } catch (error) {
      toast.error("Error updating ride");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen pb-24 p-6 bg-[#0e0e12] text-white font-poppins">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 className="text-2xl font-semibold mb-6 text-center">Rides You Created</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading your rides...</p>
      ) : rides.length === 0 ? (
        <p className="text-center text-gray-500">You haven't created any rides yet.</p>
      ) : (
        <ul className="space-y-4">
          {rides.map((ride) => (
            <li key={ride._id} className="bg-[#111218] p-5 rounded-xl shadow-sm border border-[#242533]">
              <p><strong>From:</strong> {ride.from}</p>
              <p><strong>To:</strong> {ride.to}</p>
              <p><strong>Date:</strong> {new Date(ride.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {ride.time}</p>
              <p><strong>Vehicle:</strong> {ride.vehicleType}</p>
              <p><strong>Price per Seat:</strong> ₹{ride.pricePerSeat}</p>
              <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
              <p><strong>Booking Mode:</strong> {ride.bookingMode}</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openEditModal(ride)}
                  className="px-4 py-2 rounded bg-[#2a2a35] hover:bg-[#343446]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ride._id)}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                >
                  Cancel
                </button>
                {ride.bookingMode === "manual" && (
                  <button onClick={() => window.location.assign(`/manage-requests/${ride._id}`)} className="px-4 py-2 rounded bg-[#14151c] border border-[#242533] hover:bg-[#1a1b23]">Manage Requests</button>
                )}
                <button onClick={() => window.location.assign(`/passengers/${ride._id}`)} className="px-4 py-2 rounded bg-[#14151c] border border-[#242533] hover:bg-[#1a1b23]">View Passengers</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#2a2a35] text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Ride</h3>

            <div className="space-y-3">
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="From"
                className="w-full p-2 rounded bg-[#1e1e24] border border-gray-600"
              />
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="To"
                className="w-full p-2 rounded bg-[#1e1e24] border border-gray-600"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#1e1e24] border border-gray-600"
              />
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="Time"
                className="w-full p-2 rounded bg-[#1e1e24] border border-gray-600"
              />
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                placeholder="Vehicle Type"
                className="w-full p-2 rounded bg-[#1e1e24] border border-gray-600"
              />
              <input
                type="number"
                name="pricePerSeat"
                value={formData.pricePerSeat}
                onChange={handleChange}
                placeholder="Price per Seat"
                className="w-full p-2 rounded bg-[#1e1e24] border border-gray-600"
              />
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                placeholder="Available Seats"
                className="w-full p-2 rounded bg-[#1e1e24] border border-gray-600"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-black"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <FooterNav />
    </div>
  );
};

export default MyCreated;


