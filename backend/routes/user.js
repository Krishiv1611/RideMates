require("dotenv").config();
const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../database");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/middleware");

const JWT_SECRET = process.env.JWT_SECRET;

userRouter.post("/signup", async (req, res) => {
  const { email, name, password, year, branch, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      year,
      branch,
      mobile
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (e) {
    res.status(500).json({ error: "Signup failed", details: e.message });
  }
});

// POST /signin - Login existing user
userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Incorrect credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Signin successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (e) {
    res.status(500).json({ error: "Signin failed", details: e.message });
  }
});
userRouter.get("/profile",auth,async(req,res)=>{
    try {
    const user = await User.findById(req.userId).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      year: user.year,
      branch: user.branch,
      mobile: user.mobile
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch profile", details: e.message });
  }
})
userRouter.put("/update", auth, async (req, res) => {
  const { email, name, password, year, branch, mobile } = req.body;
  const userId = req.userId;

  try {
    const updateData = { email, name, year, branch, mobile };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found or update failed" });
    }

    res.json({
      message: "Updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        year: updatedUser.year,
        branch: updatedUser.branch,
        mobile: updatedUser.mobile
      }
    });
  } catch (e) {
    res.status(500).json({
      message: "Update failed",
      error: e.message
    });
  }
});


module.exports = userRouter;


