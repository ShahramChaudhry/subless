import mongoose from "mongoose";
import { MONGO_URI } from "../config/env.js";

export async function connectMongo() {
  if (!MONGO_URI) {
    console.warn("[mongo] MONGO_URI not set; skipping DB connection");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(MONGO_URI);
  console.log("[mongo] Connected to MongoDB");
}


