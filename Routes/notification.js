const express = require('express');
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const Notification = require('../modules/Notification');
const User = require('../modules/user');
const Feed = require('../modules/Feed');

// @route   GET notification/test
// @desc    For testing the route
// @Notes   to be removed later
router.get('/test', AuthMiddleware, (req, res) => {
    User.findById(req.user._id)
        .populate(['userNotification', 'sentNotification'])
        .then(user => {
            res.status(200).json({msg: "Working", user: user})
        })

});

// @route   POST notification/sendComplaintAdmin
// @desc    For sending notification and creating event for Single User
// @Notes   send title, body, receiver to the route and add redirect url
router.post('/sendComplaintAdmin', AuthMiddleware, (req, res) => {
    const title = req.body.title;
    const body = req.body.body;
    User.find({house: req.user.house, admin: true})
        .then(users => {
            if (users) {
                users.forEach(user => {
                    const newNotification = new Notification({
                        title: title,
                        body: body,
                        date: new Date(),
                        notificationType: "Complaint",
                        user_id: user._id,
                        sender_id: req.user._id
                    });
                    newNotification.save();
                    user.addNotification(newNotification);
                    User.findById(req.user._id)
                        .then(user => {
                            user.addSentNotification(newNotification);
                        }).catch(err => console.log(err));
                    console.log(user);

                });
                console.log({msg: "success"});
                res.redirect('/dashboard');
            } else {
                res.json({msg: "No Admin Found"})
            }
        })
        .catch(err => console.log(err))

});

// @route  POST notification/sendMsg
// @desc   Sends Message to a User
// Todo:   if possible add the floor functionality for better filter
router.post('/sendMsg', AuthMiddleware, (req, res) => {
    console.log(req.body)
    const recipient = req.body.recipient.toString().split(',')[0];
    const floor = req.body.recipient.toString().split(',')[1];
    const title = req.body.title;
    const body = req.body.body;

    User.findOne({phone: parseInt(recipient)})
        .then(user => {
            if (user) {
                const newNotification = new Notification({
                    title: title,
                    body: body,
                    date: new Date(),
                    notificationType: "Message",
                    user_id: user._id,
                    sender_id: req.user._id
                });
                newNotification.save();
                user.addNotification(newNotification);
                User.findById(req.user._id)
                    .then(user => {
                        user.addSentNotification(newNotification);
                    }).catch(err => console.log(err));
                console.log(user);
                console.log({msg: "success"});
                res.redirect('/dashboard');
            } else {
                res.json({msg: "No User Found"});
            }
        }).catch(err => console.log(err));

});

// @route   POST notification/sendPayment
// @desc    Send payment notification
router.post('/sendPayment', AuthMiddleware, (req, res) => {
    const recipient = parseInt(req.body.recipient.toString().split(',')[0]);
    const amount = parseInt(req.body.amount);
    const title = req.body.title;
    const body = req.body.body;

    User.findOne({phone: recipient})
        .then(user => {
            if (user) {
                const newNotification = new Notification({
                    title: title,
                    body: body,
                    date: new Date(),
                    notificationType: "Payment",
                    amount: amount,
                    user_id: user._id,
                    sender_id: req.user._id
                });
                const Amount = req.user.amount;
                newNotification.save();
                user.addNotification(newNotification);
                user.updateOne({amount: Amount + parseInt(amount)})
                    .then(result => {
                        console.log(result)
                    }).catch(err => console.log(err));
                User.findById(req.user._id)
                    .then(user => {
                        user.addSentNotification(newNotification);
                    }).catch(err => console.log(err));
                console.log(user);
                console.log({msg: "successfully added payment notification"});
                res.redirect('/dashboard');
            } else {
                res.json({msg: "No User Found"});
            }
        })
})

// @route  POST notification/sendComplaintHouse
// @desc   Sends Complaint to a Society
router.post('/sendComplaintHouse', AuthMiddleware, (req, res) => {
    const title = req.body.title;
    const body = req.body.body;
    const newNotification = new Notification({
        title: title,
        body: body,
        date: new Date(),
        notificationType: "Complaint",
        house_no: req.user.house,
        sender_id: req.user._id,
        votes: 0
    });
    newNotification.save();
    console.log({message: "success"});
    res.redirect('/dashboard');
});


// @route  POST notification/sendSuggestion
// @desc   Sends Suggestions to a Society
router.post('/sendSuggestion', AuthMiddleware, (req, res) => {
    const title = req.body.title;
    const body = req.body.body;
    const newNotification = new Notification({
        title: title,
        body: body,
        date: new Date(),
        notificationType: "Suggestion",
        house_no: req.user.house,
        sender_id: req.user._id,
        votes: 0
    });
    newNotification.save();
    console.log({message: "success"});
    res.redirect('/dashboard');

});

// @route   GET notification/deleteNotification
// @desc    Delete Notification
router.get('/deleteNotification', AuthMiddleware, (req, res) => {
    const ID = req.query.id;
    console.log(ID);
    Notification.deleteOne({_id: ID})
        .then(result => {
            console.log("deleted");
            User.findById(req.user._id)
                .then(user => {
                    user.removeFromUser(ID);
                    res.redirect('/');
                }).catch(err => console.log(err))
        }).catch(err => console.log(err))
});

// @route   GET notification/getFeed
// @desc    Get all the feeds of a user
router.get('/getFeed', AuthMiddleware, (req, res) => {
    Feed.find({house_no: req.user.house}).sort({date: -1})
        .then(feed => {
            res.json({feed: feed});
        })
});

/// @route   GET notification/upVote
// @desc     Increases the votes of a notification
router.get("/upVote", AuthMiddleware, (req, res) => {
    const id = req.query.id;
    Notification.findById(id)
        .then(notification => {
            if (notification.votes_id.items.some(Votes => Votes.itemId.toString() === req.user._id.toString())) {
                console.log("deleted");
                const votes = notification.votes;
                if (votes > 0) {
                    notification.removeVotes(req.user._id);
                    notification.updateOne({votes: votes - 1})
                        .then(result => {
                            console.log(result);
                            res.redirect('/dashboard/getNotification');
                        }).catch(err => console.log(err));
                }
            } else {
                notification.addVotes(req.user._id);
                const votes = notification.votes;
                notification.updateOne({votes: votes + 1})
                    .then(result => {
                        console.log(result);
                        res.redirect('/dashboard/getNotification');
                    }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
});


// @route   GET notification/downVote
// @desc    Get all the feeds of a user
router.get("/downVote", AuthMiddleware, (req, res) => {
    const id = req.query.id;
    console.log(id);
    Notification.findById(id)
        .then(notification => {
            if (notification.votes_id.items.some(Votes => Votes.itemId.toString() === req.user._id.toString())) {
                notification.removeVotes(req.user._id);
                console.log("deleted");
                const votes = notification.votes;
                notification.updateOne({votes: votes - 1})
                    .then(result => {
                        console.log(result);
                        res.redirect('/dashboard/getNotification');
                    }).catch(err => console.log(err));
            } else {
                console.log("came here");
                const votes = notification.votes;
                if (votes > 0) {
                    notification.addVotes(req.user._id);
                    notification.updateOne({votes: votes + 1})
                        .then(result => {
                            console.log(result);
                            res.redirect('/dashboard/getNotification');
                        }).catch(err => console.log(err));
                }
            }
        }).catch(err => console.log(err));
});


module.exports = router;

