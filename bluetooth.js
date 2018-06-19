	//BLE
	let connectBtn = document.getElementById('connect');
	let test = document.getElementById('test');

	let m1slider   = document.getElementById('m1');
	let m2slider   = document.getElementById('m2');
	let automBtn   = document.getElementById('autonomus');
	let terminal   	   = document.getElementById('terminal');
	let deviceCache = null;
	let characteristicCache = null;
	let executedForward = false;
	let executedReverse = false;
	let executedRight = false;
	let executedLeft = false;
	var last_command = "000#000#";
	
	var timer = new Timer(function() {
		if (last_command != command){
			writeToCharacteristic(characteristicCache, command);
			console.log(command);
			last_command = command;
		}	
	}, 100);

	window.onload = () => {
		if(!navigator.bluetooth){
			alert('Your current browser does not support web bluetooth or is not enabled. Please use the latest version of Chrome and enable Web Bluetooth under chrome://flags');
			connectBtn.disabled = true;
		}
		connectBtn.onclick = connect;
	}

	


	//keyCodes for W(87) and A(65) S(83) D(68)
	var codeset = { 87: false, 65: false, 83: false, 68: false };

	//Tracking the Key down & Key up events
	document.addEventListener('keydown', function (e){
	    if (e.keyCode in codeset) {
	        codeset[e.keyCode] = true;
	        timer.start();
	        if(codeset[87]){
	        	if (!executedForward){
	        		updateSpeedForward();
	        	}
	        }
	        if(codeset[65]){
				if (!executedLeft){
					turnLeft();
				}
			}
	        if(codeset[83]){
				if (!executedReverse){
					updateSpeedReverse();
				}
			}	
	        if(codeset[68]){
				if(!executedRight){
					turnRight();
				}
			}
		}
	});

	document.addEventListener('keyup', function (e) {
	    if (e.keyCode in codeset) {
	        codeset[e.keyCode] = false;
	        executedForward = false;
				executedLeft = false;				
	  		executedReverse = false;
			executedRight = false;
			stopMotor();  			
	    }
	});


	function connect() {
			return (deviceCache ? Promise.resolve(deviceCache) :
		  requestBluetoothDevice()).
		  then(device => connectDeviceAndCacheCharacteristic(device)).
		  then(characteristic => startNotifications(characteristic)).
		  catch(error => console.log(error));
	}

	function requestBluetoothDevice() {

		  return navigator.bluetooth.requestDevice({
		    filters: [{services: [0xFFE0]}],
		  }).
		      then(device => {
		        deviceCache = device;
		        return deviceCache;
		    	});
	}

	function connectDeviceAndCacheCharacteristic(device) {
		  if (device.gatt.connected && characteristicCache) {
		    return Promise.resolve(characteristicCache);
		  }

		  return device.gatt.connect().
		      then(server => {
		        return server.getPrimaryService(0xFFE0);
		      }).
		      then(service => {
		        return service.getCharacteristic(0xFFE1);
		      }).
		      then(characteristic => {
		        characteristicCache = characteristic;

		        return characteristicCache;
		      });
	}

	function startNotifications(characteristic) {
			return characteristic.startNotifications().
			then(() => {
			characteristic.addEventListener('characteristicvaluechanged',
	    		handleCharacteristicValueChanged);
			});
	}

	let readBuffer = '';

	function handleCharacteristicValueChanged(event) {
		let value = new TextDecoder().decode(event.target.value);

	  	for (let c of value) {
	    	if (c === '\n') {
		      let data = readBuffer.trim();
		      readBuffer = '';

		      if (data) {
		        receive(data);
		      }
		    }
		    else {
		      readBuffer += c;
		    }
		  }
	}		

	function receive(data) {
  		log(data, 'in');
	}

	function log(data, type = '') {
		var n_div = $('.in').length;
		if (n_div >= 6){
			for (var i = 0; i<n_div-6; i++){
				$('.in')[0].remove();
			}
		}
		terminal.insertAdjacentHTML('beforeend',
		'<div' + (type ? ' class="' + type + '"' : '') + '>' + data + '</div>');

	}

	function writeToCharacteristic(characteristic, str) {
			characteristic.writeValue(str2ab(str));
	}

	function str2ab(str){
		let buf = new ArrayBuffer(str.length); // 2 bytes for each char
		let bufView = new Uint8Array(buf); //make sure buffer array is of type uint8
		for (let i=0, strLen=str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}


	function stopMotor(){
		command  = "000#00#"; 
		// console.log(str);
		// 	writeToCharacteristic(characteristicCache, str);
	}

	

	var command = "000#00#";

	function updateSpeedForward(){
		executedForward = true;
		if(m1slider.value == 100){
			command = "08#"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			command = "08#00"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else {
			command = "008#"+m1slider.value+"#";
			//console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}
	}

	function updateSpeedReverse(){
			executedReverse= true;
			if(m1slider.value == 100){
			command= "09#"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			command= "09#00"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else {
			command= "009#"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}
	}

	function turnRight(){
		  	executedRight = true;
			if(m1slider.value == 100){
			command = "10#"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			command = "10#00"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else {
			command = "010#"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}
	}

	function turnLeft(){
		  	executedLeft = true;
			if(m1slider.value == 100){
			command = "11#"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else if(m1slider.value == 0) {
			command = "11#00"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else {
			command = "011#"+m1slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}
	}

	var timesClicked = 2;

	function automode(){
		// console.log(str);
		// 	writeToCharacteristic(characteristicCache, str);
		if (timesClicked%2==0) {
			timesClicked++;
			command = "100#00#";
			codeset = {};
			setTimeout(function(){
				timer.stop();
			}, 250);
		}else{
			timesClicked++;
			command = "101#00#";
			codeset = { 87: false, 65: false, 83: false, 68: false };
			timer.start();
		}
	}

	function get_info(){
		command = "102#00#";
		console.log(str);
		writeToCharacteristic(characteristicCache, str);
	}

	function updateLed(){
		if(m2slider.value == 100){
			command= "99#"+m2slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else if(m2slider.value == 0) {
			command = "99#00"+m2slider.value+"#";
			// console.log(str);
			// 	writeToCharacteristic(characteristicCache, str);
		}else {
			command = "099#"+m2slider.value+"#";
		}
	}
	
	/* var interval = setInterval(function(){
		if (last_command != command){
			writeToCharacteristic(characteristicCache, command);
			console.log(command);
			last_command = command;
		}
	}, 100); */
