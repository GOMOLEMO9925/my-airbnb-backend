import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation" },
    listingTitle: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, default: 1 },
    total: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
