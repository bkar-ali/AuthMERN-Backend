import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // sameSite: "strict", //? Cookie is not sent with cross-site requests
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days //? Cookie expires in 7 days
  });
  return token;
};
