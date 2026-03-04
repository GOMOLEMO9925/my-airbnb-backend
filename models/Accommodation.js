import mongoose from "mongoose";

const accommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, default: "" },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    guests: { type: Number, default: 1 },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    weeklyDiscount: { type: Number, default: 0 },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    occupancyTaxes: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    specificRatings: {
      cleanliness: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      checkIn: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      value: { type: Number, default: 0 }
    },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Accommodation", accommodationSchema);
