import express from "express";
import auth from "../middleware/auth.js";
import {
  createReservation,
  deleteReservation,
  getReservationsByHost,
  getReservationsByUser
} from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", auth, createReservation);
router.get("/host", auth, getReservationsByHost);
router.get("/user", auth, getReservationsByUser);
router.delete("/:id", auth, deleteReservation);

export default router;
