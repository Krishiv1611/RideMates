import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Inbox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Build inbox from creator's rides + approved reservations
        const { data: created } = await client.get(`/rides/mycreatedRides`);
        const all = [];
        for (const ride of (created?.rides || [])) {
          try {
            const { data } = await client.get(`/reserve/ridePassengers/${ride._id}`);
            for (const p of (data?.passengers || [])) {
              all.push({ rideId: ride._id, ride, user: p });
            }
          } catch {}
        }
        setItems(all);
      } catch (e) {
        toast.error("Failed to load inbox");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white p-6 font-poppins">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Inbox</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400">No conversations yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it, idx) => (
              <li key={idx} className="bg-[#111218] border border-[#242533] rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium">{it.user.name}</p>
                  <p className="text-sm text-gray-400">{it.user.email} · {it.user.mobile}</p>
                  <p className="text-sm text-gray-500">Ride: {it.ride.from} → {it.ride.to} · {new Date(it.ride.date).toLocaleDateString()} {it.ride.time}</p>
                </div>
                <button onClick={() => navigate(`/chat/${it.rideId}/${it.user._id || it.user.userId}`)} className="px-4 py-2 rounded-lg bg-[#2a2a35] hover:bg-[#343446]">Open Chat</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


