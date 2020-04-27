//Declaring global variables for indicator knobs and actuator loadbars
var temperatureik, soilmoistureik, humidityik, lightintensityik, co2ik, heatingpadao, waterpumpao, ledsao, fanao;

//Firebase configuration
var firebaseConfig = {
	apiKey: "AIzaSyDARV1SDE7mCmQDRY2r5kAy2siuRJO9mrM",
	authDomain: "acedatabase-55166.firebaseapp.com",
	databaseURL: "https://acedatabase-55166.firebaseio.com",
	projectId: "acedatabase-55166",
	storageBucket: "acedatabase-55166.appspot.com",
	messagingSenderId: "517564166882",
	appId: "1:517564166882:web:77d995adf4b734e3f6e4bb"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var size = $(window).width();

//Creates Firebase reference objects for 3 different datasets 
var objReference1 = firebase.database().ref().child('sensed');
var objReference2 = firebase.database().ref().child('desired');
var objReference3 = firebase.database().ref().child('actuators');

objReference1.on('child_added', function(snap) {
	ts = snap.val().ts;
	sL = snap.val().sL; 
	sT = snap.val().sT;
	sC = (snap.val().sC / 100) *500;
	sM = snap.val().sM;
	sH = snap.val().sH;
	console.log("wow: "+sC);
	
	//Updates indicatorknob slider value once new sensory information reaches the database
	lightintensityik.setValue("loader", sL); 
	temperatureik.setValue("loader", sT);
	co2ik.setValue("loader", sC);
	soilmoistureik.setValue("loader", sM);
	humidityik.setValue("loader", sH);
	
	//Puts sensed values from database into an array and passes it as a parameter into the 'addDataiklg' function for line graphs
	var values = [sT, sM, sH, sL, sC, ts];
	addDataiklg(values);
	
	//Runs function passing current slider values of indicator knobs to the database
	rundesired();
}, function (errorObject) {console.log("The read failed: " + errorObject.code);});

objReference3.on('child_added', function(snap) {
	hvalue = snap.val().heatingpadao;
	wvalue = snap.val().waterpumpao;
	lvalue = snap.val().ledsao;
	fvalue = snap.val().fanao;
	tvalue = snap.val().timestamp;
	
	//Updates the actuator output loadbars using new data passed into the database
	heatingpadao.setValue(hvalue);
	waterpumpao.setValue(wvalue); 
	ledsao.setValue(lvalue);
	fanao.setValue(fvalue);
	
	//Puts actuator values from database into a array and passes it as a parameter into the 'addDataaolg' function for line graphs
	var values = [hvalue, wvalue, lvalue, fvalue, tvalue];
	addDataaolg(values);
}, function (errorObject) {console.log("The read failed: " + errorObject.code);});

//Send current 'desired' values of indicator knobs into object of database
function rundesired() {
	obj = {
		dT: temperatureik.getValue1(),
		dM: soilmoistureik.getValue1(),
		dH: humidityik.getValue1(),
		dL: lightintensityik.getValue1(),
		dC: co2ik.getValue1(),
	};
	objReference2.push(obj);
}


//Generate a random number, and apply that number to the baseline to return a slightly higher or lower number
function randomise(i, changerange, min, max){
	do{
		var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
		i = Math.round(i + plusOrMinus*Math.random()*changerange);
	}while(i>max || i<min);
	return i;
}

 var l=79000, t=23, c=360, h=69, m=90;
// Assigns new modified values to each condition variable, stores them in the object, then sends the object to the database 
function runsensed() {
	l = randomise(l, 5000, 0, 120000); t = randomise(t, 2, 0, 40); c = randomise(c, 30, 0, 500); h = randomise(h, 8, 0, 100); m = randomise(m, 12, 0, 100); ts = new Date();
	obj = {
		sT: t,
		sM: m,
		sH: h,
		sL: l,
		sC: c,
		ts: firebase.database.ServerValue.TIMESTAMP,
	};
	objReference1.push(obj);
}

var hval=75, wval=45, lval=31, fval=61;
//Passes randomized actuator values to database in object
function runactuator() {
	hval = randomise(hval, 3, 0, 100); wval = randomise(wval, 3, 0, 100); lval = randomise(lval, 3, 0, 100); fval = randomise(fval, 3, 0, 100);
	obj = {
		heatingpadao: hval,
		waterpumpao: wval,
		ledsao: lval,
		fanao: fval,
		timestamp: firebase.database.ServerValue.TIMESTAMP,
	};
	objReference3.push(obj);
}

//Runs functions every 5 seconds
//setInterval(runactuator, 5000);
//setInterval(runsensed, 5000);

//Returns and indicator knob element when called
function indicatorknob(width) {
	var widthString = width.toString();
	
	//Set the font size of the indicatorknob according to the width of the element
	var fontSize = 0.13 * width;
	var fontSizeString = fontSize.toString();
	
	//Create canvas for drawing the indicator knob
	var canvas = document.createElement('canvas');
	
	//Create a div element for containing the canvas element
	var div = document.createElement('div');
	div.appendChild(canvas);
	
	//Set the size of the div element to match the canvas size
	div.style.width = widthString + 'px';
	
	//Create text input element and appends it underneath interactive part of indicator knob element
	var textinput = document.createElement('input');
	textinput.placeholder = "Change Desired Value...";
	div.appendChild(textinput);
	
	//Create button element to be used with text input and appends it underneath interactive part of indicator knob element
	var button = document.createElement('button');
	button.innerHTML = "Change";
	div.appendChild(button);
	
	var indicatorknob = {
	    //Gives access to the various elements of the indicatorknob through the object
		'_canvas': canvas,
		'_div': div,
		'_width': width,
		'_fontSize': fontSize,
		//Click status of left mouse button 
		'_clicked' : false,
		
		/*
		 * Contains features of the indicatorknob in an array
		 */
		'_features': {
		    //The end angle of the indicatorknob arc
			'angleEnd': 0.75 * Math.PI,
			//Angle shifting start and end angles to get the actual angles of the indicatorknob arc
			'angleOffset': -0.5 * Math.PI,
			//The starting angle of the indicatorknob arc
			'angleStart': -0.75 * Math.PI,
			//Color of loadbar
			'colorloadbar' : 'lightgrey',
			//Color of loader
			'colorloader': 'Chartreuse',
			//Colors of slider
			'colorslider1' : 'red',
			'colorslider2': 'black',
			//Max and min values of the indicatorknob
			'valMin': 0,
			'valMax': 100,
			//Value of the slider
			'value1': 64,
			//Value	the loader
			'value2': 0,
			//Line width value of the loaderbar, slider and loader
			'barWidth' : 25,
			'units' : "%",
			'fnValueToString': function(value) { return value.toString(); }
		},
		
		'setWidth': function() {
				var ws = (document.getElementById("tempbox").getBoundingClientRect().width - 75).toString();
				div.style.width = "100%";
				div.width = ws + 'px';
		},
		
		'setBarWidth': function() {
				if(size < 1000) this.setFeature('barWidth', 10);
				else this.setFeature('barWidth', 20);
				this.create;
		},
		
		/*
		 * Returns value of the slider 
		 */
		'getValue1': function() {
			var features = this._features;
			var value = features.value1;
			return value;
		},
		
		/*
		 * Returns value of the loader
		 */
		'getValue2' : function() {
			var features = this._features;
			var value = features.value2;
			return value;
		},
		
		/*
		 * Return the div containing this indicatorknob element
		 */
		'getDiv': function() {
			var div = this._div;
			return div;
		},
		
		/*
		 * Sets the value of the indicatorknob slider or loader and update canvas element redrawing indicatorknob.
		 */
		'setValue': function(element, value) {
			var features = this._features;
			var valMin = features.valMin;
			var valMax = features.valMax;
			
			//Contain the value within the minimum and maximum range.
			if (value < valMin){
				value = valMin;
			}else if (value > valMax){
				value = valMax;
			}
			value = Math.round(value);
			
			if(element == "slider"){
				this.setFeature('value1', value);
			}else if(element == "loader"){
				this.setFeature('value2', value);
			}
			updatewellbeing();
		},
		
		/*
		 * Return value of a feature of the indicatorknob
		 */
		'getFeature': function(feature) {
			var features = this._features;
			var value = features[feature];
			return value;
		},
		
		/*
		 * Change of a feature of the indicatorknob and updating canvas element in the process
		 */
		'setFeature': function(feature, value) {
			this._features[feature] = value;
			this.create();
		},
		
		/*
		 * Create and recreate the indicatorknob on the canvas
		 */
		'create': function() {
			//Size the height and width of container to match containing div element
			var canvas = this._canvas;
			canvas.style.height = '100%';
			canvas.style.width = '100%';
			canvas.height = this._width;
			canvas.width = this._width;

			//Retrieve and store features of object in variables
			var features = this._features;
			var angleStart = features.angleStart;
			var angleOffset = features.angleOffset;
			var angleEnd = features.angleEnd;
			var value1 = features.value1;
			var value2 = features.value2;
			var valueToString = features.fnValueToString;
			var valueStr1 = valueToString(value1);
			var valueStr2 = valueToString(value2);
			var units = features.units;
			var valMin = features.valMin;
			var valMax = features.valMax;
			var colorloadbar = features.colorloadbar;
			var colorloader = features.colorloader;
			var colorslider1 = features.colorslider1;
			var colorslider2 = features.colorslider2;
			var barWidth = features.barWidth;
			var width = this._width;
			var fontSize = this._fontSize;
			
			//Return the context of the of the canvas
			var ctx = canvas.getContext('2d');
			var fontSizeString = fontSize.toString();
			
			//Uses the angleOffset to get the actual starting angle
			var actualStart = angleStart + angleOffset;
			//Uses the angleOffset to get the actual ending angle
			var actualEnd = angleEnd + angleOffset;
			//Gets the relative value of actual value which is a number between 0 and 1
			var relValue1 = (value1 - valMin) / (valMax - valMin);
			var relValue2 = (value2 - valMin) / (valMax - valMin);
			//Get the angle of the loader and sliders in radians from relative value
			var relAngle1 = relValue1 * (angleEnd - angleStart);
			var relAngle2 = relValue2 * (angleEnd - angleStart);
			//Adds angle associated with value the to the actual start to get end angle of loader and slider in radians pi
			var angleValue1 = actualStart + relAngle1;
			var angleValue2 = actualStart + relAngle2;
			//Gets the center x and y coordinates of the canvas element from the top and left borders of the element
			var centerX = 0.5 * width;
			var centerY = 0.5 * width;
			var radius = 0.4 * width;
			
			//Clear the canvas
			ctx.clearRect(0, 0, width, width);
			
			//Create the load bar
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, actualStart, actualEnd);
			ctx.lineCap = 'round';
			ctx.lineWidth = barWidth;
			ctx.strokeStyle = colorloadbar;
			ctx.stroke();
			
			//Create the loader
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, actualStart, angleValue2);
			ctx.lineCap = 'round';
			ctx.lineWidth = barWidth;
			ctx.strokeStyle = colorloader;
			ctx.stroke();
			
			//Create the slider
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, angleValue1, angleValue1);
			ctx.lineCap = 'round';
			ctx.lineWidth = barWidth;
			ctx.strokeStyle = (value1 == value2) ? colorslider2 : colorslider1;
			ctx.stroke();
			
			//Show the slider and loader values if they differ and only the slider value if the match
			if(features.value1 == features.value2){
				//Draw slider number in the middle
				ctx.font = fontSizeString + 'px Arial';
				ctx.fillStyle = colorslider2;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(valueStr1 + units, centerX, centerY);
			}else{
				//Draw slider number an couple 
				ctx.font = fontSizeString + 'px Arial';
				ctx.fillStyle = colorslider1;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(valueStr1 + units, centerX, centerY + width/8.3);
				
				//Draw loader number.
				ctx.font = fontSizeString + 'px Arial';
				ctx.fillStyle = colorloader ;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(valueStr2 + units, centerX, centerY - width/8.3);
			}
			
			//Draw minimum value
			ctx.font = '0.8vw Arial';
			ctx.fillStyle = 'red' ;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillText("Min: " + valMin, centerX - width/4.5, centerY + width/3.45);
			
			//Draw maximum value
			ctx.font = '0.8vw Arial';
			ctx.fillStyle = 'Limegreen' ;
			ctx.textAlign = 'right';
			ctx.textBaseline = 'middle';
			ctx.fillText("Max: " + valMax, centerX + width/4.5, centerY + width/3.45);
		}
	};
	
	/*
	 * Convert and return mouse event to value associated with the location of the event
	 */
	var mouseEventToValue = function(event, features) {
		//Returns the canvas element associated with the mouse event
		var canvas = event.target;
		//Obtains width and height of the object so that you can ...
		var width = canvas.scrollWidth;
		var height = canvas.scrollHeight;
		//obtain the center co-ordinates of the indicatorknob arc
		var centerX = 0.5 * width;
		var centerY = 0.5 * height;
		//Retrieve the coordinates of the mouse event 
		var x = event.offsetX;
		var y = event.offsetY;
		//Get the x and y coordinates in relation to the the center of the horseshoe arc
		var relX = x - centerX;
		var relY = -(y - centerY);
		
		//Get the difference between the start and end angles of indicator element
		var angleStart = features.angleStart;
		var angleEnd = features.angleEnd;
		var angleDiff = angleEnd - angleStart;
		
		/* 
		 * Get the angle of the a line from the origin through the coordinate 
		 * from the y axis. Then subtract this angle from the start angle to get
		 * the angle from the start angle to the point clicked
		 */
		var angle = Math.atan2(relX, relY) - angleStart;
		var twoPi = 2.0 * Math.PI;
		
		//Divide the angle obtained from the mouse even by the angle clicked to get the actual angle of the indicatorknob
		var valMin = features.valMin;
		var valMax = features.valMax;
		var value = ((angle / angleDiff) * (valMax - valMin));
		
		//Restrict value obtained to from mouse event to range as value can exceed or subceed the values for the range
		if (value < valMin){
			value = valMin;
		}
		else if (value > valMax){
			value = valMax;
		}
		
		//A value used for the transition function
		valuereached = 0;
	
		return value;
	};
	
	var mouseDownListener = function(event) {
		//Returns a number associated with the button clicked in the mouse event.
		var click = event.buttons;
		
		//If the button clicked is a left click then ...
		if (click === 1){
			var features = indicatorknob._features;
			event.preventDefault();
			//Retrieve and set new value associated with mouse event
			var value = mouseEventToValue(event, features);
			indicatorknob.setValue("slider", value);
		}
		
		//Set click status of left click button to true
		indicatorknob._clicked = true;
	};
	
	var mouseMoveListener = function(event) {
		var clicked = indicatorknob._clicked;
		
		//If the left mouse button remains clicked down
		if (clicked) {
			var features = indicatorknob._features;
			event.preventDefault();
			//Retrieve and set new value associated with mouse event
			var value = mouseEventToValue(event, features);
			indicatorknob.setValue("slider", value);
		}
		
	};
	
	var mouseUpListener = function(event) {
		var clicked = indicatorknob._clicked;
		
		//if the status of left click is true before method is called
		if (clicked) {
			var features = indicatorknob._features;
			event.preventDefault();
			var value = mouseEventToValue(event, features);
			indicatorknob.setValue("slider", value);
		}
		
		//Set click status of left mouse button to false since finger has left button
		indicatorknob._clicked = false;
	};
	
	//Take value in text input and sets the slider value to that as button is pressed
	function textChange(){
		indicatorknob.setValue("slider", textinput.value);
		textinput.value = "";
	}
	
	canvas.addEventListener('mousedown', mouseDownListener);
	canvas.addEventListener('mousemove', mouseMoveListener);
	canvas.addEventListener('mouseup', mouseUpListener);
	button.addEventListener('click', textChange);
	return indicatorknob;
}

