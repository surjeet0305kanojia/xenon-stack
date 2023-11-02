express = require("express"),
mongoose = require("mongoose"),
passport = require("passport"),
bodyParser = require("body-parser"),
LocalStrategy = require("passport-local"),
passportLocalMongoose =require("passport-local-mongoose"),
User = require("./models/user");
 
// mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/auth_demo_app");

mongoose.connect('mongodb://localhost:27017/auth_demo_app' , {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then( ()=>{
    console.log("connection successful")
}).catch((err)=>{
    console.log(err);
});
 
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(require("express-session")({
    secret: "bad secret lmao",
    resave: false,
    saveUninitialized: false
}));
 
app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 

app.get("/", function (req, res) { 
    res.render("home");
});
 
app.get("/secret", isLoggedIn, function (req, res) {
    res.render("secret");
});
 
app.get("/register", function (req, res) {
    res.render("register");
});
 
app.post("/register", function (req, res) {
    var username = req.body.username
    var password = req.body.password
    User.register(new User({ username: username }),
            password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
 
        passport.authenticate("local")(
            req, res, function () {
            res.render("secret");
        });
    });
});
 
app.get("/login", function (req, res) {
    res.render("login");
});
 
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function (req, res) {
});
 
app.get("/logout", function (req, res) {
    req.logout(function(err){
        if(err) return err;
    });
    res.redirect("/");
});
 
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
 
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Server Has Started on ${port}`);
});