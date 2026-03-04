import express from "express";
import auth from "../middleware/auth.js";
import { createReview, deleteReview, getReviewsByListing } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReviewsByListing);
router.post("/", auth, createReview);
router.delete("/:id", auth, deleteReview);

export default router;
