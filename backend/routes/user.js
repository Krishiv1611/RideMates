const express = require("express");
const auth = require("../middlewares/middleware");
const { signup, signin, profile, update, googleOAuth } = require("../controllers/userController");

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.post("/google-oauth", googleOAuth);
userRouter.get("/profile", auth, profile);
userRouter.put("/update", auth, update);

module.exports = userRouter;


