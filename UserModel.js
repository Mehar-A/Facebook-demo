const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
	//Names will be strings between 1-30 characters
	//Must consist of only A-Z characters
	//Will be trimmed automatically (i.e., outer spacing removed)
	username: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 30,
		match: /[A-Za-z]+/,
		trim: true
	},
	password: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 30,
		match: /[A-Za-z]+/,
		trim: true
	},
	privacy: {
		type: Boolean,
		required: true
	}
	,
	mycards:{
		type: String
		
	}
	,
	friendlist:{
		type:String
		
	},
	UC:{
		type:String
		
	},
	FC:{
		type:String
		
	}
	
	
	
});

module.exports = mongoose.model("User", userSchema);
