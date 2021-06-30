const express = require('express');
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const {initPayment, responsePayment} = require("../paytm/services/index");
const Transaction = require('../modules/Transaction');
const User = require("../modules/user");

router.get("/expense", (req,res)=>{
    if(req.user.admin){
        res.render("expense.ejs");
    }
    else{
        res.send("Not Authorised to make Payments, ask Admin...");
    }
});

router.post("/expense", (req,res)=>{
    var obj={
        amount: req.body.amount,
        receiver: req.body.receiver,
        sender: "Society/Admin",
        receiver_num: req.body.receiver_num,
        sender_num: req.user.phone,
        details: req.body.desc,
        mode: "Online",
        society_in: false,
        date: new Date()
    }
    console.log(obj);
    Transaction.create(obj, (err,val)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/dashboard");
        }
    })
})

router.get("/middle", (req,res)=>{
    res.render("transaction.ejs");
});

var amount;
var desc;
var option;
router.post("/middle",(req,res)=>{
    amount=req.body.amount;
    desc=req.body.desc;
    if(req.body.option=="rent"){
        option=true;
    }
    else{
        option=false;
    }
    res.redirect("/payWithPaytm");
})

router.get("/", (req, res) => {
    initPayment(amount).then(
        success => {
            res.render("paytmRedirect.ejs", {
                resultData: success,
                paytmFinalUrl: 'https://securegw-stage.paytm.in/theia/processTransaction'
            });
        },
        error => {
            res.send(error);
        }
    );
});


router.post("/response", (req, res) => {
    responsePayment(req.body).then(
        success => {
            var responseData = success;
            if(option){
                console.log(req.user);
                User.findById(req.user._id)
                    .then(user => {
                        const Amount = req.user.amount;
                        const Paid = req.user.paid;
                        user.updateOne({amount: Amount-parseInt(amount)})
                            .then(result => {
                                console.log(result)
                            }).catch(err => console.log(err));

                        user.updateOne({paid: Paid+parseInt(amount)})
                            .then(result => {
                                console.log(result)
                            }).catch(err => console.log(err));

                    }).catch(err => console.log(err));
            }
            var obj={
                amount: amount,
                receiver: "Society/Admin",
                sender: req.user.username,
                receiver_num: 777677776,
                sender_num: req.user.phone,
                details: desc,
                mode: "Online",
                society_in: true,
                date: new Date()
            }
            //ignore if already imported transaction module
            Transaction.create(obj,(err,val)=>{
                if(err){
                    console.log(err);
                }
            });
            res.render("response.ejs", {resultData: "true", responseData: success});
        },
        error => {
            console.log("There was an error");
            console.log(error)
            res.send(error);
        }
    );
});


module.exports = router;

