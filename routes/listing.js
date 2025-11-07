const express = require("express");
const router = express.Router();
const Listing = require("../Models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


//alllistings   
router.get("/",wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
})); 

//newlistingsfrom
router.get("/new",isLoggedIn, (req,res) => {
    res.render("listings/new");
})

//show
router.get("/:id",wrapAsync( async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
        populate:{
            path: "author", 
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","listing you requested for does not exist");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", {listing});
}));

//addnewListings Creata
router.post("/", isLoggedIn,upload.single("listing[image]"),validateListing ,wrapAsync( async(req,res)=>{

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, ".." , filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();

    req.flash("success", "New Listings Created.");
    res.redirect("/listings");
}));


//editform
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync( async(req,res)=>{
      let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested for does not exist");
        res.redirect("/listings");
    }


    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit", {listing , originalImageUrl});
}));

//upadteedit
router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"), validateListing ,wrapAsync( async(req, res)=> {
     let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
 }
     req.flash("success", " Listings upadted.");
    res.redirect(`/listings/${id}`);
}));

//delete
router.delete("/:id",isLoggedIn,isOwner,wrapAsync( async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing) ;
     req.flash("success", " Listings deleted.");
    res.redirect("/listings");
}));

module.exports = router;