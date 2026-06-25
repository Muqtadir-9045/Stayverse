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
  let owner = await User.findOne({ username: "delta-student" });
  if (!owner) {
    owner = new User({ username: "delta-student", email: "delta@student.com" });
    await User.register(owner, "helloworld");
    console.log("Created delta-student user");
  }

  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: owner._id,
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
  process.exit(0);
};

initDB();
