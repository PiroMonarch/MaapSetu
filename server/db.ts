import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedDatabase } from "./seed";

let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log("No MONGODB_URI found, starting in-memory MongoDB...");
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

    // Seed data on startup
    await seedDatabase();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
