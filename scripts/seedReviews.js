import dotenv from "dotenv";
import mongoose from "mongoose";
import Accommodation from "../models/Accommodation.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { calculateListingReviewStats } from "../utils/reviewStats.js";

dotenv.config();

const clamp = (value) => Math.max(1, Math.min(5, Number(value)));

const templates = [
  {
    comment: "Wonderful neighborhood, easy access to restaurants and the subway, cozy apartment and very responsive host.",
    rating: 5,
    cleanliness: 5,
    communication: 5,
    checkIn: 5,
    accuracy: 5,
    location: 4.9,
    value: 4.8
  },
  {
    comment: "Great stay overall. Clean unit, smooth check-in, and the location made city travel easy.",
    rating: 4.8,
    cleanliness: 5,
    communication: 4.8,
    checkIn: 4.7,
    accuracy: 4.8,
    location: 4.9,
    value: 4.7
  },
  {
    comment: "Host was attentive and the place matched the photos. Would stay again.",
    rating: 4.7,
    cleanliness: 4.8,
    communication: 4.9,
    checkIn: 4.8,
    accuracy: 4.6,
    location: 4.7,
    value: 4.6
  },
  {
    comment: "Really nice place to stay for a week. Comfortable bed, fast wifi, and quiet at night.",
    rating: 4.9,
    cleanliness: 4.9,
    communication: 5,
    checkIn: 5,
    accuracy: 4.8,
    location: 4.8,
    value: 4.7
  }
];

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const [listings, users] = await Promise.all([
    Accommodation.find().limit(3),
    User.find({ role: { $in: ["user", "host", "admin"] } }).limit(6)
  ]);

  if (!listings.length || users.length < 2) {
    throw new Error("Need at least 1 listing and 2 users before seeding reviews.");
  }

  const inserted = [];

  for (let i = 0; i < listings.length; i += 1) {
    const listing = listings[i];
    const reviewUsers = users.filter((user) => String(user._id) !== String(listing.host)).slice(0, 3);

    for (let j = 0; j < reviewUsers.length; j += 1) {
      const user = reviewUsers[j];
      const template = templates[(i + j) % templates.length];

      const exists = await Review.findOne({ listing: listing._id, user: user._id });
      if (exists) {
        continue;
      }

      const review = await Review.create({
        listing: listing._id,
        user: user._id,
        username: user.username,
        comment: template.comment,
        rating: clamp(template.rating),
        cleanliness: clamp(template.cleanliness),
        communication: clamp(template.communication),
        checkIn: clamp(template.checkIn),
        accuracy: clamp(template.accuracy),
        location: clamp(template.location),
        value: clamp(template.value)
      });

      inserted.push(review._id);
    }

    const stats = await calculateListingReviewStats(listing._id);
    await Accommodation.findByIdAndUpdate(listing._id, {
      rating: stats.rating,
      reviews: stats.reviews,
      specificRatings: stats.specificRatings
    });
  }

  console.log(`Inserted ${inserted.length} review(s).`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Review seeding failed", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
