//Day 47 - 03 : Creating Review Model

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment : String,
    rating : {
        type : Number,
        min : 1,
        max : 5,
    },
    createdAt : {
        type : Date,
        default : Date.now(),
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User",
    }
    //Day 51 - 09 : Authorization for reviews part 1 
});

module.exports = mongoose.model("Review" , reviewSchema);