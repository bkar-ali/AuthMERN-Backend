import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies (req.body)

app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with requests
  }),
);

app.use(cookieParser()); // Middleware to parse cookies

app.use("/api/auth", authRoutes);

app.get("/hi", (req, res) => {
  res.send("Abubakr World!");
});

export default app;
