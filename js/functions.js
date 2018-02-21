function onloadfunction() {
	var connect_but = document.getElementById("button_connect");
	var new_rate_but = document.getElementById("button_new_rate");
	connect_but.onclick = function() {	
		
			var lotId = document.getElementById("lot_id").value;
			var userId = document.getElementById("user_id").value; 
			if((lotId.length != 0) && (userId.length != 0)) {

				helloMessage = "{\"observableLotIdList\":[" + lotId + "],\"queryType\":\"REGISTRATION\",\"time\":\"2017.12.08 13:01:18\",\"packetId\":0,\"userId\":" + userId + "}";
				alert(helloMessage);
		
				if("WebSocket" in window) {

					var ws = new WebSocket("ws://localhost:5050/");

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
};

function onReceiveMessage(message) {	
	parseMessage(message);
};

function sendNewRate(socket, userId, lotId) {
	var newRate = +document.getElementById("current_rate").value + 10;
	var message = "{\"lotId\":" + lotId + ",\"price\":" + newRate + ",\"queryType\":\"NEW_RATE\",\"time\":\"2018.02.21 16:48:40.588\",\"packetId\":3,\"userId\":" + userId + "}";
	socket.send(message);
}

function parseMessage(message) {
	alert(message);
	var mess = JSON.parse(message);
	if((mess.queryType == "ANSWER") && (mess.message == "OK")) {
		//alert("receive OK message");
		document.getElementById("time_last_update").value = mess.time;
	} else if(mess.queryType == "NOTIFY") {
		var lotMess = mess.lot;
		document.getElementById("start_price").value = lotMess.startPrice;
		document.getElementById("current_rate").value = lotMess.lastRate;
		document.getElementById("lot_name").value = lotMess.lotName;
		document.getElementById("winner_id").value = lotMess.lastRateUserId;
		document.getElementById("observers").value = lotMess.amountObservers;
		document.getElementById("time_to_finish").value = lotMess.timeToFinish;
	}
};

