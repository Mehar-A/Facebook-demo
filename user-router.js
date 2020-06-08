// be careful this is profs code, using it for my database and webpage access

const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const User = require("./UserModel");
const express = require('express');
let router = express.Router();


router.get("/", queryParser);
router.get("/", loadUsers);
router.get("/", respondUsers);
router.get("/:uid", sendSingleUser);
//router.get("/:cid", usercards);

//Load a user based on uid parameter
router.param("uid", function(req, res, next, value){
	let oid;
	//console.log("Finding user by ID: " + value);
	try{
		oid = new ObjectId(value);
	}catch(err){
		res.status(404).send("User ID " + value + " does not exist.");
		return;
	}

	User.findById(value, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}

		if(!result){
			res.status(404).send("User ID " + value + " does not exist.");
			return;
		}

		//console.log("Result:");
		//console.log(result);
		req.user = result;
		if(req.session.loggedin && req.session.username === req.user.username){
			req.user.ownprofile = true;
		}

		next();


	});
});



/*
router.param("cid", function(req, res, next, value){
	let oid;
	//console.log("Finding user by ID: " + value);
	try{
		oid = new ObjectId(value);
	}catch(err){
		res.status(404).send("User ID " + value + " does not exist.");
		return;
	}

	User.findById(value, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}

		if(!result){
			res.status(404).send("User ID " + value + " does not exist.");
			return;
		}

		//console.log("Result:");
		//console.log(result);
		req.user = result;
		if(req.session.loggedin && req.session.username === req.user.username){
			req.user.ownprofile = true;
		}

		next();


	});
});
*/



//Parse the query parameters
//limit: integer specifying maximum number of results to send back
//page: the page of results to send back (start is (page-1)*limit)
//name: string to find in user names to be considered a match
function queryParser(req, res, next){
	const MAX_USERS = 50;

	//build a query string to use for pagination later
	let params = [];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");

	try{
		req.query.limit = req.query.limit || 10;
		req.query.limit = Number(req.query.limit);
		if(req.query.limit > MAX_USERS){
			req.query.limit = MAX_USERS;
		}
	}catch(err) {
		req.query.limit = 10;
	}

	try{
		req.query.page = req.query.page || 1;
		req.query.page = Number(req.query.page);
		if(req.query.page < 1){
			req.query.page = 1;
		}
	}catch(err){
		req.query.page = 1;
	}

	if(!req.query.name){
		req.query.name = "?";
	}

	next();
}

//Loads the correct set of users based on the query parameters
//Adds a users property to the response object
//This property is used later to send the response
function loadUsers(req, res, next){
	let startIndex = ((req.query.page-1) * req.query.limit);
	let amount = req.query.limit;

	User.find()
	.where("username").regex(new RegExp(".*" + req.query.name + ".*", "i"))
	.limit(amount)
	.skip(startIndex)
	.exec(function(err, results){
		if(err){
			res.status(500).send("Error reading users.");
			console.log(err);
			return;
		}
		res.users = results;
		next();
		return;
	});
}

//Users the res.users property to send a response
//Sends either HTML or JSON, depending on Accepts header
function respondUsers(req, res, next){
	res.format({
		"text/html": () => {res.render("public/denied", {users: res.users, qstring: req.qstring, current: req.query.page, loggedin: req.session.loggedin, username: req.session.username, id: req.session._id } )},
		"application/json": () => {res.status(200).json(res.users)}
	});
	next();
}

// This is allowing the profile page open up once a user has register into database
function sendSingleUser(req, res, next){
	//console.log(req.user);
	let t = req.session.UC;
	//console.log(req.session.UC);
	//console.log(t['usercards'])
	if(!req.user.privacy || req.user.ownprofile) {
		mongoose.connection.db.collection("users").findOne({_id:ObjectId(req.params.uid)}, function(err, result){
			if(err)throw err;
			//console.log(result);
			res.format({
				"application/json": function(){
					res.status(200).json(req.user);
				},
				"text/html": () => { res.render("pages/userprofile", {user: result, loggedin: req.session.loggedin, id: req.session._id, FR:req.session.Reqfriendlist, FL:req.session.friendlist, ucards:req.session.UC, fcards:req.session.FC}); }
				
			});
		});
	}
		
	else {
		res.status(404).send("Unknown ID.");
	}
}

module.exports = router;
