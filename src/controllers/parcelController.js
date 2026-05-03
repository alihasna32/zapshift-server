import { getParcelCollection } from "../models/parcelModel.js";
import { ObjectId } from "mongodb";
import { ridersCollection } from "../models/riderModel.js";
import { logTracking } from "./trackingController.js";
import { generateTrackingId } from "../utils/generateTrackingId.js";
import { count } from "console";

export const createParcel = async (req, res) => {
  try {
    const parcel = req.body;
    const parcelsCollection = getParcelCollection();
    const trackingId = generateTrackingId();
    parcel.trackingId = trackingId;
    parcel.createdAt = new Date();

    logTracking(trackingId, "parcel_created");

    const result = await parcelsCollection.insertOne(parcel);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create parcel" });
  }
};

export const getParcels = async (req, res) => {
  try {
    const query = {};
    const { email, deliveryStatus } = req.query;
    if (email) {
      query.senderEmail = email;
    }
    if (deliveryStatus) {
      query.deliveryStatus = deliveryStatus;
    }

    const options = { sort: { createdAt: -1 } };

    const parcelsCollection = getParcelCollection();
    const cursor = parcelsCollection.find(query, options);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parcels" });
  }
};

export const getParcelsByRider = async (req, res) => {
  try {
    const { riderEmail, deliveryStatus } = req.query;
    const query = {};
    if (riderEmail) {
      query.riderEmail = riderEmail;
    }
    if (deliveryStatus !== 'parcel_delivered') {
      // query.deliveryStatus = {$in: ['driver_assigned', 'rider_arriving']};
      query.deliveryStatus = { $nin: ["parcel_delivered"] };
    } else {
      query.deliveryStatus = deliveryStatus;
    }

    const parcelsCollection = getParcelCollection();
    const cursor = parcelsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parcels" });
  }
};

export const getParcelId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const parcelsCollection = getParcelCollection();
    const result = await parcelsCollection.findOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parcel" });
  }
};

export const deleteParcel = async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const parcelsCollection = getParcelCollection();
    const result = await parcelsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete parcel" });
  }
};

export const updateParcel = async (req, res) => {
  try {
    const { riderId, riderName, riderEmail, trackingId } = req.body;
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const parcelsCollection = getParcelCollection();
    const updateDoc = {
      $set: {
        deliveryStatus: "driver_assigned",
        riderId: riderId,
        riderName: riderName,
        riderEmail: riderEmail,
      },
    };
    const result = await parcelsCollection.updateOne(query, updateDoc);
    // update rider info
    const riderQuery = { _id: new ObjectId(riderId) };
    const riderCollection = ridersCollection();
    const riderUpdateDoc = {
      $set: {
        workStatus: "in_delivery",
      },
    };
    const riderResult = await riderCollection.updateOne(
      riderQuery,
      riderUpdateDoc,
    );

    // log tracking
    logTracking(trackingId, "driver_assigned");

    res.send(riderResult);
  } catch (error) {
    res.status(500).json({ error: "Failed to update parcel" });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus, riderId, trackingId } = req.body;
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const parcelsCollection = getParcelCollection();
    const updateDoc = {
      $set: {
        deliveryStatus: deliveryStatus,

      },
    };
    if (deliveryStatus === "parcel_delivered") {
      // update rider info
      const riderQuery = { _id: new ObjectId(riderId) };
      const riderCollection = ridersCollection();
      const riderUpdateDoc = {
        $set: {
          workStatus: "available",
        },
      };
      const riderResult = await riderCollection.updateOne(
        riderQuery,
        riderUpdateDoc,
      );
    }
    const result = await parcelsCollection.updateOne(query, updateDoc);
    // log tracking
    logTracking(trackingId, deliveryStatus)
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update delivery status" });
  }
};


export const getParcelsDeliveryStatus = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ];
    const parcelsCollection = getParcelCollection();
    const cursor = parcelsCollection.aggregate(pipeline);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parcels" });
  }
}