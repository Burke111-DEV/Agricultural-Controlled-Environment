	// Configuration object stores key:value pairs that are used to correctly initialize the connection to the firebase
	// database. This object is passed into the initializeApp() function call so that the web instance can be authorised
	// to access the database contents.
	var firebaseConfig = {
	apiKey: "AIzaSyCc8i66UjeEU4s5AGgk03Qn1xCL4GXET9g",
	authDomain: "one1-a91f2.firebaseapp.com",
	databaseURL: "https://one1-a91f2.firebaseio.com",
	projectId: "one1-a91f2",
	storageBucket: "one1-a91f2.appspot.com",
	messagingSenderId: "216223825145",
	appId: "1:216223825145:web:e67c85b87048fe4164b628"
	};

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	
	var enabled = false;
	var range = 0.1;
	var routine;
	
	
	var obj = {
		
		light: 0,
		temperature: 0,
		co2: 0,
		humidity: 0,
		moisture: 0,
		ts: ""
	}
	var l=20, t=24, c=9, h=2, m=4;


	
	var light = document.getElementById("lightval"),
		temp = document.getElementById("tempval"),
		co2 = document.getElementById("co2val"),
		moisture  = document.getElementById("moistureval"),
		humidity = document.getElementById("humidityval");
		//ts = {document.getElementById("ts1"), document.getElementById("ts2"), document.getElementById("ts3"), document.getElementById("ts5"), document.getElementById("ts4")};
	

/*
	Get the reference
	Create a reference to an object within the direbase realtime database. The firebase instance's database is called
	and a reference to a child of that document called 'object' is searched for.
*/
	var objReference = firebase.database().ref();
	
/*

	Sync the object changes
	When a 'value' changes (JSON key:value pair value), a function with one parameter(snap) is run. This function
	will log the contents of snap to the console. The third parameter of the .of() function call runs if there is an error.
	This will log the error code to the console.
*/
	
	objReference.on('child_added', function(snapshot) {
	  light.innerHTML = snapshot.val().light + "%";
	  temp.innerHTML = snapshot.val().temperature + "%";
	  co2.innerHTML = snapshot.val().co2 + "%";
	  moisture.innerHTML = snapshot.val().moisture + "%";
	  humidity.innerHTML = snapshot.val().humidity + "%";  
	  for(j = 1; j<=5; j++) document.getElementById("ts" + j).innerHTML = snapshot.val().ts;  
	 
	  console.log(snapshot.val()); 	  
	  
	}, function (errorObject) {console.log("The read failed: " + errorObject.code);});
	
	
	function beginClick() {
		enabled = !enabled;
		console.log(enabled);
		if(enabled) routine = setInterval(run, 1500);
		else clearInterval(routine);
	}
	
	
	function run() {
		l = randomise(l); t = randomise(t); c = randomise(c); h = randomise(h); m = randomise(m);
		obj = {
			light: l,
			temperature: t,
			co2: c,
			humidity: h,
			moisture: m,
			ts: dateToday()
		};
		
		objReference.push(obj);
	}

	function randomise(i) {
		var ret;
		if (i < 10) i+=3;
		if(i < 15) ret = Math.ceil(i * ((Math.random()*range) + (1.02 - (range/2))));
		else ret = Math.round(i * ((Math.random()*range) + (1 - (range/2))));
		if (ret > 99) ret = 100;
		return ret;
	}
	
	function dateToday() {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getYear();

		today = mm + '/' + dd + '/' + yyyy + " " + today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
		return today;
	}



	
	
	
	

	