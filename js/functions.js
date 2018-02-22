var lotId = null;
var userId = null;
var socket = null;
var timer = null;
var connect_but = null;
var new_rate_but = null;
var load_lots_but = null;
var load_subscribe = null;

function onloadfunction() {
	connect_but = document.getElementById("button_connect");
	new_rate_but = document.getElementById("button_new_rate");
	load_lots_but = document.getElementById("button_load_lots");
	load_subscribe = document.getElementById("button_subscribe");
	connect_but.onclick = function() {	
		
			lotId = document.getElementById("lot_id").value;
			userId = document.getElementById("user_id").value; 
			if(userId.length != 0) {

				if(lotId.length == 0) {
					lotId = 0;
				}

				helloMessage = "{\"observableLotIdList\":[" + lotId + "],\"queryType\":\"REGISTRATION\",\"time\":\"2017.12.08 13:01:18\",\"packetId\":0,\"userId\":" + userId + "}";
				//alert(helloMessage);
		
				if("WebSocket" in window) {

					var ws = new WebSocket("ws://localhost:5050/");
					socket = ws;

					ws.onopen = function() {
						onOpenSocket(ws, helloMessage);
					};

					ws.onmessage = function (evt) { 
						var received_msg = evt.data;					
						onReceiveMessage(received_msg);					
					};

					ws.onclose = function() { 
						// websocket is closed.
						clearInterval(timer);
						alert("Connection is closed...");
						connect_but.disabled = false; 
						new_rate_but.disabled = true;
						load_lots_but.disabled = true;
						load_subscribe.disabled = true;
					};

					window.onbeforeunload = function(event) {
						socket.close();
					};
					
					new_rate_but.onclick = function() {
						sendNewRate(ws, userId, lotId);
					};					
					
					load_lots_but.onclick = function() {
						sendLoadLots(ws, userId);
					};		
					
					load_subscribe.onclick = function() {
						sendSubscribe(ws, userId, 2);
					};		

					connect_but.disabled = true;
				} else {
					alert("WebSocket NOT supported by your Browser!");
				}
			} else {
				alert("User ID is empty"); 
			}
	}
};

function onOpenSocket(socket, message) {		
	socket.send(message);
	timer = setInterval(function() {
		sendPollQuery(socket, userId);
	}, 1000);
	
};

function onReceiveMessage(message) {	
	parseMessage(message);
};

function sendNewRate(socket, userId, lotId) {
	var newRate = +document.getElementById("current_rate").value + 10;
	var message = "{\"lotId\":" + lotId + ",\"price\":" + newRate + ",\"queryType\":\"NEW_RATE\",\"time\":\"2018.02.21 16:48:40.588\",\"packetId\":3,\"userId\":" + userId + "}";
	socket.send(message);
}

function sendLoadLots(socket, userId) {
	var message = "{\"queryType\":\"LOAD_LOTS\",\"time\":\"2018.02.21 16:48:40.588\",\"packetId\":0,\"userId\":" + userId + "}";
	socket.send(message);
}

function sendSubscribe(socket, userId, lotId) {
	var message = "{\"lotId\":" + lotId + ",\"queryType\":\"SUBSCRIBE\",\"time\":\"2018.02.21 16:48:40.588\",\"packetId\":0,\"userId\":" + userId + "}";
	socket.send(message);
}

function sendPollQuery(socket, userId) {
	var message = "{\"queryType\":\"POLL\",\"time\":\"2018.02.21 16:48:40.588\",\"packetId\":0,\"userId\":" + userId + "}";
	socket.send(message);
}

function parseMessage(message) {	
	var mess = JSON.parse(message);
	if((mess.queryType == "ANSWER") && (mess.message == "OK")) {
		if(new_rate_but.disabled == true) {
			new_rate_but.disabled = false;
		}
		if(load_lots_but.disabled == true) {
			load_lots_but.disabled = false;
		}
		if(load_subscribe.disabled == true) {
			load_subscribe.disabled = false;
		}
		//alert("receive OK message");
		document.getElementById("time_last_update").value = mess.time;
	} else if(mess.queryType == "NOTIFY") {
		//alert(message);
		var lotMess = mess.lot;
		document.getElementById("lot_id").value = lotMess.lotId;
		document.getElementById("start_price").value = lotMess.startPrice;
		document.getElementById("current_rate").value = lotMess.lastRate;
		document.getElementById("lot_name").value = lotMess.lotName;
		document.getElementById("winner_id").value = lotMess.lastRateUserId;
		document.getElementById("observers").value = lotMess.amountObservers;
		document.getElementById("time_to_finish").value = lotMess.timeToFinish;
	} else if(mess.queryType == "POLL_ANSWER") {
		//alert(message);
		var lotMess = mess.auctionLots;
		if(lotMess.length != 0) {
			document.getElementById("lot_id").value = lotMess[0].lotId;
			document.getElementById("start_price").value = lotMess[0].startPrice;
			document.getElementById("lot_name").value = lotMess[0].lotName;
			document.getElementById("current_rate").value = lotMess[0].lastRate;		
			document.getElementById("winner_id").value = lotMess[0].lastRateUserId;
			document.getElementById("observers").value = lotMess[0].amountObservers;
			document.getElementById("time_to_finish").value = lotMess[0].timeToFinish;
		}
	} else if(mess.queryType == "LOAD_LOTS_ANSWER") {
		//alert(message);
		var lotMess = mess.auctionLotIdList;
		
		var tableRef = document.getElementById("painting").getElementsByTagName('tbody')[0];

		var newRow   = tableRef.insertRow(tableRef.rows.length);
		var newCell  = newRow.insertCell(0);
		var newText  = document.createTextNode("Lot ID");
		newCell.appendChild(newText);
		var newCell  = newRow.insertCell(1);
		var newText  = document.createTextNode("Subscribe");
		newCell.appendChild(newText);

		for(var i=0; i<lotMess.length; i++) {
			var id = lotMess[i];

			var newRow   = tableRef.insertRow(tableRef.rows.length);
			var newCell1  = newRow.insertCell(0);
			var newText  = document.createTextNode(id);
			newCell1.appendChild(newText);

			var newCell2  = newRow.insertCell(1);
			var newButton = document.createElement("button");
			newButton.innerHTML = "Subscribe";
			newButton.onclick = (function(id) {
				return function(event) {
					sendSubscribe(socket, userId, id);
				}
			})(id);
			newCell2.appendChild(newButton);
		}
	}
};

