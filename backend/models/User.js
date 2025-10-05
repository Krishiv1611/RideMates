const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    enum: ['1', '2', '3', '4', '5'],
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

module.exports = User;


