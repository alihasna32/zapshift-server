import express from "express";
import { createRiders, deleteRiders, getDeliveryPerDay, getRiders, updateRiders } from "../controllers/riderAPIS.js";
import { verifyFBToken } from "../middleware/verifyFBToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();
router.post("/riders", createRiders)
router.get("/riders", getRiders)
router.patch("/rider/:id", verifyFBToken, verifyAdmin, updateRiders)
router.delete("/rider/:id", verifyFBToken, verifyAdmin, deleteRiders)
router.get('/riders/delivery-per-day', getDeliveryPerDay)
export default router;