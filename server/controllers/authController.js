import User from "../models/User.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import OTP from "../models/Otp.js";
import jwt from "jsonwebtoken";

const generateJsonWebToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //hash the password with the salt
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isverified: false,
    });
    await newUser.save();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // **How it works:**
    // ```
    // Math.random()        → 0.0 to 0.9999...
    // * 900000             → 0 to 899999
    // + 100000             → 100000 to 999999
    // Math.floor()         → removes decimals
    // .toString()          → converts to string
    const newOtp = new OTP({
      email: newUser.email,
      otp: otp,
      action: "account_verification",
    });
    // account verification
    await newOtp.save();
    await sendEmail(
      email,
      "Verify your Eventora account",
      otp,
      "account_verification",
    );
    return res.status(201).json({ message: `OTP sent to ${email}` });
  } catch (error) {
    console.error("Error in register controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email }).select("+password"); // ✅ With .select("+password") bcz in scheme select is set to false so if password is not selcted here password will not be fetched.
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isverified && user.role === "user") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.deleteMany({ email });
      const newOtp = new OTP({
        email: user.email,
        otp: otp,
        action: "account_verification",
      });
      await newOtp.save();
      await sendEmail(
        user.email,
        "Verify your Eventora account",
        otp,
        "account_verification",
      );
      return res.status(403).json({
        message:
          "Your account is not verified.Please complete verification,then u will be able to login.New otp code is sent to your email.",
      });
    }
    const isRightPassword = await bcrypt.compare(password, user.password);
    if (!isRightPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.password = undefined; // remove password before sending response
    const token = generateJsonWebToken(user._id, user.role);
    res.cookie("authtoken", token, {
      httpOnly: true, // ← JS can't access it (safer)
      secure: true, // ← only over HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      token,
      user,
    });
  } catch (error) {
    console.error("Unable to login", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "All fieldsn are required." });
    }
    const isValidRecord = await OTP.findOne({
      email,
      otp,
      action: "account_verification",
    });
    if (!isValidRecord) {
      // ✅ 400 is for bad request/invalid data
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    await User.findOne({ email }).updateOne({ isverified: true });
    // after updating user add this
    await OTP.deleteOne({ email, otp }); // ← prevents OTP reuse ✅
    return res.status(200).json({ message: "Account verified successfully." });
  } catch (error) {
    console.error("Error in verifyOtp controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
