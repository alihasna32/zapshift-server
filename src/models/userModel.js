import client from "../config/db.js";

export function getUserCollection() {
  const db = client.db("zap_shift_db");
  return db.collection("users");
}