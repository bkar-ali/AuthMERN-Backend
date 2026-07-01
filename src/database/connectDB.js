import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("MongoDB Connected Successfuly 🚀");
  } catch (error) {
    console.log("MongoDB Connected Failed ❌");
    process.exit(1); //?  to exit the process with an error code
  }
};
