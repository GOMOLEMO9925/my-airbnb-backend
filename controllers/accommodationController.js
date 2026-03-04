import Accommodation from "../models/Accommodation.js";

const ensureHost = (req, res) => {
  if (req.user.role !== "host" && req.user.role !== "admin") {
    res.status(403).json({ message: "Host access required" });
    return false;
  }
  return true;
};

export const createAccommodation = async (req, res) => {
  if (!ensureHost(req, res)) {
    return;
  }

  const payload = { ...req.body, host: req.user.id };

  const accommodation = await Accommodation.create(payload);
  res.status(201).json(accommodation);
};

export const getAccommodations = async (req, res) => {
  const accommodations = await Accommodation.find().sort({ createdAt: -1 });
  res.json(accommodations);
};

export const getMyAccommodations = async (req, res) => {
  if (req.user.role === "admin") {
    const accommodations = await Accommodation.find().sort({ createdAt: -1 });
    return res.json(accommodations);
  }

  if (req.user.role !== "host") {
    return res.status(403).json({ message: "Host access required" });
  }

  const accommodations = await Accommodation.find({ host: req.user.id }).sort({ createdAt: -1 });
  return res.json(accommodations);
};

export const getAccommodationById = async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id);
  if (!accommodation) {
    return res.status(404).json({ message: "Listing not found" });
  }
  return res.json(accommodation);
};

export const updateAccommodation = async (req, res) => {
  if (!ensureHost(req, res)) {
    return;
  }

  const accommodation = await Accommodation.findById(req.params.id);
  if (!accommodation) {
    return res.status(404).json({ message: "Listing not found" });
  }

  if (String(accommodation.host) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to update this listing" });
  }

  Object.assign(accommodation, req.body);
  await accommodation.save();
  return res.json(accommodation);
};

export const deleteAccommodation = async (req, res) => {
  if (!ensureHost(req, res)) {
    return;
  }

  const accommodation = await Accommodation.findById(req.params.id);
  if (!accommodation) {
    return res.status(404).json({ message: "Listing not found" });
  }

  if (String(accommodation.host) !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to delete this listing" });
  }

  await accommodation.deleteOne();
  return res.json({ message: "Listing deleted" });
};
