const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const messageSchema = new Schema({
  ride: { type: ObjectId, ref: 'Ride', required: true },
  sender: { type: ObjectId, ref: 'User', required: true },
  recipient: { type: ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  readAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);


