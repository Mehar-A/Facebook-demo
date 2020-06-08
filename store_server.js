// seeting up the constants 
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const mongo = require('mongodb');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());


const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);

const User = require("./UserModel");

// conneting to database, and making new collection calledd sessions 
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/tokens',
  collection: 'sessions'
});
app.use(session({ secret: 'some secret here', store: store }))

// using pug as engine 
app.set("view engine", "pug");
app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.use(express.static("public"));
// using router for the users pages only once logged in
let userRouter = require("./user-router");
app.use("/users", userRouter);

//only home page once register or login for users profile
app.get('/', function(req, res) {
	res.render('pages/index', {loggedin: req.session.loggedin, username: req.session.username, id: req.session._id});
});



app.use(function(req, res, next){
    //console.log(req.method + " -> " + req.url);
    next();
});

let count = false;
//console.log(app.post('/friendrequest'));
let mainusername;
let RF;
let counter = 0;
let FL;

//friend request function to sending friend request into other user page
app.post('/friendrequest', express.json(), function(req, res){
	let jsonObj = null;
  	let myusers = [];
	//console.log(req.body)
	
	let user = req.body.data;
	//console.log(friendlist);
	//console.log(user);
	//checking the results
	db.collection("users").find().toArray(function(err, result) {
			if (err) throw err;
			jsonObj = result;
			//console.log(jsonObj);
			//console.log(jsonObj.length);
		
		//making a new loop to check valid values
			for(var i =0;i<jsonObj.length;i++){
				myusers.push({ 
				"users": jsonObj[i].username,
				"pending":jsonObj[i].Reqfriendlist,
				"list":jsonObj[i].friendlist
				});
			}
			
			
			JSON.stringify(myusers);
			//console.log(myusers.length);
			//console.log(myusers);
			//console.log(req.session.username);
			FL = mainusername;
			
			//checking valid name enter for typebox
			for(var i=0;i<myusers.length;i++){
				if(myusers[i].users == user && myusers[i].users != req.session.username){
					
					count = true;
					RF= user;
					counter=1;
					break;
				}else{
					count = false;
				}
			}
			//console.log(req.session.username);
			//console.log(count);
			//console.log(Reqfriendlist);
			//console.log(myusers2);
			// adding the new names into database as pending friend request
			if((req.session.Reqfriendlist!=user && req.session.Reqfriendlist==null)){
				db.collection('users').updateOne( {username:user}, {$push: {Reqfriendlist:mainusername}}, function(err, result)
				{
					req.session.Reqfriendlist = mainusername;
					//console.log(req.session.Reqfriendlist);
					//if(err)throw err;	
				});
				
			}else{
				count = false;
			}
		});
	


	
});

// sending the infromation back for valid username exist in database or not
app.get('/info', express.json(), function(req, res){
		res.status(200).send(count);
});
let newfriendlist;


//adding friend request button to add friends for both users
app.post("/accept", function(req, res, next){
	
	//console.log(mainusername);
	console.log(RF);
	console.log(req.session.username);
	console.log(mainusername);
	//newfriendlist = FL;
	
	db.collection('users').updateOne( {username:FL}, {$push: {friendlist:req.session.username}}, function(err, result)
		{
			req.session.friendlist = FL;
			db.collection('users').updateOne( {username:req.session.username}, {$push: {friendlist: FL}}, function(err, result)
			{
				req.session.friendlist = mainusername;
				db.collection('users').updateOne({username:req.session.username}, {$unset: {Reqfriendlist:FL}}, function(err, result)
				{
				});
			});
			
		});	
	
	
});


//deleteing friend request button to delete full request
app.post("/reject", function(req, res, next){
	db.collection('users').updateOne({username:req.session.username}, {$unset: {Reqfriendlist:FL}}, function(err, result)
		{
			//if(err)throw err;	
		});
});


