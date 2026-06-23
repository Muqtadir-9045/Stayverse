if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

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

const updateGeometry = async () => {
  try {
    const listingsWithoutGeometry = await Listing.find({ 
      geometry: { $exists: false } 
    });

    console.log(`Found ${listingsWithoutGeometry.length} listings without geometry`);

    for (let listing of listingsWithoutGeometry) {
      try {
        console.log(`Processing: ${listing.title} at ${listing.location}`);
        
        let response = await geocodingClient
          .forwardGeocode({
            query: listing.location,
            limit: 1,
          })
          .send();

        listing.geometry = response.body.features[0].geometry;

        await listing.save();
        
        console.log(`✅ Updated: ${listing.title}`);
        console.log(`   Coordinates: ${listing.geometry.coordinates}`);
      } catch (err) {
        console.log(`❌ Error updating ${listing.title}: ${err.message}`);
      }
    }

    console.log("✅ All listings updated successfully!");
    process.exit(0);
  } catch (err) {
    console.log("❌ Error:", err);
    process.exit(1);
  }
};

updateGeometry();