//Returns actuator indicator bar when called
function ActuLoadbar(actuator, barcolor){

	//Create canvas and containing div element for object
	var canvas = document.createElement('canvas');
	var div = document.createElement('div');
	div.style.padding = '8px';
	
	//Creates text node input containing name of actuator and appends it in div element
	var str = document.createTextNode(actuator);
	div.style.color = "limegreen";
	div.appendChild(str);
	
	div.appendChild(canvas);
	
	var actuloadbar = {
		'_canvas': canvas,
		'_div': div,
		
		'_features': {
			'color' : barcolor,
			'value': 0,
			'fnValueToString': function(value) { return value.toString();}
		},
		
		//Draws loadbar
		'create': function() {
			var canvas = this._canvas;
			
			//Set length and height of loadbar 
			var width = 215;
			canvas.height = 25;
			
			var features = this._features;
			var color = features.color;
			var value = features.value;
			var valueToString = features.fnValueToString;
			var valueStr = valueToString(value);
			
			var ctx = canvas.getContext('2d');
			
			//Clears canvas upon creation
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			//Create the loadbar
			ctx.beginPath();
			ctx.lineCap = 'round';
			ctx.lineWidth = 25;
			ctx.strokeStyle = 'lightgrey';
			ctx.moveTo(12.5, 12.5);
			ctx.lineTo(12.5+width, 12.5);
			ctx.stroke();
			
			var lwidth = Math.round((value/100)*width);
			
			//Create the loader
			ctx.beginPath();
			ctx.lineCap = 'round';
			ctx.lineWidth = 25;
			ctx.strokeStyle = color;
			ctx.moveTo(12.5, 12.5);
			ctx.lineTo(12.5+lwidth, 12.5);
			ctx.stroke();
			
			//Inputs relevant percentage value at the start of the loadbar
			var fontSize = 0.75 * 25;
			ctx.font = fontSize.toString() + 'px Arial';
			ctx.fillStyle = 'red';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillText(valueStr + "%", 12.5, 12.5);
		},
		
		//Return div element of object
		'getDiv': function(){
		    this.create()
			return this._div;
		},
		
		//Set percentage value of load/ indicator bar
		'setValue': function(value) {
	        this._features.value = value;
			this.create();
		}
	}
	
	return actuloadbar;
}

