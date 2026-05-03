import express from "express";
import { getTrackingHistory } from "../controllers/trackingController.js";

const router = express.Router();

router.get("/trackings/:trackingId/logs", getTrackingHistory);

export default router;
