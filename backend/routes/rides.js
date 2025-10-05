const express=require("express");
const auth = require("../middlewares/middleware");
const { createRide, myCreatedRides, availableRides, createdRidesHistory, updateRide, cancelRide, search } = require("../controllers/rideController");

const ridesRouter=express.Router();

ridesRouter.post("/create", auth, createRide);
ridesRouter.get("/mycreatedRides", auth, myCreatedRides);
ridesRouter.get("/availableRides", availableRides);
ridesRouter.get("/createdRides/history", auth, createdRidesHistory);
ridesRouter.put("/updateRide/:id", auth, updateRide);
ridesRouter.delete("/cancelRide/:id", auth, cancelRide);
ridesRouter.get("/search", auth, search);

module.exports = ridesRouter;