//Defines total number of elements which can be contained on plot
var numberElements = 500;

//Holds number referring to number of plots currently on each line graph 
var updateCount1 = 0;
var updateCount2 = 0;

//Updates the line graphs of the indicator knobs with the latest values
function addDataiklg(values) {
	for(var i = 0; i < chart.length-1; i++){
		//Adds timing of each of plot to next label value
		chart[i].data.labels.push(new Date(values[5]));
		
		//Plots value of condition variable on line graph
		chart[i].data.datasets[0].data.push(values[i]);
		
		//Depending on the condition variable, select the desired level of corresponding variable
		switch(i){
			case 0: info = temperatureik.getValue1(); break;
			case 1: info = soilmoistureik.getValue1(); break;
			case 2: info = humidityik.getValue1(); break;
			case 3: info = lightintensityik.getValue1(); break;
			default: info = co2ik.getValue1();
		}
		
		//Plots the value of this variable on line graph
		chart[i].data.datasets[1].data.push(info);
		
		// If plot limit is exceeded deletes first plot adding new plot shifting the line graph to the left
		if(updateCount1 > numberElements){
			chart[i].data.labels.shift();
			chart[i].data.datasets[0].data.shift();
			chart[i].data.datasets[1].data.shift();
		}else{
			updateCount1++;
		}
		chart[i].update();
	}
}

