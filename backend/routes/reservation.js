const express=require("express");
const auth = require("../middlewares/middleware");
const { book, updateStatus, myReservation, cancelReservation, rideReservations, ridePassengers, myReservations } = require("../controllers/reservationController");

const reserveRouter=express.Router();

reserveRouter.post("/book/:id", auth, book);
reserveRouter.put("/status/:id", auth, updateStatus);
reserveRouter.get("/myReservation/:rideId", auth, myReservation);
reserveRouter.delete("/cancelReservation/:id", auth, cancelReservation);
reserveRouter.get("/rideReservations/:rideId", auth, rideReservations);
reserveRouter.get("/ridePassengers/:rideId", auth, ridePassengers);
reserveRouter.get("/myReservations", auth, myReservations);

module.exports=reserveRouter