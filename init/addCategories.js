if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Category assignments based on listing titles and descriptions
const categoryMapping = {
    "Cozy Beachfront Cottage": ["pools", "iconic_cities"],
    "Modern Loft in Downtown": ["rooms", "iconic_cities"],
    "Mountain Retreat": ["mountains", "camping"],
    "Historic Villa in Tuscany": ["castles", "iconic_cities"],
    "Secluded Treehouse Getaway": ["camping", "farms"],
    "Beachfront Paradise": ["pools", "boats"],
    "Rustic Cabin by the Lake": ["camping", "mountains"],
    "Luxury Penthouse with City Views": ["rooms", "iconic_cities"],
    "Ski-In/Ski-Out Chalet": ["mountains", "arctic"],
    "Safari Lodge in the Serengeti": ["camping", "farms"],
    "Historic Canal House": ["rooms", "iconic_cities"],
    "Private Island Retreat": ["boats", "pools"],
    "Charming Cottage in the Cotswolds": ["rooms", "iconic_cities"],
    "Historic Brownstone in Boston": ["rooms", "iconic_cities"],
    "Beachfront Bungalow in Bali": ["pools", "boats"],
    "Mountain View Cabin in Banff": ["mountains", "camping"],
    "Art Deco Apartment in Miami": ["rooms", "iconic_cities"],
    "Tropical Villa in Phuket": ["pools", "boats"],
    "Historic Castle in Scotland": ["castles", "mountains"],
    "Desert Oasis in Dubai": ["pools", "iconic_cities"],
    "Rustic Log Cabin in Montana": ["mountains", "camping"],
    "Beachfront Villa in Greece": ["pools", "iconic_cities"],
    "Eco-Friendly Treehouse Retreat": ["camping", "domes"],
    "Historic Cottage in Charleston": ["rooms", "iconic_cities"],
    "Modern Apartment in Tokyo": ["rooms", "iconic_cities"],
    "Lakefront Cabin in New Hampshire": ["camping", "mountains"],
    "Luxury Villa in the Maldives": ["pools", "boats"],
    "Ski Chalet in Aspen": ["mountains", "arctic"],
    "Secluded Beach House in Costa Rica": ["camping", "pools"],
};

const addCategories = async () => {
  try {
    console.log("Starting to add categories to listings...\n");

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings to update\n`);

    for (let listing of listings) {
      // Get categories from mapping, or assign based on keywords
      let categories = categoryMapping[listing.title];

      if (!categories) {
        // If title not in mapping, assign based on keywords
        categories = [];

        if (listing.title.toLowerCase().includes("mountain") || 
            listing.title.toLowerCase().includes("cabin") ||
            listing.location.toLowerCase().includes("mountain")) {
          categories.push("mountains");
        }
        if (listing.title.toLowerCase().includes("pool") || 
            listing.title.toLowerCase().includes("beach")) {
          categories.push("pools");
        }
        if (listing.title.toLowerCase().includes("castle")) {
          categories.push("castles");
        }
        if (listing.title.toLowerCase().includes("camp") || 
            listing.title.toLowerCase().includes("treehouse")) {
          categories.push("camping");
        }
        if (listing.title.toLowerCase().includes("farm")) {
          categories.push("farms");
        }
        if (listing.title.toLowerCase().includes("arctic") || 
            listing.title.toLowerCase().includes("ski")) {
          categories.push("arctic");
        }
        if (listing.title.toLowerCase().includes("dome")) {
          categories.push("domes");
        }
        if (listing.title.toLowerCase().includes("boat") || 
            listing.title.toLowerCase().includes("island")) {
          categories.push("boats");
        }
        
        // Default to rooms if no category assigned
        if (categories.length === 0) {
          categories.push("rooms");
        }
      }

      listing.categories = categories;
      await listing.save();

      console.log(`✅ ${listing.title}`);
      console.log(`   Categories: ${categories.join(", ")}\n`);
    }

    console.log("✅ All listings updated with categories!");
    process.exit(0);
  } catch (err) {
    console.log("❌ Error:", err);
    process.exit(1);
  }
};

addCategories();