//Updates the line graph of the actuator output with the latest value
function addDataaolg(values) {
	//Adds timing of each of plot to next label value
	chart[5].data.labels.push(new Date(values[4]));
	
	//Plots values of actuator outputs to each dataset on line graph
	chart[5].data.datasets[0].data.push(values[0]);
	chart[5].data.datasets[1].data.push(values[1]);
	chart[5].data.datasets[2].data.push(values[2]);
	chart[5].data.datasets[3].data.push(values[3]);
	
	//If plot limit is exceeded deletes first plot adding new plot shifting the line graph to the left
	if(updateCount2 > numberElements){
		chart[5].data.labels.shift();
		chart[5].data.datasets[0].data.shift();
		chart[5].data.datasets[1].data.shift();
		chart[5].data.datasets[2].data.shift();
		chart[5].data.datasets[3].data.shift();
	}else{
		updateCount2++;
	}
	chart[5].update();
}

//Alters indicator knob values depending on preset type of 'set condition' button pressed
function setconditions(event){
	var x = event.target.id;
	switch(x){
		case 'rainforest': 
			temperatureik.setValue("slider", 39);
			soilmoistureik.setValue("slider", 70);
			humidityik.setValue("slider", 95);
			lightintensityik.setValue("slider", 1000);
			co2ik.setValue("slider", 330);
			break;
		case 'savannah':
			temperatureik.setValue("slider", 30);
			soilmoistureik.setValue("slider", 43);
			humidityik.setValue("slider", 67);
			lightintensityik.setValue("slider", 91456);
			co2ik.setValue("slider", 389);
			break;
		case 'taiga':
			temperatureik.setValue("slider", 5);
			soilmoistureik.setValue("slider", 6);
			humidityik.setValue("slider", 2);
			lightintensityik.setValue("slider", 76560);
			co2ik.setValue("slider", 256);
			break;
		case 'mangroves':
			temperatureik.setValue("slider", 23);
			soilmoistureik.setValue("slider", 98);
			humidityik.setValue("slider", 69);
			lightintensityik.setValue("slider", 70244);
			co2ik.setValue("slider", 230);
			break;
		default:
			temperatureik.setValue("slider", 2);
			soilmoistureik.setValue("slider", 12);
			humidityik.setValue("slider", 3);
			lightintensityik.setValue("slider", 112560);
			co2ik.setValue("slider", 180);
	}
}

