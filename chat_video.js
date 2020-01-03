//server janus address
var server = null;
var idVideo = "testVideo" + Janus.randomString(12);
var videoCall = null;
server = "http://" +"192.168.12.53" +":8088/janus"
var loginInput = document.querySelector('#usernameInput');
var loginBtn = document.querySelector('#loginBtn');

var otherUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn');
var startBtn = document.querySelector('#StartBtn');
var acceptBtn = document.querySelector('#acceptBtn');
var hangUpBtn = document.querySelector('#hangUpBtn');
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
var loginPage = document.querySelector('#loginPage');
var callPage = document.querySelector('#callPage');
//chat
var textMess = document.querySelector('#textMess');
var sendChat = document.querySelector('#sendChat');


var doSimulcast = true;
var jsep_offer = null;
function startVideo(){
    callPage.style.display = "none";
    Janus.init({debug: true, callback: function(){
        startBtn.addEventListener("click", function(event){
            var janus = new Janus({
                //var : server
                server: server,
                success: function(){
                    //init success
                    janus.attach(
                                    {
                                        plugin: "janus.plugin.videocall",
                                        opaqueId: idVideo,
                                        success: function(videoHandle){
                                            videoCall = videoHandle;
                                            console.log("attach success !!!");
                                            //send request list
                                            startBtn.style.display ="none";
                                            loginPage.style.display="block";
                                        },
                                        error: function(error){
                                            console.log("Error when attach "+error);
                                        },
                                        webrtcState: function(isConnected){

                                        },
                                        iceState: function(state){

                                        },
                                        mediaState: function(type, choose){

                                        },
                                        onmessage: function(message, jsep){
                                            console.log("---Got new Message--- ");
                                            var result = message["result"];
                                            if(result !== null && result !== undefined){
                                                var process = result["event"];
                                                switch (process){
                                                    case "registered":
                                                        //register success
                                                        console.log("register success username "+ result["username"]);
                                                        loginPage.style.display="none";
                                                        callPage.style.display ="block";
                                                        //get list user
                                                        var listUser = {"request": "list"};
                                                        videoCall.send({"message": listUser});
                                                        break;
                                                    case "calling":
                                                        console.log(result["username"] + "calling");
                                                        break;
                                                    case "incomingcall":
                                                        console.log(result["username"] + "incomingcall");
                                                        //function nhap nhay
                                                        var onOff = false;
                                                        if(jsep){
                                                            jsep_offer = jsep;
                                                        }

                                                        setInterval(function(){
                                                            if(!onOff){
                                                                acceptBtn.style.background = "#589560";
                                                                onOff = true;
                                                            }else{
                                                                acceptBtn.style.background = "#fafafa";
                                                                onOff = false;
                                                            }

                                                        }, 100);

                                                        break;
                                                    case "accepted":
                                                        console.log(result["username"] + "accepted");
                                                        if(jsep){

                                                            videoCall.handleRemoteJsep({jsep: jsep});
                                                        }

                                                        break;
                                                    case "hangup":
                                                        console.log(result["username"] + "hangup");
                                                        videocall.hangup();
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                var lists = result["list"];
                                                if(lists !== null && lists !== undefined){
                                                    console.log("list user :" +lists);
                                                }
                                            }

                                        },
                                        onlocalstream: function(localStream){
                                            Janus.attachMediaStream(localVideo, localStream);

                                        },
                                        onremotestream: function(remoteStream){
                                            Janus.attachMediaStream(remoteVideo , remoteStream);

                                        },
                                        ondataopen: function(data){
                                            console.log("The DataChannel available !!!");
                                        },
                                        ondata: function(data){
                                            console.log("The Data receive : " + data);
                                            var text = data["text"];
                                            if(text !== null && text !==  undefined){
                                                console.log("The Text : "+text);
                                            }
                                        },
                                        oncleanup: function(){

                                        },
                                        detached: function(){

                                        }

                                     }
                                );
                },
                error: function(cause){

                },
                destroyed: function(){

                }
        });



    });
    }
    });
}
loginBtn.addEventListener("click",function(event){
    var name = loginInput.value;
    if(name){
        var register = {"request":"register", "username":name};
        videoCall.send({"message": register});
    }
});
//call button
callBtn.addEventListener("click",function(event){
    var callWith = otherUsernameInput.value;
    //build SDP
    videoCall.createOffer({
        media: {data: true},
        simulcast: doSimulcast,
        success: function(jsep){
            //send this sdp to server
            console.log("Got SDP from local media server");
            var body = {"request": "call", "username": callWith};
            videoCall.send({"message": body, "jsep": jsep});
        },
        error: function(err){
            console.log("Create offer failed "+ err);
        }

    });
});
acceptBtn.addEventListener("click", function(event){
    console.log("Accept button Click !!!");
    videoCall.createAnswer(
    {
        jsep: jsep_offer,
        media: {data: true},
        simulcast: doSimulcast,
        success: function(jsep){
            console.log("Got New Answer ");
            var body = {"request": "accept"};
            videoCall.send({"message": body, "jsep": jsep});
        },
        error: function(err){
            console.log("Creetae answer error "+ err);
        }


    });

});
sendChat.addEventListener("click", function(event){
    var content = textMess.value;
    sendMessage(content);

});
function sendMessage(content){
    console.log("Send message : " + content);
    if(content){
        videoCall.send(
        {
            text: content,
            error: function(error){
               console.log("Error send messgae: "+ error);
            },
            success: function(){textMess.value ='';}
        });
    }
}


