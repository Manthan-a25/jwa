const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
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
    notificationType: {
        type: String,
        required: true
    },
    amount: {
        type: Number
    },
    feed_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feed"
    },
    house_no: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    votes: {
        type: Number,
        default: 0,
        required: true
    },
    votes_id:{
        items: [
            {
                itemId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            }
        ]
    }

});

NotificationSchema.methods.addVotes = function(votes) {
    const updatedVotes = [...this.votes_id.items];
    updatedVotes.push({
        itemId: votes._id
    });
    this.votes_id = {
        items: updatedVotes
    };
    return this.save();
}

NotificationSchema.methods.removeVotes= function(votes){
    this.votes_id.items = this.votes_id.items.filter(item => {
        return item.itemId.toString() !== votes._id.toString();
    });
    return this.save();
}


module.exports = mongoose.model("Notification", NotificationSchema);