//Changes image in wellbeing div to indicate the wellbeing of the plant growing depending on indicator knob values
function updatewellbeing(){
	image = document.getElementById("wellbeing");

	//Calculates value representing the difference between the desired and sensed values in relation to the indicatorknobs' ranges
	tempD = temperatureik.getValue1();
	tempS = temperatureik.getValue2();
	tmin = temperatureik._features.valMin;
	tmax = temperatureik._features.valMax;
	var trating = Math.abs(tempD-tempS)/(tmax-tmin)*100;
	
	lightD = lightintensityik.getValue1();
	lightS = lightintensityik.getValue2();
	lmin = lightintensityik._features.valMin;
	lmax = lightintensityik._features.valMax;
	var lrating = (Math.abs(lightD-lightS)/(lmax-lmin))*100;
	
	humD = humidityik.getValue1();
	humS = humidityik.getValue2();
	var hrating = Math.abs(humD-humS);
	
	soilmD = soilmoistureik.getValue1();
	soilmS = soilmoistureik.getValue1();
	var smrating = Math.abs(soilmD-soilmS);

	co2D = co2ik.getValue1();
	co2S = co2ik.getValue2();
	cmin = co2ik._features.valMin;
	cmax = co2ik._features.valMax;
	var crating = (Math.abs(co2D-co2S)/(cmax-cmin))*100;
	
	//Calculates wellbeing based on an equation
	var rating = 100-((trating)*0.15 + /*(lrating)*0.3*/30 + (hrating)*0.1 + (smrating)*0.4 + (crating)*0.05);
	console.log("Rating: " + rating);
	//Change image of plant wellbeing div depending on rating
	if(rating > 85){
		//green happy face
		console.log("happy");
		image.src = "https://i.pinimg.com/originals/f9/08/52/f90852ab39e9c63042567c02848e5647.png";
	}else if(rating > 70){
		//neutral face
		console.log("neuter");
		image.src = "https://cdn.clipart.email/2253ae8accf1728cc9096c6001a35ace_neutral-face-clip-art-28-_600-600.jpeg";
	}else{
		//red sad face
		console.log("sad");
		image.src = "https://i.pinimg.com/originals/8c/a1/61/8ca16186867ca6a84130dd5cde9efd07.png";
	}
}

