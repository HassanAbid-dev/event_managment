import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import bookingRouter from "./routes/bookingsRoute.js";
import eventRouter from "./routes/eventsRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config(); //it must be configed before using env variables

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    // credentials: true, // ← allows cookies to be sent ✅
  }),
);
app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON bodies

app.use("/api/auth", authRouter); // Use auth routes
app.use("/api/events", eventRouter);
app.use("/api/bookings", bookingRouter);

connectDB(); // Connect to MongoDB

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
