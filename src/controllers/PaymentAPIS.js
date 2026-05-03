import { ObjectId } from "mongodb";
import { generateTrackingId } from "../utils/generateTrackingId.js";
import { stripe } from "../../api/index.js";
import { getParcelCollection } from "../models/parcelModel.js";
import { getPaymentCollection } from "../models/paymentModel.js";
import { logTracking } from "./trackingController.js";

export const createPaymentIntent = async (req, res) => {
  try {
    const parcelInfo = req.body;
    const amount = parseInt(parcelInfo.cost) * 100;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "USD",
            unit_amount: amount,
            product_data: {
              name: `Please pay for: ${parcelInfo.parcelName}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        parcelId: parcelInfo.parcelId,
        trackingId: parcelInfo.trackingId,
      },
      customer_email: parcelInfo.senderEmail,
      success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
    });
    res.send({ url: session.url });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create payment intent" });
  }
};

// payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const email = req.query.email;
    const query = {};
    const paymentCollection = getPaymentCollection();
    if (email) {
      query.customerEmail = email;

      // check email address
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
    }
    const cursor = paymentCollection.find(query).sort({ paidAt: -1 });
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({ error: "Failed to get payment history" });
  }
};

// update info
export const paymentSuccess = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const transactionId = session.payment_intent;
    const trackingId = session.metadata.trackingId;
    const query = { transactionId: transactionId };
    const paymentExist = await getPaymentCollection().findOne(query);
    console.log(paymentExist);

    if (paymentExist) {
      return res.send({
        success: true,
        message: "Payment already processed.",
        transactionId: transactionId,
        trackingId: paymentExist.trackingId,
      });
    }

    if (session.payment_status === "paid") {
      const id = session.metadata.parcelId;
      const query = { _id: new ObjectId(id) };
      const updata = {
        $set: {
          paymentStatus: "paid",
          deliveryStatus: "pending-pickup",
        },
      };
      const parcelsCollection = getParcelCollection();
      const result = await parcelsCollection.updateOne(query, updata);

      const payment = {
        amount: session.amount_total / 100,
        currency: session.currency,
        customerEmail: session.customer_email,
        parcelId: session.metadata.parcelId,
        parcelName: session.metadata.parcelName,
        transactionId: session.payment_intent,
        paymentStatus: session.payment_status,
        paidAt: new Date(),
        trackingId: trackingId,
      };

      const paymentCollection = getPaymentCollection();

      const resultPayment = await paymentCollection.insertOne(payment);

      logTracking(trackingId, "parcel_paid");

      return res.send({
        success: true,
        modifyParcel: result,
        trackingId: trackingId,
        transactionId: session.payment_intent,
        paymentInfo: resultPayment,
      });
    }

    return res
      .status(400)
      .send({ success: false, message: "Payment not completed." });
  } catch (error) {
    console.error("Payment success error:", error);
    res.status(500).json({ error: "Failed to process payment success" });
  }
};