let u;
//loading friends card infromation from database and sending it client for printing
app.get("/tradecards", function(req, res, next){
	//console.log("trade");
	let t= req.query.pass;
	newfriendlist = req.session.username;
	//console.log(t);
	let jsonObj = null;
  	let myusers = [];
	u=t;
	
	mongoose.connection.db.collection("users").findOne({username: t}, function(err, result){
		if(err)throw err;
		let q = result.mycards;
		res.status(200).send(q);
		
	});
	
});


let card;
//collecting card information from database, that has been request from client side and adding into database of send user 
app.post("/collectingcards", function(req, res, next){
	card = req.body;
	//console.log(card.p[0].usercards);
	//console.log(newfriendlist);
	//console.log(card.q[0].friendscards)
	//FC:card.q[i].friendscards
	//console.log(t);
	//console.log(req.session.username);
	//console.log(newfriendlist);
	//console.log(u);
	let w=[];
	for(let i =0;i<card.p.length;i++){
		w.push({ 
			"userscards": card.p[i].usercards,
			"user": newfriendlist
		});
			
	}
	for(let i =0;i<card.q.length;i++){
		w.push({ 
			"friendscards": card.q[i].friendscards,
			"friendname": u
		});
	
	}
	
	//console.log(w);
	// updating the database with new attriube in collection of users with certain username
	db.collection('users').updateOne( {username:u}, {$push: {UC:w}}, function(err, result)
		{
			req.session.UC = w;
			
		});	
	
	
	/*
	
		db.collection('users').updateOne( {username:newfriendlist}, {$push: {FC:card.q[i].friendscards}}, function(err, result)
		{
			req.session.FC = card.q[i].friendscards;
		});	
	*/
	w=[];
	
});

//deleting the trade that was proposed by this friend
app.post("/rejecttrade", function(req, res, next){
	//console.log("deletetrade");
	console.log(mainusername);
	mongoose.connection.db.collection("users").findOne({username:mainusername},function(err, result){
		db.collection('users').updateOne({username:result.username}, {$unset:{UC:result.UC}}, function(err, result)
		{
		});
	});	
});



//A new users has been created, and inputted into the database for future
app.post("/register", function(req, res, next){
  let username = req.body.username;
  let password = req.body.password;
  let jsonObj = null;
  let mycards = [];
  
  
  db.collection("users").findOne({username: username}, function(err, result){
    if(err) throw err;

   // console.log(result);
	// cannot have same user name when registering 
    if(result) {
      res.render("pages/denied");
      return;
    }
    else{
	//load cards
	
		var obju = mongoose.connection.db.collection("cards");
		obju.find({}).toArray(function(err, result) {
			if (err) throw err;
			jsonObj = result;
			
		
		
		for(var i =0;i<10;i++){
			var random = Math.floor(Math.random() * jsonObj.length);
			mycards.push({ 
				"card": jsonObj[random]
			});
		}
		let u = new User();
		u.username = username;
		u.password = password;
		u.privacy = false;
		u.mycards = JSON.stringify(mycards);
		//console.log(u.mycards);
		db.collection("users").insertOne(u, function(err, result){
			if(err) throw err;
			res.redirect("/users/" + u._id);
		});
		req.session.username = username;
		req.session.loggedin = true;
		req.session.mycards = mycards;
		});
		

      
    }
  });
});


//checking the login credential and logged into pug file
app.post("/login", function(req, res, next){
	
	if(req.session.loggedin){
    //console.log("logged in already");
		res.redirect("/");
		return;
	}

	let username = req.body.username;
	let password = req.body.password;
	mainusername = username;

	mongoose.connection.db.collection("users").findOne({username: username}, function(err, result){
		if(err)throw err;

		//console.log(result);
    if(result){
			if(result.password === password){
				req.session.loggedin = true;
				req.session.username = username;
        //req.session.password = password;
        req.session._id = result._id;
        //req.session.privacy = result.privacy;
		//console.log(result.Reqfriendlist);
		//req.session.mycards = result.mycards;
		req.session.Reqfriendlist = result.Reqfriendlist;
		req.session.friendlist = result.friendlist;
		req.session.UC = result.UC;
		req.session.FC = result.FC;
		//console.log(req.session.UC);
		//console.log(req.session.friendlist);
		//console.log(result.friendlist);
        res.redirect("/users/" + result._id);
		
			}else{
				res.status(401).send("Not authorized. Invalid password.");
			}
		}else{
			res.status(401).send("Not authorized. Invalid username.");
			return;
		}
	});
});

