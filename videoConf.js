var opaqueId = "videoconf-"+Janus.randomString(12);

var start = document.querySelector('#startVideo');
var loginBtn = document.querySelector('#loginBtn');
var usernameInput = document.querySelector('#usernameInput');
var localVideo = document.querySelector('#localVideo');
var localName = document.querySelector('#localName');
var remoteVideo = document.querySelector('#remoteVideo');
var remoteName = document.querySelector('#remoteName');

//room names
var roomName = document.querySelector('#roomname');
var createRoom = document.querySelector('#createroom');
var count =1;
var countName =0;
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
//
var topic = document.querySelector('#topic');
var janus = null;
var jUser = null;
var server = "http://"+"192.168.12.53"+":8088/janus";

var videoRoom, remoteUser ;
var myroom = 1234;
var myusername = null;
var onetime = false;
var previousName = null;
var listUser =[];
var itemUsr = {};
var roomId;
function startRoom(){
    createRoom.style.display ="none";
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

                        },
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
                            console.log("onmessage call");
                            var type = message["videoroom"];
                            console.log("room type "+ type);
                            if(type !== null && type !== undefined){
                                switch(type){
                                case "created":
//                                    myroom = message["room"];
                                    console.log("myroom id : "+ myroom);
                                    break;

                                case "joined":
                                    console.log("joined room : "+ message["room"]);
                                    console.log("des : "+ message["description"]);
                                    //get member here
                                    topic.innerHTML = message["description"];
                                    var publishers = message["publishers"];
                                    console.log("attendees " +publishers);
                                    roomId = message["room"];
                                    var myId = message["id"];
                                    if(publishers !== null && publishers !==undefined){
                                        for(var i in publishers){
                                            var pubId = publishers[i]["id"];
                                            var pubDisplay = publishers[i]["display"];
                                            console.log("name of attenndees : "+ pubDisplay +"pubid "+pubId);
                                            addUserToList(pubDisplay, pubId);
                                            handleEachUserComming(roomId, pubId, pubDisplay);

                                        }
                                    }/*else{*/
                                        //send my publishers
                                        if(!onetime){
                                            handleMyPublisher(true);
                                            onetime = true;
                                        }
//                                    }


                                    break;
                                case "event":
                                    console.log("event configured "+ message["configured"]);
//                                    console.log("event joining "+ message["joining"]);
                                    var configure = message["configured"];
                                    if(configure !== null && configure !== undefined && configure === "ok"){
                                        //create answer
//                                        console.log("event configured new sdp comming "+ jsep.sdp);
                                        if(jsep !== null && jsep !== undefined)
                                            videoRoom.handleRemoteJsep({jsep: jsep});
                                    }
                                    var users = message["publishers"];
                                    console.log("event publishers "+ users);
                                    if(users !== null && users !== undefined){
                                        for(var f in users){
                                            var uId = users[f]["id"];
                                            var display = users[f]["display"];
                                            console.log("uId " + uId + "display "+ display);
                                            addUserToList(display, uId);

                                            handleEachUserComming(roomId, uId, pubDisplay);

                                        }
                                    }

                                    break;
                                default:
                                    break;

                                }
                            }
                        },
                        onlocalstream: function(mystream){
                            Janus.attachMediaStream(localVideo, mystream);
                            localName.innerHTML = myusername;
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
    console.log("type of name "+ typeof myroom);
    if(videoRoom !== null && videoRoom !== undefined){
        Janus.log("Plugin attached! (" + videoRoom.getPlugin() + ", id=" + videoRoom.getId() + ")");
        Janus.log("  -- This is a publisher/manager");
        // Prepare the username registration
        var createRoom = {
            "request": "create",
            "record": true,
            "publishers": 5,
            "room": myroom,
            "bitrate": 120,
            "description":name
        };
        videoRoom.send({"message": createRoom});
    }
});
loginBtn.addEventListener("click", function(event){
    var userName = usernameInput.value;
    if(videoRoom !== null && videoRoom !== undefined ){
        var register = { "request": "join", "room": myroom, "ptype": "publisher", "display": userName };
        myusername = userName;
        videoRoom.send({"message": register});
    }

});
function listAttendees(roomId){
    var body = {
        "request": "listparticipants",
        "room": roomId

    };
    videoRoom.send({"message": body});
}
function handleMyPublisher(useAudio){
    //need sdp
    videoRoom.createOffer({

        media: {audioRecv: true, videoRecv: true, audioSend: true, videoSend: true},
        simulcast: true,
        simulcast2: true,
        success: function(jsep){
//            Janus.debug(jsep);
//            console.log("jsep sdp "+jsep.sdp);
            // make request to send to server
            var publish = {"request": "configure", "audio": useAudio, "video": true};
            videoRoom.send({"message": publish, "jsep": jsep})
        },
        error:function(err){
            console.log("Error create offer "+ err);
        }

    });
}
addUserToList=(name, id)=>{
    //check exist
    for(var item in listUser){
        if(item.id !==  null && item.id ===id)
            return;
    }
    console.log("add name "+ name + "id "+ id);
    itemUsr.name = name;
    itemUsr.id = id;
    itemUsr.pos = count;
    listUser.push(itemUsr);
    count++;
}
getCount =(name, id)=>{
    console.log("checking id "+id + "type " +typeof id);
    console.log("lenght listUser "+ listUser.length);

    var resultObj = listUser.filter(function(o){
        return o.id == id;
    })[0];
    return resultObj;
}

