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

	// Get the reference - Create a reference to an object within the direbase realtime database.
	var objReference = firebase.database().ref();
	
	objReference.on('child_added', function(snapshot) {
		console.log(snapshot.val()); 	
		objReference.remove();	  
	}, function (errorObject) {console.log("The read failed: " + errorObject.code);});

	function goBack() {
		window.history.back();
	}


	
	
	
	

	