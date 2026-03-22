import express from "express";
const authRouter = express.Router();
import { register, login } from "../controllers/authController.js";
// import { register, Login, verifyOtp } from "../controllers/authController.js";

authRouter.post("/register", register);
authRouter.post("/login", login);
// authRouter.post("/verify-otp", verifyOtp);

export default authRouter;
