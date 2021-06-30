const express = require('express');
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const Notification = require('../modules/Notification');
const User = require("../modules/user");

router.get('/', AuthMiddleware, (req, res) => {
    res.render("dashboard.ejs", {user: req.user});
});

router.get('/userInfo', AuthMiddleware, (req,res)=>{
    Notification.find({user_id: req.user._id}).sort({date:-1})
        .then(result => {
            console.log(result);
            Notification.find({sender_id: req.user._id}).sort({date:-1})
                .then(sent => {
                    res.render("profile.ejs", {user: req.user, feed: result, sent:sent })
                })

        })

})
router.get('/complaints', AuthMiddleware, (req,res) => {
    Notification.find({house_no: req.user.house, isComplaint:true})
        .then(result => {
            res.render("complaints.ejs",{complaints:result});
        })

});

// @route   GET /dashboard/societyComplaint
router.get('/societyComplaint', AuthMiddleware, (req, res) => {
    res.render("societyComplaint.ejs");
});


// @route   GET dashboard/adminComplaints
router.get('/adminComplaints', AuthMiddleware, (req, res) => {
    res.render("adminComplaint.ejs");
});

// @route   GET dashboard for the user
router.get('/getNotification', AuthMiddleware, (req, res) => {
    Notification.find({house_no: req.user.house}).sort({date: -1})
        .then(notification => {
            res.render("notification.ejs", {notification: notification})
            // res.json({notification: notification});
        })
});

router.get('/getSuggestion', AuthMiddleware, (req,res) => {
    res.render("Suggestions.ejs");
})

router.get('/sendUser', AuthMiddleware, (req, res) => {
    User.find({house: req.user.house})
        .then(user => {
            res.render("sendUser.ejs", {user : user});
        })
})

router.get("/getPaymentNotification", AuthMiddleware, (req, res) => {
    console.log(req.user.admin);
    if(req.user.admin) {
        User.find({house: req.user.house})
            .then(user => {
                res.render("paymentNotification.ejs", {user: user});
            })
    }
    else {
        res.status(400).json({msg: "You are not a admin"})
    }
})

module.exports = router;
