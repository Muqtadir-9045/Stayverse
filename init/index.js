if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const listings = [];

  for (let listingData of initData.data) {
    const { owner: ownerData, ...fields } = listingData;

    let owner = await User.findOne({ username: ownerData.username });
    if (!owner) {
      owner = new User({ username: ownerData.username, email: ownerData.email });
      await User.register(owner, process.env.SEED_PASSWORD);
      console.log(`Created user: ${ownerData.username}`);
    }

    listings.push({ ...fields, owner: owner._id });
  }

  await Listing.insertMany(listings);
  console.log("data was initialized");
  process.exit(0);
};

initDB();
