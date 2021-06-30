var mongoose = require("mongoose");

var TransactionSchema = new mongoose.Schema({
    amount: String,
    receiver: String,
    sender: String,
    receiver_num: Number,
    sender_num: Number,
    details: String,
    mode: String,
    society_in: Boolean,
    date: Date
})

module.exports = mongoose.model("Transaction",TransactionSchema);