var userId = null;
var socket = null;

function onloadfunction() {
	var connect_but = document.getElementById("button_connect");
	var new_rate_but = document.getElementById("button_new_rate");
	connect_but.onclick = function() {	
		
			var lotId = document.getElementById("lot_id").value;
			userId = document.getElementById("user_id").value; 
			if((lotId.length != 0) && (userId.length != 0)) {

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
						alert("Connection is closed..."); 
					};

					window.onbeforeunload = function(event) {
						socket.close();
					};
					
					new_rate_but.onclick = function() {
						sendNewRate(ws, userId, lotId);
					};					

					connect_but.disabled = true;
				} else {
					alert("WebSocket NOT supported by your Browser!");
				}
			} else {
				alert("Lot ID or User ID is empty"); 
			}
	}
};

function onOpenSocket(socket, message) {		
	socket.send(message);
	setInterval(function() {
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

function sendPollQuery(socket, userId) {
	var message = "{\"queryType\":\"POLL\",\"time\":\"2018.02.21 16:48:40.588\",\"packetId\":0,\"userId\":" + userId + "}";
	socket.send(message);
}

function parseMessage(message) {	
	var mess = JSON.parse(message);
	if((mess.queryType == "ANSWER") && (mess.message == "OK")) {
		//alert("receive OK message");
		document.getElementById("time_last_update").value = mess.time;
	} else if(mess.queryType == "NOTIFY") {
		//alert(message);
		var lotMess = mess.lot;
		document.getElementById("start_price").value = lotMess.startPrice;
		document.getElementById("current_rate").value = lotMess.lastRate;
		document.getElementById("lot_name").value = lotMess.lotName;
		document.getElementById("winner_id").value = lotMess.lastRateUserId;
		document.getElementById("observers").value = lotMess.amountObservers;
		document.getElementById("time_to_finish").value = lotMess.timeToFinish;
	} else if(mess.queryType == "POLL_ANSWER") {
		//alert(message);
		var lotMess = mess.auctionLots;
		document.getElementById("start_price").value = lotMess[0].startPrice;
		document.getElementById("lot_name").value = lotMess[0].lotName;
		document.getElementById("current_rate").value = lotMess[0].lastRate;		
		document.getElementById("winner_id").value = lotMess[0].lastRateUserId;
		document.getElementById("observers").value = lotMess[0].amountObservers;
		document.getElementById("time_to_finish").value = lotMess[0].timeToFinish;
	}
};

