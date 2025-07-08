const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
    match: [/^[a-zA-Z0-9._%+-]+@mail\.jiit\.ac\.in$/, "Email must be a valid JIIT mail ID"],
  },
  password: String,
  year: {
    type: String,
    enum: ['1', '2', '3', '4', '5'], // only these values are allowed
    required: true,
  },
  branch: String,
  mobile: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number starting with 6-9"],
  },
}, { timestamps: true });


const User = mongoose.model("User", userSchema); 

// RIDE SCHEMA
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
  default: "auto"  // auto-approved by default
},
  pricePerSeat: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema);
const reservationSchema = new Schema({
  ride: { type: ObjectId, ref: 'Ride', required: true },
  passenger: { type: ObjectId, ref: 'User', required: true },
  seatsBooked: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = {
  mongoose,
  User,
  Ride,
  Reservation
};
