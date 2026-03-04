import express from "express";
import auth from "../middleware/auth.js";
import {
  createAccommodation,
  deleteAccommodation,
  getAccommodationById,
  getMyAccommodations,
  getAccommodations,
  updateAccommodation
} from "../controllers/accommodationController.js";

const router = express.Router();

router.get("/", getAccommodations);
router.get("/mine", auth, getMyAccommodations);
router.get("/:id", getAccommodationById);
router.post("/", auth, createAccommodation);
router.put("/:id", auth, updateAccommodation);
router.delete("/:id", auth, deleteAccommodation);

export default router;
