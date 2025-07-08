require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/user");
const ridesRouter = require("./routes/rides");
const reserveRouter = require("./routes/reservation");

const PORT = process.env.PORT;
const app = express();

// ✅ Use middleware BEFORE routes
app.use(cors({
  origin: process.env.FRONT_END,
  credentials: true,
}));

app.use(express.json());

// ✅ Define routes AFTER middleware
app.use("/users", userRouter);
app.use("/rides", ridesRouter);
app.use("/reservation", reserveRouter);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

main();
