const express = require("express");
const auth = require("../middlewares/middleware");
const Message = require("../models/Message");
const Ride = require("../models/Ride");
const Reservation = require("../models/Reservation");

const chatRouter = express.Router();

// Fetch conversation between current user and other user for a specific ride
chatRouter.get("/history/:rideId/:otherUserId", auth, async (req, res) => {
  const { rideId, otherUserId } = req.params;
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    const isCreator = ride.createdBy.toString() === req.userId;
    let isPassenger = false;
    if (!isCreator) {
      const reservation = await Reservation.findOne({ ride: rideId, passenger: req.userId });
      isPassenger = !!reservation;
    }
    if (!isCreator && !isPassenger) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const msgs = await Message.find({
      ride: rideId,
      $or: [
        { sender: req.userId, recipient: otherUserId },
        { sender: otherUserId, recipient: req.userId }
      ]
    }).sort({ createdAt: 1 });
    res.json({ messages: msgs });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch history", error: e.message });
  }
});

module.exports = chatRouter;


