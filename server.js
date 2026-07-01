import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/database/connectDB.js";

const port = env.PORT;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