function handleEachUserComming(roomId, userId, nameDisplay){
    //need create new connection
    janus.attach({
                    plugin: "janus.plugin.videoroom",
                    opequeId: opaqueId,
                    success: function(newHandleRemote){
                        remoteUser = newHandleRemote;
                        if(remoteUser !== null && remoteUser !== undefined){
                            //send attach
                            var body = {
                                    "request": "join",
                                    "ptype": "subscriber",
                                    "room": roomId,
                                    "feed": userId/*,
                                    "private_id": pri_id*/
                                };
                            console.log("Roomid "+ roomId + "feed "+userId);
                            remoteUser.send({"message": body});
                        }
                    },
                    error: function(err){
                        console.log("attach failed "+ err);
                    },
                    webrtcState: function(onActions){
                        console.log("PeerConnection "+ onActions ? "active":"down");
                    },
                    iceState: function(state){
                        console.log("ICE state "+ state);
                    },
                    mediaState: function(type, on){
                        console.log(type + on ? "Start Recv data":"Stop Recv Data");
                    },
                    onmessage: function(message, jsep){
                        var type = message["videoroom"];
                        switch(type){

                        case "attached":
                            var name = message["display"];
                            console.log("Roomid attached");

                            if(jsep !== null && jsep !== undefined){
                                remoteUser.createAnswer(
                                            {
                                                jsep: jsep,
                                                media: {audioSend: true, videoSend: true},
                                                success: function(jsep){
                                                    var reqStart = {"request": "start", "room": roomId};
                                                    remoteUser.send({"message": reqStart, "jsep": jsep});
                                                },
                                                error: function(err){
                                                    console.log("Create answer failed "+ err);
                                                }

                                });
                            }
                            break;

                        default:
                            break;
                        }
                    },
                    onlocalstream: function(mystream){

                    },
                    onremotestream: function(remotestream){
                        //
//                        if(previousName === null){
//                            previousName = nameDisplay;
//                        }
                        console.log("onremotestream name nameDisplay "+ nameDisplay +"id "+userId);
                        if(1){
                            var user =getCount(nameDisplay, userId);
                            console.log("onremotestream pos "+ user.pos);
                            switch(user.pos){
                            case 1:
                                Janus.attachMediaStream(remoteVideo1, remotestream);
                                remoteName1.innerHTML = user.name;
                                break;
                            case 2:
                                Janus.attachMediaStream(remoteVideo2, remotestream);
                                remoteName2.innerHTML = user.name;
                                break;
                            case 3:
                                Janus.attachMediaStream(remoteVideo3, remotestream);
                                remoteName3.innerHTML = user.name;
                                break;
                            default:
                                break;
                            }
                        }

                    },
                    oncleanup: function(reason){
                        console.log("Webrtc peerConnection close "+reason);
                    }

                 });
}
