const express = require("express");
const router = express.Router({ mergeParams : true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn , isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
router.post(
    "/" , 
    isLoggedIn , 
    wrapAsync(reviewController.createReview)
);
router.delete(
    "/:reviewId",
    isLoggedIn , 
    isReviewAuthor ,
    wrapAsync(reviewController.destroyReview)
);
module.exports = router;





    