import { trackingCollection } from "../models/trackingModel.js";

export const logTracking = async (trackingId, status) => {
  try {
    const log = {
      trackingId,
      status,
      details: status.split("_").join(" "),
      createdAt: new Date(),
    };
    
    const trackingsCollection = trackingCollection();
    const result = await trackingsCollection.insertOne(log);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTrackingHistory = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const trackingsCollection = trackingCollection();
    const query = { trackingId };
    const options = { sort: { createdAt: -1 } };

    const trackings = await trackingsCollection.find(query, options).toArray();
    res.send(trackings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
