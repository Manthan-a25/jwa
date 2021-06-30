var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	usernmae: String,
	house: String,
	phone: Number,
	floor: Number,
	admin: Boolean,
	notfication: Boolean,
	amount: Number,
	paid: Number,
	password: String,
	userNotification: {
		items: [
			{
				itemId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Notification'
				}
			}
		]
	},
	sentNotification: {
		items: [
			{
				itemId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Notification'
				}
			}
		]
	}
});
UserSchema.methods.addNotification = function(notification){
	const updatedNotification = [...this.userNotification.items];
	updatedNotification.push({
		itemId: notification._id
	});
	this.userNotification = {
		items: updatedNotification
	};
	return this.save();

}
UserSchema.methods.addSentNotification = function(notification){
	const updatedsentNotification = [...this.sentNotification.items];
	updatedsentNotification.push({
		itemId: notification._id
	});
	this.sentNotification = {
		items: updatedsentNotification
	};
	return this.save();

}
UserSchema.methods.removeFromUser = function(itemId){
	this.userNotification.items = this.userNotification.items.filter(item => {
		return item.itemId.toString() !== itemId.toString();
	});
	return this.save();
}
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);


