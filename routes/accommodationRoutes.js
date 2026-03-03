import express from "express";
import auth from "../middleware/auth.js";
import {
  createAccommodation,
  deleteAccommodation,
  getAccommodationById,
  getAccommodations,
  updateAccommodation
} from "../controllers/accommodationController.js";

const router = express.Router();

router.get("/", getAccommodations);
router.get("/:id", getAccommodationById);
router.post("/", auth, createAccommodation);
router.put("/:id", auth, updateAccommodation);
router.delete("/:id", auth, deleteAccommodation);

export default router;
