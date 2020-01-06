var opaqueId = "videoconf-"+Janus.createString(12);

var start = document.querySelector('#startVideo');
var loginBtn = document.querySelector('#loginBtn');
var usernameInput = document.querySelector('#usernameInput');
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
var remoteName = document.querySelector('#remoteName');

//room names
var roomName = document.querySelector('#roomname');
var createRoom = document.querySelector('#createroom');

var remoteVideo1 = document.querySelector('#remoteVideo1');
var remoteName1 = document.querySelector('#remoteName1');

var remoteVideo2 = document.querySelector('#remoteVideo2');
var remoteName2 = document.querySelector('#remoteName2');

var remoteVideo3 = document.querySelector('#remoteVideo3');
var remoteName3 = document.querySelector('#remoteName3');

var remoteVideo4 = document.querySelector('#remoteVideo4');
var remoteName4 = document.querySelector('#remoteName4');

//pages
var loginPage = document.querySelector('#loginPage');
var callPage = document.querySelector('#callPage');

var janus = null;
var server = "http://"+"192.168.1.103"+":8088/janus";

var videoRoom ;
function startVideo(){
    //callPage.style.display ="none";
    start.addEventListener("click", function(event){
        Janus.init({debug: "all", callback : function(){
            janus = new Janus({
                server: server,
                success: function(){
                    janus.attach({
                        plugin: "janus.plugin.videoroom",
                        opaqueId: opaqueId,
                        success: function(roomHandle){
                            videoRoom = roomHandle;

                        }
                        error: function(error){
                            console.log("Attach error :"+ error);
                        },
                        webrtcState: function(isSuccess){//webrtc connect
                            if(isSuccess){
                                console.log("webrtc connect Successfully");
                            }else{
                                console.log("webrtc failed !!!");
                            }
                        },
                        iceState: function(state){
                            console.log("ice state "+ state);
                        },
                        mediaState: function(media, on){
                            console.log(on ? "Start": "Stop" + " receive data "+media);
                        },
                        onmessage: function(message, jsep){

                        },
                        onlocalstream: function(mystream){

                        },
                        onremotestream: function(remoteStream){

                        },
                        oncleanup: function(){
                            console.log("Webrtc close");
                        },
                        detached: function(){
                            console.log("PeerConnection close");
                        }
                    });
                },
                error: function(error){
                    console.log("Error Janus create obj "+ error);
                },
                destroyed: function(){

                }
            });
        }});
    });

}
//create room
createRoom.addEventListener("click", function(event){
    var name = roomName.value;
    if(videoRoom !== null && videoRoom !== undefined){
        var body = {
            "request": "create",
            "description":name
        };
        videoRoom.send({"message": body});
    }
});
