var ProtoBuf = require("protobufjs");
var builder = ProtoBuf.loadSync("./res/cs.proto")
var NetMSG_ID = require("./NetMsg_ID");
var connectDB = require("./db/ConnectDB");
var WebSocketServer = require('ws').Server;

var ws = new WebSocketServer({
    port:8080,
});
var wscoket;

ws.on('connection', function(wscoket){
    console.log("有人连接成功");
    wscoket = wscoket;
    wscoket.on('message', function(data){
        var dataView = new DataView(new Uint8Array(data).buffer);
        var netMessageId = dataView.getUint16(0, true);
        var mesgeLenth = dataView.getUint16(2, true);
        var uint8Array = new Uint8Array(mesgeLenth);
        var k = 0;
        for(var i=4; i<data.length; i+= 2){
            uint8Array[k] = dataView.getUint16(i, true);
            k = k +1;
        }
        switch (netMessageId){
            case NetMSG_ID.ID_C2S_UserInfo:
                var C2S_UserInfo = builder.lookupType("cs.C2S_UserInfo");
                var msgData = C2S_UserInfo.decode(uint8Array);
                console.log("Received user: "+msgData.name);
                console.log("Received password: "+msgData.password);
                connectDB.beginConnect();
                connectDB.checkUserNameAndPasswrodIsVaildBy(msgData.name, msgData.password, function(flag){
                    var userInfo = builder.lookupType("cs.S2C_UserInfo");
                    var msgObject = {ret:flag, msg:"error"};
                    var msgContentBuffer = userInfo.encode(msgObject).finish()
                    var uint16Arr = new Uint16Array(2);
                    uint16Arr[0] = NetMSG_ID.ID_S2C_UserInfo;
                    uint16Arr[1] = msgContentBuffer.length;
                    var msgIdBuffer = new Buffer(uint16Arr.buffer);
                    var totalLength = msgIdBuffer.length + msgContentBuffer.length;
                    var buffer = Buffer.concat([msgIdBuffer, msgContentBuffer], totalLength);
                    wscoket.send(buffer);
                });
                break;
        }
    });
    wscoket.on('close', close);
    wscoket.on('error', error);
    wscoket.on('open', open);
    
});


function close(msg){
    console.log("close"+msg);
}

function error(msg){
    console.log("error"+msg);
}

function open(msg){
    console.log("open"+msg);
}