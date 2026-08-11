const {
  searchPlaces,
  getSuggestions,
} = require("../utils/googlePlaces");

// GET /api/lead-discovery/search
async function search(req, res, next) {
  try {
    const {
      query,
      category,
      location,
    } = req.query;

    if (!query && !category) {
      return res.status(400).json({
        message:
          "Provide a search query or category.",
      });
    }

    const places = await searchPlaces({
      query,
      category,
      location,
    });

    const results = places.map((place) => ({
      placeId: place.id,
      name:
        place.displayName?.text ||
        "Unnamed business",
      category:
        place.types?.[0]?.replace(
          /_/g,
          " "
        ) || "Business",
      rating: place.rating || null,
      reviewsCount:
        place.userRatingCount || 0,
      address: place.formattedAddress,
      phone:
        place.nationalPhoneNumber ||
        place.internationalPhoneNumber ||
        null,
      website: place.websiteUri || null,
      mapsUrl:
        place.googleMapsUri || null,
      location: place.location || null,
      isDuplicate: false,
    }));

    return res.status(200).json({
      results,
    });
  } catch (err) {
    next(err);
  }
}


async function suggest(req, res, next) {
  try {
    const { input } = req.query;

    if (
      !input ||
      input.trim().length < 2
    ) {
      return res.status(200).json({
        suggestions: [],
      });
    }

    const suggestions =
      await getSuggestions(input);

    return res.status(200).json({
      suggestions,
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
  search,
  suggest,
};