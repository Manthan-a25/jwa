const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema({
    ///NAME OF CATEGORY
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    isComplaint: {
        type: Boolean,
        required: true
    },
    img: {
        data: Buffer,
        contentType: String
    },
    house_no: {
        type: String,
        required: true,
    }
});


module.exports = mongoose.model("Feed", FeedSchema);

