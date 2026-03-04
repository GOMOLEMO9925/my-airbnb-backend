import Review from "../models/Review.js";

const average = (values) => {
  if (!values.length) {
    return 0;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return Number((sum / values.length).toFixed(1));
};

export const calculateListingReviewStats = async (listingId) => {
  const reviews = await Review.find({ listing: listingId }).lean();

  if (!reviews.length) {
    return {
      reviews: 0,
      rating: 0,
      specificRatings: {
        cleanliness: 0,
        communication: 0,
        checkIn: 0,
        accuracy: 0,
        location: 0,
        value: 0
      }
    };
  }

  return {
    reviews: reviews.length,
    rating: average(reviews.map((item) => item.rating)),
    specificRatings: {
      cleanliness: average(reviews.map((item) => item.cleanliness)),
      communication: average(reviews.map((item) => item.communication)),
      checkIn: average(reviews.map((item) => item.checkIn)),
      accuracy: average(reviews.map((item) => item.accuracy)),
      location: average(reviews.map((item) => item.location)),
      value: average(reviews.map((item) => item.value))
    }
  };
};
