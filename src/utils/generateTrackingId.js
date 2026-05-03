import crypto from "crypto";

export function generateTrackingId() {
  const prefix = "PRCL";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${date}-${random}`;
}
