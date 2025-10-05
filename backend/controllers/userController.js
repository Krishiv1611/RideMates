require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

async function signup(req, res) {
  const { email, name, password, year, branch, mobile } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, name, password: hashedPassword, year, branch, mobile });
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (e) {
    return res.status(500).json({ error: "Signup failed", details: e.message });
  }
}

async function signin(req, res) {
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
    return res.json({
      message: "Signin successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    return res.status(500).json({ error: "Signin failed", details: e.message });
  }
}

async function profile(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      year: user.year,
      branch: user.branch,
      mobile: user.mobile
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch profile", details: e.message });
  }
}

async function update(req, res) {
  const { email, name, password, year, branch, mobile } = req.body;
  const userId = req.userId;
  try {
    const updateData = { email, name, year, branch, mobile };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found or update failed" });
    }
    return res.json({
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
    return res.status(500).json({ message: "Update failed", error: e.message });
  }
}

module.exports = { signup, signin, profile, update };

// Google OAuth: accepts ID token from client, verifies, enforces domain, issues JWT
async function googleOAuth(req, res) {
  try {
    if (!googleClient) {
      return res.status(500).json({ message: "Google OAuth not configured" });
    }
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing idToken" });
    }
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || "User";
    if (!email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }
    if (!/^[^@]+@mail\.jiit\.ac\.in$/.test(email)) {
      return res.status(403).json({ message: "Only @mail.jiit.ac.in emails are allowed" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        password: await bcrypt.hash(jwt.sign({ e: email }, JWT_SECRET).slice(0, 12), 10),
        year: "1",
        branch: "Other",
        mobile: "7000000000",
      });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ message: "Signin successful", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    return res.status(500).json({ message: "Google OAuth failed", error: e.message });
  }
}

module.exports.googleOAuth = googleOAuth;


