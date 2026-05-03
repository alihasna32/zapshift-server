import client from "../config/db.js";

export function getParcelCollection() {
  const db = client.db("zap_shift_db");
  return db.collection("parcels");
}