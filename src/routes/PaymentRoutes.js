import express from "express";
import { createPaymentIntent, getPaymentHistory, paymentSuccess } from "../controllers/PaymentAPIS.js";
import { verifyFBToken } from "../middleware/verifyFBToken.js";

const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.get("/payment-history", verifyFBToken, getPaymentHistory);
router.patch("/payment-success", paymentSuccess);

export default router;