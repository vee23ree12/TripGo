const express = require('express');  
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

dotenv.config();

app.use(cookieParser("secretcode"));

// const MONGO_URL = 'mongodb://127.0.0.1:27017/tripgo';
const dbUrl = process.env.ATLASDB_URL; 
console.log(dbUrl);

main()
    .then((res)=>{console.log("connected to MDB!")})
    .catch((err)=>{console.log(err)});

async function main(){
    await mongoose.connect(dbUrl); //use dbUrl instead of MONGO_URL
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.engine('ejs',ejsMate);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET, 
    },
    touchAfter: 24 * 3600,
});

store.on("error", (error) => {
    console.log("ERROR in MONGO SESSION STORE", error); 
});
 
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// app.get("/", (req,res)=>{
//     res.send("Working !");
//     console.dir(req.cookies);
// });

app.use(session(sessionOptions));//session ID will be stored on browser in the form of cookie if session works fine
app.use(flash());

app.use(passport.initialize()); //passport ko use krne se pehle we have to use passport.initialized
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld"); //register method checks whether the user is unique or not 
//     res.send(registeredUser);
// });

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.get("/getsignedcookie", (req,res) => {
    console.log('Middleware check:', req.signedCookies);
    res.cookie("MadeIn", "India", {signed: true});
    res.send("done !");
});

app.get("/verify", (req,res) => {
    console.log(req.cookies);
    console.log(req.signedCookies);
    res.send("verified");
})

app.get("/getCookie", (req,res) => {
    res.cookie("greet", "Helllo");
    res.cookie("MadeIn", "India");
    res.send("Sent you some cookie !");
});

app.get("/greet", (req,res) => {
    let {name="Anon"} = req.cookies;
    res.send(`hi ${name}`);
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found !"));
});

app.use((err, req, res, next)=>{
    let { statusCode = 500, message = "Some error !" } = err;
    res.status(statusCode).render("Error.ejs", { err });
    // res.status(statusCode).send(message);
});

app.listen("8080",()=>{
    console.log("Server is running at port 8080");
});