window.onload = function(){
	//firebase.database().ref().remove();
	createiks();
	createaos();
	chart = createlgs();
	
	
	changeStructure();
}

//Creates and sets attributes of indicator knobs 
function createiks(){
	temperatureik = new indicatorknob( document.getElementById("tempbox").getBoundingClientRect().width - 75 );
	soilmoistureik = new indicatorknob(document.getElementById("tempbox").getBoundingClientRect().width - 75);
	humidityik = new indicatorknob(document.getElementById("tempbox").getBoundingClientRect().width - 75);
	lightintensityik = new indicatorknob(document.getElementById("tempbox").getBoundingClientRect().width - 75);
	co2ik = new indicatorknob(document.getElementById("tempbox").getBoundingClientRect().width - 75);
	
	var div1 = temperatureik.getDiv();
	var div2 = soilmoistureik.getDiv();
	var div3 = humidityik.getDiv();
	var div4 = lightintensityik.getDiv();
	var div5 = co2ik.getDiv();
	
	temperatureik.setFeature("colorloader", "darkorange");
	temperatureik.setFeature("units", "°C");
	temperatureik.setFeature("valMax", "40");
	temperatureik.setValue("slider", 21);
	
	soilmoistureik.setFeature("colorloader", "mediumblue");
	soilmoistureik.setValue("slider", 92);
	
	humidityik.setFeature("colorloader", "turquoise");
	humidityik.setValue("slider", 54);
	
	lightintensityik.setFeature("colorloader", "yellow");
	lightintensityik.setFeature("units", " lx");
	lightintensityik.setFeature("valMax", "120000");
	lightintensityik.setValue("slider", 90343);
	
	co2ik.setFeature("colorloader", "magenta");
	co2ik.setFeature("units", " ppm");
	co2ik.setFeature("valMax", "500");
	co2ik.setValue("slider", 394);
	
	var elem1 = document.getElementById("ik1");
	var elem2 = document.getElementById("ik2");
	var elem3 = document.getElementById("ik3");
	var elem4 = document.getElementById("ik4");
	var elem5 = document.getElementById("ik5");
	
	elem1.appendChild(div1);
	elem2.appendChild(div2);
	elem3.appendChild(div3);
	elem4.appendChild(div4);
	elem5.appendChild(div5);
}

