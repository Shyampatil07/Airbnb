const express = require("express");
const router = express.Router({ mergeParams:true });
const Listing = require("../Models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Review =require("../Models/review.js");
const {validateReview,isLoggedIn, isReviewAuthor} = require("../middleware.js");




//Review POst
router.post("/",isLoggedIn,validateReview,wrapAsync( async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
 
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

     req.flash("success","Review created sucessful")
    res.redirect(`/listings/${listing._id}`); 
 
}));

//delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(async(req,res)=>{
    let{id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
     req.flash("success", " review deleted.");

    res.redirect(`/listings/${id}`);
}));

module.exports = router;