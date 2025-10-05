import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import client from "../api/client";

export default function ManageRequests() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get(`/reserve/rideReservations/${rideId}`);
      const pending = (data?.reservations || []).filter((r) => r.status === "pending");
      setRequests(pending);
    } catch (e) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(reservationId, status) {
    try {
      const { data } = await client.put(`/reserve/status/${reservationId}`, { status });
      toast.success(data?.message || `Reservation ${status}`);
      load();
    } catch (e) {
      toast.error("Action failed");
    }
  }

  useEffect(() => { load(); }, [rideId]);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white p-6 font-poppins">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Manage Requests</h2>
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg bg-[#2a2a35] hover:bg-[#343446]">Back</button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading pending requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No pending requests.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li key={req._id} className="bg-[#111218] border border-[#242533] rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Passenger</p>
                    <p className="font-medium">{req.passenger?.name || req.passenger?.email}</p>
                    <p className="text-sm text-gray-400">Seats: {req.seatsBooked}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(req._id, "approved")} className="px-4 py-2 rounded-lg bg-[#f72585] hover:bg-[#e31d78]">Approve</button>
                    <button onClick={() => updateStatus(req._id, "rejected")} className="px-4 py-2 rounded-lg bg-[#2a2a35] hover:bg-[#343446]">Reject</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


