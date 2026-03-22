import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import cors from "cors";

dotenv.config(); //it must be configed before using env variables

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use("/api/auth", authRouter); // Use auth routes
connectDB(); // Connect to MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
