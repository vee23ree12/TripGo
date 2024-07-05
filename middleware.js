const Listing = require('./models/listing.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('./schema.js');
const Review = require('./models/review.js');

module.exports.isLoggedIn = (req,res,next) => {
    console.log(req.user);
    req.session.redirectUrl = req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash("error", "you must be logged in !");
        return res.redirect("/login");
    }
    next();
}

//passports cann't access locals and hence cann't dlete them

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    const findList = await Listing.findById(id);
    if(!findList.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the Owner");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.validateReviewSchema = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async (req,res,next) => {
    let {id,reviewId} = req.params;
    const findReview = await Review.findById(reviewId);
    if(!findReview.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the Author os this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}