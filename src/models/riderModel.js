import client from "../config/db.js";

export function ridersCollection() {
  const db = client.db("zap_shift_db");
  return db.collection("riders");
}