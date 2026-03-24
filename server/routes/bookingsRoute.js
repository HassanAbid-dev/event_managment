import express from "express";
import {
  sendBookingOTP,
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
const bookingRouter = express.Router();

bookingRouter.post("/send-otp", protect, sendBookingOTP);
bookingRouter.post("/", protect, bookEvent);
bookingRouter.put("/:id/confirm", protect, admin, confirmBooking);
bookingRouter.get("/my", protect, getMyBookings);
bookingRouter.delete("/:id", protect, cancelBooking);

export default bookingRouter;
