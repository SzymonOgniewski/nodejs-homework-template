import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
const db = mongoose.connection;

app.listen(3000, async () => {
  console.log("Connecting to database");
  await mongoose.connect(process.env.MONGODB_URI);
});

db.on("error", (error) => {
  console.error("Database connection error", error);
  process.exit(1);
});
db.once("open", () => {
  console.log("Connected to database");
});
process.on("SIGINT", () => {
  mongoose.disconnect();
  console.log("Connection closed due to app termination");
});
