const express=require("express");
const auth = require("../middlewares/middleware");
const { Ride } = require("../database");
const ridesRouter=express.Router();
ridesRouter.post("/create", auth, async (req, res) => {
  const createdBy = req.userId;
  const { vehicleType, from, to, date, time, availableSeats, pricePerSeat,bookingMode } = req.body;

  try {
    const existingRide = await Ride.findOne({
      createdBy,
      date,
      time
    });

    if (existingRide) {
      return res.status(409).json({
        message: "You already have a ride at the same time"
      });
    }

    const ride = await Ride.create({
      createdBy,
      vehicleType,
      from,
      to,
      date,
      time,
      availableSeats, 
      pricePerSeat,
      bookingMode
    });

    res.status(201).json({
      message: "Ride created successfully",
      rideId: ride._id,
      on: date,
      at: time
    });
  } catch (e) {
    res.status(500).json({
      message: "Failed to create ride",
      error: e.message
    });
  }
});
ridesRouter.get("/mycreatedRides", auth,async (req, res) => {
  try {
    const now = new Date();

    const rides = await Ride.find({
      createdBy: req.userId,
      date: { $gte: now }
    }).sort({ date: 1, time: 1 });

    if (!rides || rides.length === 0) {
      return res.status(404).json({
        message: "No upcoming rides published"
      });
    }

    res.status(200).json({
      message: "Upcoming rides fetched successfully",
      rides
    });

  } catch (e) {
    res.status(500).json({
      message: "Failed to fetch rides",
      error: e.message
    });
  }
});
ridesRouter.get("/availableRides", async (req, res) => {
  try {
    const now = new Date();

    const rides = await Ride.find({
      date: { $gte: now }
    })
    .sort({ date: 1, time: 1 })
    .populate("createdBy", "name email mobile"); // Include mobile instead of phone

    if (!rides || rides.length === 0) {
      return res.status(404).json({
        message: "No upcoming rides available"
      });
    }

    res.status(200).json({
      message: "Upcoming rides fetched successfully",
      rides
    });

  } catch (e) {
    res.status(500).json({
      message: "Failed to fetch available rides",
      error: e.message
    });
  }
});

ridesRouter.get("/createdRides/history", auth, async (req, res) => {
  try {
    const now = new Date();

    const pastRides = await Ride.find({
      createdBy: req.userId,
      date: { $lt: now } 
    }).sort({ date: -1, time: -1 }); 

    if (!pastRides || pastRides.length === 0) {
      return res.status(404).json({
        message: "No past rides found"
      });
    }

    res.status(200).json({
      message: "Past rides fetched successfully",
      rides: pastRides
    });

  } catch (e) {
    res.status(500).json({
      message: "Failed to fetch past rides",
      error: e.message
    });
  }
});
ridesRouter.put("/updateRide/:id", auth, async (req, res) => {
  const rideId = req.params.id;
  const { vehicleType, from, to, date, time, pricePerSeat, availableSeats } = req.body;

  try {
    const updatedRide = await Ride.findByIdAndUpdate(
      rideId,
      {
        vehicleType,
        from,
        to,
        date,
        time,
        pricePerSeat,
        availableSeats
      },
      { new: true, runValidators: true } 
    );

    if (!updatedRide) {
      return res.status(404).json({ message: "Ride not found or update failed" });
    }

    res.json({
      message: "Ride updated successfully",
      ride: updatedRide
    });
  } catch (e) {
    res.status(500).json({
      message: "Update failed",
      error: e.message
    });
  }
});
ridesRouter.delete("/cancelRide/:id", auth, async (req, res) => {
  const rideId = req.params.id;

  try {
    const deletedRide = await Ride.findByIdAndDelete(rideId);

    if (!deletedRide) {
      return res.status(404).json({
        message: "Ride not found or already deleted"
      });
    }

    res.json({
      message: "Ride cancelled successfully",
      ride: deletedRide
    });
  } catch (e) {
    res.status(500).json({
      message: "Failed to cancel ride",
      error: e.message
    });
  }
});
ridesRouter.get("/search",auth,async(req,res)=>{
  const {date,time}=req.query;
  if (!date) {
    return res.status(400).json({
      message: "'date' query parameter is required (format: YYYY-MM-DD)"
    });
  }
  try{
    const dateObj = new Date(date);
    const today = new Date();
     let filter = {
      date: dateObj
    };
    if(time){
      filter.time={$gte:time};
    }else {
      const isToday =
        dateObj.getFullYear() === today.getFullYear() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getDate() === today.getDate();

      if (isToday) {
        const currentTime = today.toTimeString().slice(0, 5); 
        filter.time = { $gte: currentTime };
      }
    }
     const rides = await Ride.find(filter).sort({ time: 1 });

    if (!rides.length) {
      return res.status(404).json({
        message: "No rides found for the given date and time"
      });
    }
    res.status(200).json({
      message: "Rides found",
      rides
    });
  }
  catch (e) {
    res.status(500).json({
      message: "Failed to search rides",
      error: e.message
    });
  }
})

module.exports = ridesRouter;