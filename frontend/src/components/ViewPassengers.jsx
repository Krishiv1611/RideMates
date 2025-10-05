import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import client from "../api/client";

export default function ViewPassengers() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await client.get(`/reserve/ridePassengers/${rideId}`);
        setPassengers(data?.passengers || []);
      } catch (e) {
        toast.error("Failed to fetch passengers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rideId]);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white p-6 font-poppins">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Passengers</h2>
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-lg bg-[#2a2a35] hover:bg-[#343446]">Back</button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading passengers...</p>
        ) : passengers.length === 0 ? (
          <p className="text-gray-400">No approved passengers yet.</p>
        ) : (
          <ul className="space-y-3">
            {passengers.map((p, idx) => (
              <li key={idx} className="bg-[#111218] border border-[#242533] rounded-xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-400">{p.email} · {p.mobile}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-300">Seats: {p.seatsBooked}</div>
                    <button onClick={() => navigate(`/chat/${rideId}/${p.userId}`)} className="px-3 py-2 rounded-lg bg-[#2a2a35] hover:bg-[#343446] text-sm">Chat</button>
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


