import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { env } from "./config/env.js";

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies (req.body)

console.log("CLIENT_URL =", env.CLIENT_URL);

app.use(
  cors({
    origin: env.CLIENT_URL, // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with requests
  }),
);

app.use(cookieParser()); // Middleware to parse cookies
app.use("/api/auth", authRoutes);

app.use((req, res, next) => {
  console.log("GLOBAL COOKIES:", req.cookies);
  next();
});

app.get("/hi", (req, res) => {
  res.send("Abubakr World!");
});

export default app;
