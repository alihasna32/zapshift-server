import express from "express";
import { createParcel, deleteParcel, getParcelId, getParcels, getParcelsByRider, getParcelsDeliveryStatus, updateDeliveryStatus, updateParcel } from "../controllers/parcelController.js";

const router = express.Router();

router.get("/", getParcels);
router.get("/rider", getParcelsByRider);
router.get("/:id", getParcelId);
router.post("/", createParcel);
router.delete("/:id", deleteParcel);
router.patch("/:id", updateParcel);
router.patch("/:id/status", updateDeliveryStatus)
router.get('/delivery-status/stats', getParcelsDeliveryStatus)

export default router;
