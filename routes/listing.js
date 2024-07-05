if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
console.log(process.env.SECRET);

const express = require("express");
const router = express.Router({mergeParams: true}); //if you want to access params from the Parent route via the child route set as true
const wrapAsync = require('../utils/wrapAsync.js');
const {listingSchema, reviewSchema} = require('../schema.js'); //validate schema
const Listing = require("../models/listing.js"); 
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require('../controllers/listing.js');

const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage}); //it uploads image in upload folder
router
    .route("/")
    .get(wrapAsync(listingController.IndexListing))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing)) //Create in DB Route - implement isLoggedIn to avoid hoppscotch attacks
    
    // .post(upload.single('listing[image]'),(req, res) => {
    //     res.send(req.file);
    // })
//Direct to new Listing Page
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.ShowListing)) //show list route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing)) //Update in DB Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); //Delete From DB Route

//Direct to edit page
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditListing));

module.exports = router;
