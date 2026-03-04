import Accommodation from "../models/Accommodation.js";
import Review from "../models/Review.js";
import Reservation from "../models/Reservation.js";
import { calculateListingReviewStats } from "../utils/reviewStats.js";

const parseRating = (value) => Number(value);

const isValidRating = (value) => Number.isFinite(value) && value >= 1 && value <= 5;

export const getReviewsByListing = async (req, res) => {
  const listingId = req.query.listingId;

  if (!listingId) {
    return res.status(400).json({ message: "listingId is required" });
  }

  const reviews = await Review.find({ listing: listingId }).sort({ createdAt: -1 }).lean();
  return res.json(reviews);
};

export const createReview = async (req, res) => {
  const { listingId, rating, comment, cleanliness, communication, checkIn, accuracy, location, value } = req.body;

  if (!listingId || !comment) {
    return res.status(400).json({ message: "listingId and comment are required" });
  }

  const trimmedComment = String(comment).trim();
  if (trimmedComment.length < 5) {
    return res.status(400).json({ message: "Comment must be at least 5 characters" });
  }

  const ratings = {
    rating: parseRating(rating),
    cleanliness: parseRating(cleanliness ?? rating),
    communication: parseRating(communication ?? rating),
    checkIn: parseRating(checkIn ?? rating),
    accuracy: parseRating(accuracy ?? rating),
    location: parseRating(location ?? rating),
    value: parseRating(value ?? rating)
  };

  const hasInvalidRating = Object.values(ratings).some((score) => !isValidRating(score));
  if (hasInvalidRating) {
    return res.status(400).json({ message: "Ratings must be between 1 and 5" });
  }

  const listing = await Accommodation.findById(listingId);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const completedReservation = await Reservation.findOne({
    listing: listingId,
    user: req.user.id,
    checkOut: { $lt: today }
  }).lean();

  if (!completedReservation) {
    return res.status(403).json({
      message: "You can only review a listing after completing a reservation."
    });
  }

  const existing = await Review.findOne({ listing: listingId, user: req.user.id });
  if (existing) {
    return res.status(400).json({ message: "You already reviewed this listing" });
  }

  const review = await Review.create({
    listing: listingId,
    user: req.user.id,
    username: req.user.username,
    comment: trimmedComment,
    ...ratings
  });

  const stats = await calculateListingReviewStats(listingId);
  await Accommodation.findByIdAndUpdate(listingId, {
    rating: stats.rating,
    reviews: stats.reviews,
    specificRatings: stats.specificRatings
  });

  return res.status(201).json(review);
};

export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  const isOwner = String(review.user) === req.user.id;
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to delete this review" });
  }

  const listingId = review.listing;
  await review.deleteOne();

  const stats = await calculateListingReviewStats(listingId);
  await Accommodation.findByIdAndUpdate(listingId, {
    rating: stats.rating,
    reviews: stats.reviews,
    specificRatings: stats.specificRatings
  });

  return res.json({ message: "Review deleted" });
};
