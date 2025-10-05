const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const rideSchema = new Schema({
  createdBy: { type: ObjectId, ref: 'User', required: true },
  vehicleType: {
    type: String,
    enum: ["scooty", "bike", "car"],  
    required: true
  },
  from: String,
  to: String,
  date: Date,
  time: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  bookingMode: {
    type: String,
    enum: ["auto", "manual"],
    default: "auto"
  },
  pricePerSeat: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;


