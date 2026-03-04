import mongoose from "mongoose";

const boundedRating = {
  type: Number,
  min: 1,
  max: 5,
  required: true
};

const reviewSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true },
    rating: boundedRating,
    comment: { type: String, required: true, trim: true, minlength: 5, maxlength: 1500 },
    cleanliness: boundedRating,
    communication: boundedRating,
    checkIn: boundedRating,
    accuracy: boundedRating,
    location: boundedRating,
    value: boundedRating
  },
  { timestamps: true }
);

reviewSchema.index({ listing: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