// accept friends trading cards propsal, almost done but not quiet ran out of time?
app.post("/accepttrade", function(req, res, next){
	//console.log("accepttrade");
	//console.log(newfriendlist);
	let t;
	console.log(mainusername);
	let h =[];
	//console.log(c);
	mongoose.connection.db.collection("users").findOne({username:mainusername},function(err, result){
		if(err)throw err;
		console.log(result.username);
		/*
		for(value in result.UC){
			for(v in value){
				//console.log(result.UC[value][v].userscards);
				t=result.UC[value][v].userscards;
			}
		}
		let a =JSON.parse(result.mycards);
		console.log(t);
		console.log(a);
		console.log("after");
		for(let i = 0; i<a.length; i++){ 
			if(a[i].artist=t){
				console.log("found");
			}
		}
		/*
		for(let i = 0; i<result.mycards.length; i++){ 
      		if (result.mycards.cards._id == ) {
				result.mycards.splice(i, 1);
				return;
     		}
		}
		db.collection('users').updateOne({username:result.username}, {$pull: {mycards:t}}, function(err, result)
		{
			console.log(result);
			//if(err)throw err;	
		});
		*/
		
	});
	
});


//Logs out a user
app.get("/logout", function(req, res, next){
	req.session.loggedin = false;
	res.redirect("/");
});


//loading card infromation based on users prefernce
app.get("/card/:id", function(req, res, next){
	
	let i = req.params.id;
	//console.log(i);
	mongoose.connection.db.collection("cards").find({_id: mongo.ObjectId(i)}).toArray(function(err, result){
		if(err)throw err;

		//console.log(result);
    	if(result){
			//console.log(result[0]["_id"]);
			res.format({
			"text/html": () => { res.render("pages/usercards", {CI:result[0]}); }
			});
			
		}
	});
	
});

//loading friends infromation and there card information
app.get("/FI/:id", function(req, res, next){
	//console.log("inside friendlist cards");
	console.log(req.params.id);
	let i = req.params.id;
	
	mongoose.connection.db.collection("users").find({username:i}).toArray(function(err, result){
		if(err)throw err;

		//console.log(result);
    	if(result){
			//console.log(result[0]["_id"]);
			res.format({
			"text/html": () => { res.render("pages/friendsinfromation", {CI:result[0]}); }
			});
		
		}
	});
	

});

//Sets the privacy of a user's profile
app.post("/privateToggle", function(req, res, next){
  if(req.session.loggedin){
    if(req.body.privacy === 'off') {
      req.session.privacy = false;

      let u = {
        username: req.session.username,
        password: req.session.password,
        privacy: false
      };

      db.collection("users").updateOne({"_id": req.session._id}, {$set: u}, function(err, result) {
        if(err) throw err;
        req.session._id = result._id;
      });
    }
    else {
      req.session.privacy = true;

      let u = {
        username: req.session.username,
        password: req.session.password,
        privacy: true
      }

      db.collection("users").updateOne({"_id": req.session._id}, {$set: u}, function(err, result) {
        if(err) throw err;
        req.session._id = result._id;
      });
    }
  }
  res.redirect("/users/" + req.session._id);
});
//connecting to database
mongoose.connect('mongodb://localhost/a5', {useNewUrlParser: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	mongoose.connection.db.collection("config").replaceOne({id:"mainpage"}, {id:"mainpage"}, {upsert:true}, function(err, result){
		if(err){
			console.log("Error adding main page config.");
			return;
		}
		app.listen(3000);
		console.log("Server listening on port 3000");
	});
});