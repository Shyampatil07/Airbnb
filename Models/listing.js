const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    description:String,
    image:{
        url: String,
        filename: String, 
        // type: String,
        // default: "https://skhcn.hatinh.gov.vn/storage/images.thumb.cbf73446-1c51-48f7-8f7f-2506989cb5b6.jpg",
        // set:  (v) => v === "" ? "https://skhcn.hatinh.gov.vn/storage/images.thumb.cbf73446-1c51-48f7-8f7f-2506989cb5b6.jpg" : v,
    },
    price: Number,
    location:String,
    country:String,
    reviews:[{
        type: Schema.Types.ObjectId,
        ref: "Review",
    },],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete",async (listing) => {
    if(listing) {
     await Review.deleteMany({_id: {$in: listing.reviews}});  //reviews:
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;