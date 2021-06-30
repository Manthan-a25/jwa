var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var express = require("express");
var app = express();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var multer = require("multer");
var path = require("path");
var fs = require("fs");
require("dotenv/config");
var User = require("./modules/user.js");
var Gallery = require("./modules/gallery.js");
const Notification = require("./Routes/notification");
const Dashboard = require('./Routes/dashboard');
const Payment = require('./Routes/payment');
const Transactions = require('./modules/Transaction');


//Database setup
mongoose.connect("mongodb://127.0.0.1:27017/janhit", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    require("express-session")({
        secret: "any string",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

//Multer Setup ===================

var storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now());
    },
});

var upload = multer({
    storage: storage,
});

//=====================
//ROUTES
//=====================

//Root Route
app.get("/", function (req, res) {
    Gallery.find({}, function (err, images) {
        if (err) {
            console.log(err);
        } else {
            res.render("homepage.ejs", {images: images});
        }
    });
});

app.use('/notification', Notification);
app.use('/dashboard', Dashboard);
app.use('/payWithPaytm', Payment);

//Registration GET Route
app.get("/register", function (req, res) {
    res.render("register.ejs");
});

//Registration POST Route
app.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
        house: req.body.house,
        phone: req.body.phone,
        floor: req.body.floor,
        admin: false,
        notification: false,
        amount: 0,
        paid: 0,
    });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            //alert("Error, Try Agin Later");
            return res.render("/register");
        }
        console.log(user);
        //console.log(req.user);
        passport.authenticate("local")(req, res, function () {
            //alert("Successful Registration");
            res.redirect("/dashboard");
        });
    });
});

//Login User GET Route
app.get("/loginuser", function (req, res) {
    res.render("loginuser.ejs");
});

//Login Admin Route
app.get("/loginadmin", function (req, res) {
    res.render("loginadmin.ejs");
});

//Login User POST Route
app.post(
    "/loginuser",
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/loginuser",
    }),
    function (req, res) {
        //console.log(req.user);
        console.log(req.body);
    }
);

//Login User POST Route
app.post(
    "/loginadmin",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/loginadmin",
    }),
    function (req, res) {
        //console.log(req.user);
    }
);

//Logout Route
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//Upload Photo GET Route
app.get("/upload", (req,res)=>{
    res.render("uploadPhotos.ejs");
})

//Images Gallery GET Route
app.get("/gallery", isLoggedIn, function (req, res) {
    Gallery.find({}, function (err, images) {
        if (err) {
            console.log(err);
        } else {
            res.render("gallery.ejs", {images: images});
        }
    });
});

app.get("/aboutus", (req,res)=>{
    res.render("aboutus.ejs");
})

//Upload images POST Route
app.post("/upload", upload.single("image"), function (req, res, next) {
    var obj = {
        author: req.user.username,
        img: {
            data: fs.readFileSync(path.join("./public/uploads/" + req.file.filename)),
            contentType: "image/png",
        },
    };
    Gallery.create(obj, function (err, item) {
        if (err) {
            console.log(err);
        } else {
            //console.log(item);
            res.redirect("/gallery");
        }
    });
});


//Import Transactions in this route too
app.get("/usertransaction",isLoggedIn, (req,res)=>{
    console.log(req.user.phone);
    Transactions.find({sender_num:req.user.phone})
        .then(results => {
            let total = 0;
            results.forEach(function(result)  {
                if(result.society_in){
                    total-=parseInt(result.amount);
                }
                else{
                    total+=parseInt(result.amount);
                }
            });
            res.render("paymentmade.ejs", {payments: results, total:total})
        })
    // Transactions.findOne({receiver_num:req.user.phone}, (err,payments)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         var total=0;
    //         console.log(payments);
    //
    //         res.render("paymentmade.ejs", {payments: payments, total:total});
    //     }
    //
    // });
});

app.get("/societytransaction",isLoggedIn,(req,res)=>{
    Transactions.find({}, (err,payments)=>{

        var total=0;
        payments.forEach(function(item){
            if(item.society_in){
                total+=parseInt(item.amount);
            }
            else{
                total-=parseInt(item.amount);
            }
        });

        res.render("paymentmade.ejs", {payments: payments, total:total});
    });
});


//========================
//Middleware
//==========================
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/loginuser");
}

//===============================
//Listening Port
app.listen(3000, function () {
    console.log("server connected to port 3000");
});

