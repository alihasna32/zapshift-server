import client from "../config/db.js";

export function getPaymentCollection() {
  const db = client.db("zap_shift_db");
  return db.collection("payments");
}