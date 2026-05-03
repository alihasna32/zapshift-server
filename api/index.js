import express from "express";
import cors from "cors";
import "dotenv/config"; // Imports and configures dotenv immediately
import { connectDB } from "../src/config/db.js";
import parcelRoutes from "../src/routes/parcelRoutes.js";
import PaymentRoutes from "../src/routes/PaymentRoutes.js";
import userRouters from "../src/routes/userRouters.js";
import riderRoutes from "../src/routes/riderRoutes.js";
import trackingRoutes from "../src/routes/trackingRoutes.js";
import Stripe from "stripe";
import { generateTrackingId } from "../src/utils/generateTrackingId.js";
import { verifyFBToken } from "../src/middleware/verifyFBToken.js";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";

export const stripe = new Stripe(process.env.STRIPE_SECRET);
export { generateTrackingId };
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/parcels", parcelRoutes);
app.use("/", PaymentRoutes);
app.use("/", userRouters);
app.use("/", riderRoutes);
app.use("/", trackingRoutes);

// routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ZapShift API" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
