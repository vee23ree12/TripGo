const Listing = require("../models/listing.js");

module.exports.IndexListing = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}

module.exports.ShowListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner").populate("owner");
    if(!listing){
        req.flash("error", "Requested Listing doesn't exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
    console.log(listing);
}

module.exports.renderNewForm = (req,res)=>{ //we put it on top why ???
    res.render("listings/new.ejs");
}

module.exports.createListing = async (req,res)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing");
    // }
    //here req.body.listing contains all the info in the form of a js object 
    const newList = new Listing(req.body.listing);

    // let {title, description, image, price, location, country } = req.body;
    // const newList = new Listing({
    //     title : title,
    //     description : desc,
    //     image : image,
    //     price : price,
    //     location : location,
    //     country : country
    // });

    newList.owner = req.user._id;
    newList.image = {url,filename};
    await newList.save();
        // .then((res)=>{
        //     console.log(res);
        // })
        // .catch((err)=>{
        //     console.log(err);
        // });

    req.flash("success", "New Listing created !");
    res.redirect("/listings");
}

module.exports.renderEditListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Requested Listing doesn't exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url, filename};
        await updatedListing.save();
    }
    req.flash("success", "Listing Edited !");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
}