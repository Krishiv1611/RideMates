const mongoose = require("mongoose");

async function connectToDatabase(mongoUrl) {
  await mongoose.connect(mongoUrl);
}

module.exports = { mongoose, connectToDatabase };
