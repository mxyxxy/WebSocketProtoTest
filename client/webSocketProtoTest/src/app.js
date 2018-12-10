/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/


var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        var self = this;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("WebSocket protoBuf", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });

        //self._protoData = new ProtoData("http://localhost:63344/webSocketProtoTest/res/cs.proto")
        self._protoData = new ProtoData(res.CS_proto)

        // Send Text Status Label
        this._sendTextStatus = new cc.LabelTTF("Send Text WS is waiting...", "Arial", 20, cc.size(500, 100), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        this._sendTextStatus.anchorX = 0.5;
        this._sendTextStatus.anchorY = 0.5;
        this._sendTextStatus.x = size.width / 2;
        this._sendTextStatus.y = size.height / 2 ;
        this.addChild(this._sendTextStatus);

        // Error Label
        this._errorStatus = new cc.LabelTTF("Error WS is waiting...", "Arial", 20, cc.size(500, 100), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        this._errorStatus.anchorX = 0.5;
        this._errorStatus.anchorY = 0.5;
        this._errorStatus.x = size.width / 2;
        this._errorStatus.y = size.height / 2 - 100;
        this.addChild(this._errorStatus);

        // Error Label
        this._okStatus = new cc.LabelTTF(" ", "Arial", 14, cc.size(500, 100), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        this._okStatus.anchorX = 0.5;
        this._okStatus.anchorY = 0.5;
        this._okStatus.x = size.width / 2;
        this._okStatus.y = size.height / 2 - 50;
        this.addChild(this._okStatus);

        self._sendTextTimes = 0;
        this._wsiSendText = new WebSocket("ws://localhost:8080",8080);
        this._wsiSendText.binaryType = "arraybuffer"; // We are talking binary
        this._wsiSendText.onopen = function(evt) {
            self._sendTextStatus.setString("Opened url: " + self._wsiSendText.url + ", protocol: " + self._wsiSendText.protocol);
            var userInfo = {id: 999, name: "laojiang", password:"1234"};
            var msgBuffer = protobuf.encode("cs.C2S_UserInfo", userInfo,  self._protoData)
            var uint8Array = new Uint16Array(30);
            uint8Array[0] = NetMsg_ID.ID_C2S_UserInfo;
            uint8Array[1] = msgBuffer.length;
            uint8Array.set(msgBuffer,2);
            var arrayBuffer = uint8Array.buffer
            self._wsiSendText.send(arrayBuffer);
        };
        this._wsiSendText.onmessage = function(evt) {
            self._sendTextTimes++;
            var dataView = new DataView(new Uint8Array(evt.data).buffer);
            var netMessageId = dataView.getUint16(0, true);
            console.log("rec message"+netMessageId);
            var mesgeLenth = dataView.getUint16(2, true);
            var uint8Array = new Uint8Array(mesgeLenth);
            var k = 0;
            for(var i=4; i<dataView.byteLength; i++){
                uint8Array[k] = dataView.getUint8(i);
                k = k +1;
            }
            var parseData;
            switch (netMessageId){
                case NetMsg_ID.ID_S2C_UserInfo:
                    parseData = protobuf.decode("cs.S2C_UserInfo",uint8Array,self._protoData);
                    if(parseData.ret == 0){
                        cc.log(parseData.msg + "  登录失败，账户或者密码错误。。。。")
                        self._errorStatus.setString("  登录失败，账户或者密码错误。。。。");
                    }
                    break;
            }
        };

        this._wsiSendText.onerror = function(evt) {
            cc.log("WebSocket test layer was destroyed!");
        };

        this._wsiSendText.onclose = function(evt) {
            cc.log("_wsiSendText websocket instance closed.");
            self._wsiSendText = null;
        };
        return true;
    },
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

