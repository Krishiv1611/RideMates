const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

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

module.exports = Reservation;


