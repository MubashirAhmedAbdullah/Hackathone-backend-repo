import express from "express";
import bcrypt from "bcrypt";
import sendResponse from "../helper/sendResponse.js";
import Joi from "joi";
import User from "../models/user.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { token } from "morgan";

const router = express.Router();

const Registerschema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
    cnic:  Joi.string().min(3).max(15).required(),
  password: Joi.string().min(3).required(),
});

const loginschema = Joi.object({
  cnic:  Joi.string().min(3).max(15).required(),
  password: Joi.string().min(3).required(),
});


const tokenBlacklist = new Set(); // In-memory token blacklist (use Redis for production)


router.post("/signup", async (req, res) => {
    const { error, value } = Registerschema.validate(req.body);
    if (error) {
      return sendResponse(res, 403, null, true, error.message);
    }

    const checkEmailInDB = await User.findOne({ email: value.email });
    if (checkEmailInDB) {
      return sendResponse(res, 403, null, true, "Email already exists");
    }

    const checkCnicInDB = await User.findOne({ cnic: value.cnic });
    if (checkCnicInDB) {
      return sendResponse(res, 403, null, true, "CNIC already exists");
    }

    const hashedPassword = await bcrypt.hash(value.password, 12);
    const newUser = new User({ ...value, password: hashedPassword });
    newUser.imageUrl = req.body.imageUrl; // Save the image URL from Cloudinary
    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.AUTH_SECRET,
      { expiresIn: "15d" }
      // Token expires in 1 hour (you can change this as needed)
    );
    // console.log("token==>", token);

    sendResponse(res, 201, { user: newUser, token }, false, "User is successfully registered");
});

router.post("/login", async (req, res) => {
  try {
    const { error, value } = loginschema.validate(req.body);
    if (error) {
      return sendResponse(res, 403, null, true, error.message);
    }

    const user = await User.findOne({ cnic: value.cnic }).lean();
    if (!user) {
      return sendResponse(res, 404, null, true, "User is not registered");
    }

    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 403, null, true, "Invalid credentials");
    }

    const { password, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, process.env.AUTH_SECRET, {
      expiresIn: "1d",
    });

    sendResponse(res, 200, { user: userWithoutPassword, token }, false, "User is successfully logged in");
  } catch (err) {
    console.error("Error =>", err);
    sendResponse(res, 500, null, true, "An unexpected error occurred");
  }
});


router.post("/logout", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from the Authorization header

    if (!token) {
      return sendResponse(res, 403, null, true, "Token is missing");
    }

    // Decode the token to verify it is valid
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    if (!decoded) {
      return sendResponse(res, 403, null, true, "Invalid token");
    }

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    // Send success response
    return sendResponse(res, 200, null, false, "User successfully logged out");
  } catch (err) {
    console.error("Logout error =>", err);
    return sendResponse(res, 500, null, true, "An unexpected error occurred");
  }
});

const isTokenBlacklisted = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token && tokenBlacklist.has(token)) {
    return sendResponse(res, 403, null, true, "Token is blacklisted");
  }
  next();
};

export default router;
