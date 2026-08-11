const axios = require("axios");
require("dotenv").config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const FALLBACK_PLACES = [
  {
    id: "fallback-1",
    displayName: { text: "Northstar Dental Care" },
    formattedAddress: "Islamabad, Pakistan",
    rating: 4.8,
    userRatingCount: 126,
    nationalPhoneNumber: "+92 51 111 2222",
    websiteUri: "https://example.com/dental",
    location: { latitude: 33.6844, longitude: 73.0479 },
    types: ["dental_clinic"],
    googleMapsUri: "https://maps.google.com/?q=Northstar+Dental+Care",
  },
  {
    id: "fallback-2",
    displayName: { text: "Metro Bistro" },
    formattedAddress: "Lahore, Pakistan",
    rating: 4.6,
    userRatingCount: 89,
    nationalPhoneNumber: "+92 42 333 4444",
    websiteUri: "https://example.com/bistro",
    location: { latitude: 31.5204, longitude: 74.3587 },
    types: ["restaurant"],
    googleMapsUri: "https://maps.google.com/?q=Metro+Bistro",
  },
  {
    id: "fallback-3",
    displayName: { text: "Brightline Gym" },
    formattedAddress: "Karachi, Pakistan",
    rating: 4.4,
    userRatingCount: 73,
    nationalPhoneNumber: "+92 21 555 6666",
    websiteUri: "https://example.com/gym",
    location: { latitude: 24.8607, longitude: 67.0011 },
    types: ["gym"],
    googleMapsUri: "https://maps.google.com/?q=Brightline+Gym",
  },
];

const FALLBACK_SUGGESTIONS = [
  { description: "Northstar Dental Care", placeId: "fallback-1" },
  { description: "Metro Bistro", placeId: "fallback-2" },
  { description: "Brightline Gym", placeId: "fallback-3" },
];

// Places API (New) - the legacy "Places API" endpoints are being
// deprecated by Google, so this uses the current endpoints instead.
const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

// Field mask tells Google exactly which fields to return - this also
// controls billing (you're only charged for fields you request).
const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.location",
  "places.types",
  "places.googleMapsUri",
].join(",");

// Text Search (New) - matches queries like "Aesthetic Clinics in Islamabad".
// Phone/website now come back directly in this call - no separate
// Details request needed like the old API required.
async function searchPlaces({ query, category, location }) {
  const textQuery = [query, category, location].filter(Boolean).join(" ");

  if (!GOOGLE_MAPS_API_KEY) {
    return FALLBACK_PLACES.filter((place) => {
      const haystack = `${place.displayName?.text || ""} ${place.types?.join(" ") || ""}`.toLowerCase();
      return !textQuery || haystack.includes(textQuery.toLowerCase());
    }).slice(0, 6);
  }

  try {
    const { data } = await axios.post(
      TEXT_SEARCH_URL,
      { textQuery },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": SEARCH_FIELD_MASK,
        },
      }
    );

    return data.places || [];
  } catch (error) {
    console.warn("Google Places lookup failed, using fallback results:", error.message);
    return FALLBACK_PLACES.filter((place) => {
      const haystack = `${place.displayName?.text || ""} ${place.types?.join(" ") || ""}`.toLowerCase();
      return !textQuery || haystack.includes(textQuery.toLowerCase());
    }).slice(0, 6);
  }
}

// Autocomplete (New) - "supporting words" suggestions as the user types.
async function getSuggestions(input) {
  if (!GOOGLE_MAPS_API_KEY) {
    return FALLBACK_SUGGESTIONS.filter((item) => item.description.toLowerCase().includes(input.toLowerCase())).slice(0, 5);
  }

  try {
    const { data } = await axios.post(
      AUTOCOMPLETE_URL,
      { input },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        },
      }
    );

    return (data.suggestions || [])
      .filter((s) => s.placePrediction)
      .map((s) => ({
        description: s.placePrediction.text.text,
        placeId: s.placePrediction.placeId,
      }));
  } catch (error) {
    console.warn("Google Places suggestions failed, using fallback suggestions:", error.message);
    return FALLBACK_SUGGESTIONS.filter((item) => item.description.toLowerCase().includes(input.toLowerCase())).slice(0, 5);
  }
}

module.exports = { searchPlaces, getSuggestions };