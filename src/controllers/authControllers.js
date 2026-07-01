import User from "../models/userSchema.js";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetSuccessEmail,
} from "../mail/resendEmails.js";

import { env } from "../config/env.js";

export const test = async (req, res) => {
  try {
    res.send("From Controller");
    console.log("From Console Controller");
  } catch (error) {
    console.log("Test Error is :", error);
  }
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // validation
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { name }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        maessage: "User with this email or name aleardy existing",
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //TODO Important Docs
    //Generate Verification Code
    const verificationTokenCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString(); //! Generate a random 6-digit verification token

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken: verificationTokenCode,
      verificationTokenExpireAt: Date.now() + 3600000, //! Set token expiration time (e.g., 1 hour)
    });
    await newUser.save();

    generateTokenAndSetCookie(res, newUser._id);

    try {
      await sendVerificationEmail(newUser.email, verificationTokenCode); //! Send verification email to the user (you need to implement this function)
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
    // Return response
    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: {
        ...newUser._doc, //? Spread the user document to include all fields except password
        password: undefined, //? Exclude the password field from the response
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpireAt: { $gt: Date.now() }, //! Check if the token is still valid (not expired)
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpireAt = undefined;

    await user.save();

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error("Error sending Welcome email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "User Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid password" });
    }
    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = Date.now();
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpireAt = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpireAt = resetTokenExpireAt;

    await user.save();

    await sendResetPasswordEmail(
      user.email,
      `${env.CLIENT_URL}/resetPassword/${resetToken}`,
    ); //! Send reset password email to the user (you need to implement this function)
    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpireAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpireAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//! Check Auth --> Doc
