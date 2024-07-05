const User = require('../models/user.js');

module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req,res) => {//wrapAsync will handle error by lost page, so we'll use flash
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }else{
                console.log(registeredUser);
                req.flash("success", "Welcome to TripGo");
                res.redirect("/listings"); 
            }
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
    res.redirect(req.session.redirectUrl);
}

module.exports.login = async (req,res) => {
    req.flash("success", "welcome to TripGO ! You are logged in");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) => {
    req.logout((err) => {
        if (err) {
            return next (err);
        }
        req.flash("success", "You are logged Out !");
        res.redirect("/listings");
    });
}