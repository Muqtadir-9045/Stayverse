const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const PAGE_SIZE = 12;

module.exports.index = async (req,res) => {
    let { category } = req.query;
    let page = Math.max(parseInt(req.query.page) || 1, 1);
    let query = {};
    if (category) {
        query.categories = category;
    }
    const offset = (page - 1) * PAGE_SIZE;
    // fetch one extra to know whether a next page exists; lean() skips building full mongoose documents
    const [listings, total] = await Promise.all([
        Listing.find(query)
            .select("title price image")
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(PAGE_SIZE + 1)
            .lean(),
        category ? Listing.countDocuments(query) : Promise.resolve(0),
    ]);
    const hasMore = listings.length > PAGE_SIZE;
    const allListings = listings.slice(0, PAGE_SIZE);

    if (req.query.partial) {
        res.set("X-Has-More", String(hasMore));
        return res.render("listings/cards", { allListings, offset });
    }
    res.render("listings/index", { allListings, category, total, hasMore }); 
}; 

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews" , 
        populate : {
            path : "author",
        },
    })
    .populate("owner");
    if(!listing) {
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs" , {listing});
}

module.exports.createListing = async(req,res,next) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

        let url = req.file.path;
        let filename = req.file.filename;
        if(!req.body.listing) {
            throw new ExpressError(400 , "Send valid data for listing");
        }
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;        
        newListing.image = { url , filename };
        newListing.geometry = response.body.features[0].geometry;
        let savedListing =await newListing.save();
        req.flash("success" , "New Listing Created!");
        res.redirect(`/listings/${savedListing._id}`);
}

 
module.exports.renderEditFrom = async (req , res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs" , {listing , originalImageUrl});
}

module.exports.updateListing = async (req , res) => {
    if(!req.body.listing) {
        throw new ExpressError(400 , "Send Valid Data for Listing");
    }
    let { id } = req.params;

    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    let listing = await Listing.findByIdAndUpdate(id , { ...req.body.listing });
    listing.geometry = response.body.features[0].geometry;

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url , filename };
    }
    await listing.save();
    req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res,next) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
}