const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title : {
        type : String,
        required : true,
    },
    description : String,
    image : {
        url : String,
        filename : String,
    },
    price : Number,
    location : String,
    country : String,
    
    categories : [
        {
            type : String,
            enum : [
                "rooms",
                "mountains",
                "castles",
                "pools",
                "camping",
                "farms",
                "arctic",
                "domes",
                "boats",
                "trending",
                "iconic_cities"
            ],
        }
    ],
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        },
    ],
    
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    geometry: {
        type : {
            type : String,
            enum : ["Point"],
        },
        coordinates : {
            type : [Number],
        },
    },
}, { timestamps: true });

listingSchema.post("findOneAndDelete" , async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id : { $in : listing.reviews } });
    }
});
listingSchema.index({ createdAt: -1 });
listingSchema.index({ categories: 1, createdAt: -1 });

const Listing = mongoose.model("Listing" , listingSchema);
module.exports = Listing;