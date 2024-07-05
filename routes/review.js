const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const Review = require('../models/review.js');
const {validateReviewSchema, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviewController = require('../controllers/review.js');

//review - post route
router.post("/", isLoggedIn,validateReviewSchema, wrapAsync (reviewController.createReview));

//Delete review Route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync (reviewController.destroyReview));

module.exports = router;

//common route : /listings/:id/reviews for reviews so remove it 
//common route : /listings for listing 