//Creates and sets values for actuator output loadbars
function createaos(){

	heatingpadao = new ActuLoadbar("Heating Pad", "darkorange");
	waterpumpao = new ActuLoadbar("Water Pump", "mediumblue");
	ledsao = new ActuLoadbar("LED's", "yellow");
	fanao = new ActuLoadbar("Fan", "turquoise");
	var div1 = heatingpadao.getDiv();
	var div2 = waterpumpao.getDiv();
	var div3 = ledsao.getDiv();
	var div4 = fanao.getDiv();
	
	var elem = document.getElementById("ik6");
	
	elem.appendChild(div1);
	elem.appendChild(div2);
	elem.appendChild(div3);
	elem.appendChild(div4);
}

//Creates and set values for line graphs
function createlgs(){

	var tchart = document.getElementById("lg1");
	var smchart = document.getElementById("lg2");
	var hchart = document.getElementById("lg3");
	var lichart = document.getElementById("lg4");
	var cdchart = document.getElementById("lg5");
	var acchart = document.getElementById("lg6");
	
	var commonOptions = {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                millisecond: 'hh:mm:ss'
              }
            }
          }],
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    };

    var tchartobj = new Chart(tchart, { 
        type: 'line',
        data: {
          datasets: [
			{
              label: "Sensed Level",
              data: 0,
			  backgroundColor: "rgba(255,153,0,0.4)",
			  borderColor: "rgba(255,153,0,1)"
			},{
			  label: "Desired Level",
			  data: 0,
			  backgroundColor: "rgba(153,255,51,0.4)",
			  borderColor: "rgba(153,255,51,1)",
			}
		  ]
        },
        options: Object.assign({}, commonOptions, {
          title:{
            display: true,
            text: "Temperature",
            fontSize: 16
          }
        })
    });
	
	var smchartobj = new Chart(smchart, {
        type: 'line',
        data: {
          datasets: [
			{
              label: "Sensed Level",
              data: 0,
			  backgroundColor: "rgba(255,153,0,0.4)",
			  borderColor: "rgba(255,153,0,1)"
			},{
			  label: "Desired Level",
			  data: 0,
			  backgroundColor: "rgba(153,255,51,0.4)",
			  borderColor: "rgba(153,255,51,1)",
			}
		  ]
        },
        options: Object.assign({}, commonOptions, {
          title:{
            display: true,
            text: "Soil Moisture",
            fontSize: 16
          }
        })
    });
	
	var hchartobj = new Chart(hchart, {
        type: 'line',
        data: {
          datasets: [
			{
              label: "Sensed Level",
              data: 0,
			  backgroundColor: "rgba(255,153,0,0.4)",
			  borderColor: "rgba(255,153,0,1)"
			},{
			  label: "Desired Level",
			  data: 0,
			  backgroundColor: "rgba(153,255,51,0.4)",
			  borderColor: "rgba(153,255,51,1)",
			}
		  ]
        },
        options: Object.assign({}, commonOptions, {
          title:{
            display: true,
            text: "Humidity",
            fontSize: 16
          }
        })
    });
	
	var lichartobj = new Chart(lichart, {
        type: 'line',
        data: {
          datasets: [
			{
              label: "Sensed Level",
              data: 0,
			  backgroundColor: "rgba(255,153,0,0.4)",
			  borderColor: "rgba(255,153,0,1)"
			},{
			  label: "Desired Level",
			  data: 0,
			  backgroundColor: "rgba(153,255,51,0.4)",
			  borderColor: "rgba(153,255,51,1)",
			}
		  ]
        },
        options: Object.assign({}, commonOptions, {
          title:{
            display: true,
            text: "Light Intensity",
            fontSize: 16
          }
        })
    });
	
	var cdchartobj = new Chart(cdchart, {
        type: 'line',
        data: {
          datasets: [
			{
              label: "Sensed Level",
              data: 0,
			  backgroundColor: "rgba(255,153,0,0.4)",
			  borderColor: "rgba(255,153,0,1)"
			},{
			  label: "Desired Level",
			  data: 0,
			  backgroundColor: "rgba(153,255,51,0.4)",
			  borderColor: "rgba(153,255,51,1)",
			}
		  ]
        },
        options: Object.assign({}, commonOptions, {
          title:{
            display: true,
            text: "carbon Dioxide",
            fontSize: 16
          }
        })
    });
	
	var acchartobj = new Chart(acchart, {
        type: 'line',
        data: {
          datasets: [
			{
              label: "Heating Pad",
              data: 0,
			  backgroundColor: "rgba(255,140,0,0.4)",
			  borderColor: "rgba(255,140,0,1)",
			},{
			  label: "Water Pump",
			  data: 0,
			  backgroundColor: "rgba(0,0,205,0.4)",
			  borderColor: "rgba(0,0,205,1)",
			},{
			  label: "LED's",
			  data: 0,
			  backgroundColor: "rgba(255,255,0,0.4)",
			  borderColor: "rgba(255,255,0,1)",
			},{
			  label: "Fan",
			  data: 0,
			  borderColor: "rgba(64,224,208,1)",
			  backgroundColor: "rgba(64,224,208,0.4)",
			}
		  ]
        },
        options: Object.assign({}, commonOptions, {
          title:{
            display: true,
            text: "Actuator Outputs",
            fontSize: 16
          }
        })
    });
	return [tchartobj, smchartobj, hchartobj, lichartobj, cdchartobj, acchartobj];
}

