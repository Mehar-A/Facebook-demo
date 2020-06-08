//global variables
let items = [];
let t;
let count =  false;

// add users typebox result
function users(){
	t = document.getElementById("myInput").value;
	document.getElementById("info4").innerHTML = t;

}

//polling, but not sure
function init(){
	setInterval(function(){
		
		let req = new XMLHttpRequest();
		req.onreadystatechange = function() {
			if(this.readyState==4 && this.status==200){
			}	
		}
		req.open("GET",window.location.href, true);
		req.send();
	}, 3000);
	
}

//sending the information of typebox into server
function usersprint(){
	items.push({name: t});
	
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
		}
	}
	
	req.open("POST", "/friendrequest", true);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify({data:t}));
	//console.log("count");
	
	// making sure information exists in the database to send a friend request
	let req1 = new XMLHttpRequest();
	req1.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
		rest = JSON.parse(req1.responseText);
		count = rest;
		//console.log(rest);
			if (count==true){
				document.getElementById("info4").innerHTML = "FRIEND REQUEST SEND";
				//document.getElementById("info5").innerHTML = t.length;			
			}
		//console.log(rest);
		}
	}
	req1.open("GET", "/info", true);
	req1.setRequestHeader("Content-Type", "application/json");
	req1.send();
	
	
}


//friends trading card get printed once read from database
function run(){
	let req1 = new XMLHttpRequest();
	req1.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
		rest = JSON.parse(req1.responseText);
		console.log(rest);
		//console.log(rest[0].artist);
			
		document.getElementById("info6").innerHTML = "";
			for(let i=0;i<rest.length;i++){
				
				let k = document.createElement("li");
				let input = document.createElement("input");
				input.type="checkbox";
				input.id=rest[i]["card"]._id;
				input.value=rest[i]["card"].artist;
				input.className="checks2";
				k.innerText = rest[i]["card"].artist;
				document.getElementById("info6").appendChild(input);
				document.getElementById("info6").appendChild(k);
				
			}
		}
	}
	req1.open("GET", "/tradecards?pass="+document.getElementById("tc").value, true);
	req1.setRequestHeader("Content-Type", "application/json");
	req1.send();
}

// trading cards between user and his friend
function trade(){
	//variables
	let o = document.getElementsByClassName("checks");
	let a = document.getElementsByClassName("checks2");
	let p =[];
	let q =[];

		
	
	for(let i=0;i<o.length;i++){
		if(o[i].checked == true){
			p.push({usercards:o[i].value})
			
		}
	}
	
	
	for(let i=0;i<a.length;i++){
		if(a[i].checked == true){
			q.push({friendscards:a[i].value})
		}
	}
	
	if(p.length!=0 && q.length !=0){
		let req = new XMLHttpRequest();
		req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
		}
		}
	
		req.open("POST", "/collectingcards", true);
		req.setRequestHeader("Content-Type", "application/json");
		req.send(JSON.stringify({p,q}));
	}else{
		
		document.getElementById("errorcheck").innerHTML = "Make sure Show button is pressed or select trading friends cards";
		
	}
	
	//console.log(p);	
}