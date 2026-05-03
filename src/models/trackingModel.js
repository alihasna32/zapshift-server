import client from "../config/db.js";

export function trackingCollection() {
  const db = client.db("zap_shift_db");
  return db.collection("trackings");
}