function changeStructure() {
	size = $(window).width();
	var cntrlcntr = document.getElementById("ctrlcntr"),
		sprcntnr = document.getElementById("supercontainer"),
		tempbox = document.getElementById("tempbox"), 
		lightbox = document.getElementById("lightbox"), 
		humidbox = document.getElementById("humidbox"), 
		moistbox = document.getElementById("moistbox"), 
		carbonbox = document.getElementById("carbonbox"),
		pep = document.getElementById("pep"),
		linegraphs = document.getElementById("linegraphs"),
		actuout = document.getElementById("actuout"),
		wellbeing = document.getElementById("wellbeingbox");
	
	console.log(size);
	
	temperatureik.setWidth();
	temperatureik.setBarWidth();
	
	soilmoistureik.setWidth();
	soilmoistureik.setBarWidth();
	
	humidityik.setWidth();
	humidityik.setBarWidth();
	
	lightintensityik.setWidth();
	lightintensityik.setBarWidth();
	
	co2ik.setWidth();
	co2ik.setBarWidth();
	
	if(size < 1000) {
		console.log("small");
		cntrlcntr.classList.remove("col-xs-6");
		cntrlcntr.classList.add("col-xs-12");
		sprcntnr.style.padding = "0vw 7vw 0vw 7vw";
		
		tempbox.classList.remove("col-xs-6");
		tempbox.classList.add("col-xs-12");
		
		lightbox.classList.remove("col-xs-6");
		lightbox.classList.add("col-xs-12");
		
		carbonbox.classList.remove("col-xs-6");
		carbonbox.classList.add("col-xs-12");
		
		humidbox.classList.remove("col-xs-6");
		humidbox.classList.add("col-xs-12");
		
		moistbox.classList.remove("col-xs-6");
		moistbox.classList.add("col-xs-12");
		
		pep.classList.remove("col-xs-6");
		pep.classList.add("col-xs-12");
		
		actuout.classList.remove("col-xs-6");
		actuout.classList.add("col-xs-12");
		
		wellbeing.classList.remove("col-xs-6");
		wellbeing.classList.add("col-xs-12");
		
	}
	
	else {
		console.log("large");
		cntrlcntr.classList.remove("col-xs-12");
		cntrlcntr.classList.add("col-xs-6");
		sprcntnr.style.padding = "0vw 0vw 0vw 1vw";
	
		tempbox.classList.remove("col-xs-12");
		tempbox.classList.add("col-xs-6");
		
		lightbox.classList.remove("col-xs-12");
		lightbox.classList.add("col-xs-6");
		
		carbonbox.classList.remove("col-xs-12");
		carbonbox.classList.add("col-xs-6");
		
		humidbox.classList.remove("col-xs-12");
		humidbox.classList.add("col-xs-6");
		
		moistbox.classList.remove("col-xs-12");
		moistbox.classList.add("col-xs-6");
		
		pep.classList.remove("col-xs-12");
		pep.classList.add("col-xs-6");
		
		actuout.classList.remove("col-xs-12");
		actuout.classList.add("col-xs-6");
		
		wellbeing.classList.remove("col-xs-12");
		wellbeing.classList.add("col-xs-6");
	}
}

window.onresize = changeStructure;