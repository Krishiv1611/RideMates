const express=require("express");
const auth = require("../middlewares/middleware");
const { Reservation, Ride } = require("../database");
const reserveRouter=express.Router();
reserveRouter.post("/book/:id", auth, async (req, res) => {
  const rideId = req.params.id;
  const userId = req.userId;
  const { seatsBooked } = req.body;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (!seatsBooked || seatsBooked <= 0)
      return res.status(400).json({ message: "Invalid seat count" });

    if (seatsBooked > ride.availableSeats)
      return res.status(400).json({ message: "Not enough seats" });

    const alreadyBooked = await Reservation.findOne({
      ride: rideId,
      passenger: userId,
    });

    if (alreadyBooked)
      return res.status(400).json({ message: "Already booked/requested" });

    let status;
    if (ride.bookingMode === "auto") {
      status = "approved";
    } else {
      status = "pending";
    }

    // ✅ Only deduct seats if approved
    if (status === "approved") {
      ride.availableSeats -= seatsBooked;
      await ride.save();
    }

    const reservation = await Reservation.create({
      ride: rideId,
      passenger: userId,
      seatsBooked,
      status,
    });

    res.status(201).json({
      message:
        status === "approved"
          ? "Booking confirmed"
          : "Booking request sent for approval",
      reservation,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
});
reserveRouter.put("/status/:id", auth, async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.userId;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const reservation = await Reservation.findById(reservationId).populate("ride");

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const ride = reservation.ride;

    // Only the ride creator can approve/reject
    if (ride.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to update status" });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({ message: "Reservation already processed" });
    }

    if (status === "approved") {
      if (ride.availableSeats < reservation.seatsBooked) {
        return res.status(400).json({ message: "Not enough seats available" });
      }

      ride.availableSeats -= reservation.seatsBooked;
      await ride.save();

      reservation.status = "approved";
      await reservation.save();

      return res.status(200).json({
        message: "Reservation approved",
        reservation
      });
    }

    await Reservation.findByIdAndDelete(reservationId);
    return res.status(200).json({ message: "Reservation rejected and deleted" });

  } catch (e) {
    res.status(500).json({ message: "Failed to update status", error: e.message });
  }
});
reserveRouter.get("/myReservation/:rideId", auth, async (req, res) => {
  const userId = req.userId;
  const rideId = req.params.rideId;

  try {
    const reservation = await Reservation.findOne({
      ride: rideId,
      passenger: userId
    }).populate("ride");

    if (!reservation) {
      return res.status(404).json({ message: "No reservation found for this ride" });
    }

    if (reservation.status !== "approved") {
      return res.status(403).json({ message: "Your reservation is not approved yet" });
    }

    const ride = await Ride.findById(rideId).populate("createdBy", "name email mobile");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json({
      ride: {
        vehicleType: ride.vehicleType,
        from: ride.from,
        to: ride.to,
        date: ride.date,
        time: ride.time,
        pricePerSeat: ride.pricePerSeat,
        availableSeats: ride.availableSeats,
        createdBy: ride.createdBy 
      },
      reservation: {
        status: reservation.status,
        seatsBooked: reservation.seatsBooked
      }
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch reservation", error: e.message });
  }
});
reserveRouter.delete("/cancelReservation/:id", auth, async (req, res) => {
  const reservationId = req.params.id;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Invalid reservation ID" });
    }

    // ✅ Only the passenger who booked can cancel
    if (reservation.passenger.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to cancel this reservation" });
    }

    const ride = await Ride.findById(reservation.ride);
    if (!ride) {
      return res.status(404).json({ message: "Associated ride not found" });
    }

    // ✅ Restore seats only if reservation was approved
    if (reservation.status === "approved") {
      ride.availableSeats += reservation.seatsBooked;
      await ride.save();
    }

    await Reservation.deleteOne({ _id: reservationId });

    res.status(200).json({ message: "Reservation cancelled successfully" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to cancel reservation", error: e.message });
  }
});
reserveRouter.get("/rideReservations/:rideId", auth, async (req, res) => {
  const ride = await Ride.findById(req.params.rideId);
  if (!ride || ride.createdBy.toString() !== req.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const reservations = await Reservation.find({ ride: ride._id }).populate("passenger", "name email");
  res.json({ reservations });
});
reserveRouter.get("/ridePassengers/:rideId", auth, async (req, res) => {
  const rideId = req.params.rideId;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const reservations = await Reservation.find({
      ride: rideId,
      status: "approved"
    }).populate("passenger", "name email mobile");

    const passengers = reservations.map(r => ({
      name: r.passenger.name,
      email: r.passenger.email,
      mobile: r.passenger.mobile,
      seatsBooked: r.seatsBooked
    }));

    res.json({
      message: "Co-passengers fetched successfully",
      passengers
    });

  } catch (e) {
    res.status(500).json({ message: "Failed to fetch passengers", error: e.message });
  }
});
reserveRouter.get("/myReservations", auth, async (req, res) => {
  const userId = req.userId;

  try {
    const reservations = await Reservation.find({ passenger: userId })
      .populate("ride");

    res.json({
      message: "Your reservations fetched successfully",
      reservations
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Failed to fetch reservations",
      error: e.message
    });
  }
});

module.exports=reserveRouter