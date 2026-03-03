import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user);

  return res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};

export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const safeUsername = typeof username === "string" ? username.trim() : "";
  const safeEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const safeRole = role === "host" ? "host" : "user";

  if (!safeUsername || !safeEmail || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  if (!safeEmail.includes("@")) {
    return res.status(400).json({ message: "Enter a valid email" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = await User.findOne({ email: safeEmail });
  if (existing) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const user = await User.create({ username: safeUsername, email: safeEmail, password, role: safeRole });
  const token = generateToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};
