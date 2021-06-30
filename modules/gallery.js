var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
	author: String,
	img: {
		data: Buffer,
		contentType: String
	}
});

module.exports = mongoose.model("Gallery",imageSchema);

