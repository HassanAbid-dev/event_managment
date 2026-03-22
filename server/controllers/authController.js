import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user already exists
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10); //hash the password with the salt

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
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
      return res.status(404).json({ message: "Invalid email." });
    }
    const isRightPassword = bcrypt.compareSync(password, user.password);
    if (!isRightPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    return res.status(200).json({
      success: true,
      message: "User logged in succesfully.",
      user,
    });
  } catch (error) {
    console.error("Unable to login", error);
    res.status(500).json({ message: "Server error" });
  }
};
