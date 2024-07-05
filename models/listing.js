const mongoose = require('mongoose');
const schema = mongoose.Schema;
const Review = require('./review.js');

const listingSchema = new schema({
    title : {
        type : String,
        required : true,
    },
    description : String,
    image : {  
        url: String,
        filename: String,
        // type : String,
        // filename : String,
        // default : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
        // set : (v) => v === ""? 
        // "https://t4.ftcdn.net/jpg/02/51/95/53/360_F_251955356_FAQH0U1y1TZw3ZcdPGybwUkH90a3VAhb.jpg" : v,
    },
    price : Number,
    location : String,
    country : String,
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: "review",
        },
    ],
    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async(listing) => {
    await Review.deleteMany({_id: {$in : listing.reviews}});
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;