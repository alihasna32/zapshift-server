import express from "express";
import {
  createUser,
  getNewUsers,
  getRoleUsers,
  getUsers,
  updateProfile,
} from "../controllers/userAPIS.js";
import { verifyFBToken } from "../middleware/verifyFBToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();
router.post("/users", createUser);
router.get("/users", verifyFBToken, getUsers);
router.patch("/users/:id/role", verifyFBToken, verifyAdmin, updateProfile);
router.get("/new-users", getNewUsers);
router.get("/users/:email/role", verifyFBToken, getRoleUsers);
export default router;
