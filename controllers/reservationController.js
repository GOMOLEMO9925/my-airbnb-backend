import Reservation from "../models/Reservation.js";
import Accommodation from "../models/Accommodation.js";

export const createReservation = async (req, res) => {
  const { listingId, checkIn, checkOut, guests, total } = req.body;

  if (!listingId || !checkIn || !checkOut || !total) {
    return res.status(400).json({ message: "Missing reservation fields" });
  }

  const listing = await Accommodation.findById(listingId);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  const reservation = await Reservation.create({
    listing: listing._id,
    listingTitle: listing.title,
    user: req.user.id,
    host: listing.host,
    checkIn,
    checkOut,
    guests: guests || 1,
    total
  });

  return res.status(201).json(reservation);
};

export const getReservationsByHost = async (req, res) => {
  const reservations = await Reservation.find({ host: req.user.id }).sort({ createdAt: -1 });
  res.json(reservations);
};

export const getReservationsByUser = async (req, res) => {
  const reservations = await Reservation.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(reservations);
};

export const deleteReservation = async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found" });
  }

  const isOwner = String(reservation.user) === req.user.id || String(reservation.host) === req.user.id;
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to delete reservation" });
  }

  await reservation.deleteOne();
  return res.json({ message: "Reservation deleted" });
};
