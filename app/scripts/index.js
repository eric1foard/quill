'use strict';

//GLOBAL VARS
//keep track of who is in the call
var peers = [];
//data connection object
var dataCon;

//HELPER FUNCTIONS

//DOM MANIPULATION
function showMedia(stream, otherPeer) {
    try {
        console.log('from show media, ',otherPeer);
      var video = document.createElement('video');
      video.setAttribute('id', otherPeer);
      document.body.appendChild(video);
      video.src = window.URL.createObjectURL(stream);
      video.play();
  }
  catch(error) {
    console.log('there was a problem displaying ',otherPeer,'\'s video. ',error);
}
}

function showHangUp(call, otherPeer) {
    var button = document.createElement('button');
    button.id = 'hangup'+otherPeer;
    button.appendChild(document.createTextNode('Hang Up Call'));
    button.addEventListener('click', function() {
        call.close();
        peers = peers.filter(function (p) {
            return p!==otherPeer;
        });
    });
    document.body.appendChild(button);
}

function removePeerVideo(otherPeer) {
    document.body.removeChild(document.getElementById('hangup'+otherPeer));
    document.body.removeChild(document.getElementById(otherPeer));
}

function bindCallClick(peer, stream) {
    var button = document.querySelector('#connect');

    button.addEventListener('click', function () {
        var otherPeer = document.querySelector('#peerID').value;

        if (otherPeer.length<=0) {
            //TODO: display something to user
            console.log('please enter a peer ID!');
        }

        else {
            document.querySelector('#peerID').value = '';
            callPeer(peer, otherPeer, stream);
            dataConnectPeer(peer, otherPeer, stream);
        }
    });
}

//MEDIA CONNECTION
function callPeer(peer, otherPeer, stream) {
    if (peers.indexOf(otherPeer)>=0) {
        console.log('you are already connected with this peer!');
    }

    else {
        var call = peer.call(otherPeer, stream);
        console.log('calling peer...');

        call.on('stream', function(stream) {
                //record that otherPeer is in the call
                peers.push(otherPeer);
                console.log('streaming call!');
                showMedia(stream, otherPeer);
                showHangUp(call, otherPeer);
            });

        call.on('close', function() {
            console.log('call with ',otherPeer,' has ended!');
            removePeerVideo(otherPeer);
            peers = peers.filter(function(p) {
                return p!==otherPeer;
            });
        });

        call.on('error', function(error) {
                //TODO: display error message to user
                console.log(error.type);
            });
    }
}

function handleIncomingCall(peer, stream) {
  peer.on('call', function (call) {
    var otherPeer = call.peer;

    console.log('answering call!');
    peers.push(otherPeer);
    call.answer(stream);

    call.on('stream', function(stream) {
        console.log('streaming call!');
        showMedia(stream, otherPeer);
        showHangUp(call, otherPeer);
    });

    call.on('close', function() {
        console.log('call has ended!');
        removePeerVideo(otherPeer);
        peers = peers.filter(function(p) {
            return p!==otherPeer;
        });
    });
});
}

// DATA CONNECTION
function dataConnectPeer(peer, otherPeer, stream) {
  dataCon = peer.connect(otherPeer);
  var textArea = document.querySelector('textArea');

  dataCon.on('open', function() {
    transcribe(peer.id, dataCon);
    //send peers I'm connected to; same as yours?
    dataCon.send({peers: peers});
    dataCon.on('data', function(data) {
        if (data.script) {
         console.log('recived 1 ', data.script);
         textArea.value+='\n'+data.script;
     }
     handleNewPeers(data, peer, stream);
 });
});

  dataCon.on('error', function(error) {
        //TODO: display error message to user
        console.log(error.type);
    });
}

function handleIncomingData(peer) {
    peer.on('connection', function(dataCon) {
        console.log('from ',handleIncomingData);
        transcribe(peer.id, dataCon);
        dataCon.send({peers: peers});
        dataCon.on('data', function(data) {
            if (data.script) {
              var textArea = document.querySelector('textArea');
              textArea.value+='\n'+data.script;  
          }
          handleNewPeers(data, peer);
      });
    });
}

function handleNewPeers(data, peer, stream) {
    if (data.peers) {
        console.log('from handleNewPeers, ', data.peers);
        var candidates = data.peers;
        var newPeers = candidates.filter(function(p) {
            return peers.indexOf(p)<0;
        });
        console.log('new peers: ',newPeers);

        if (newPeers.length>0) {
            //peers = peers.concat(newPeers);
            newPeers.map(function(p) {
                callPeer(peer, p, stream);
            });
        }
    }
}

// SPEECH TO TEXT
function transcribe(peerID, dataCon) {
    window.SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null;

    if (window.SpeechRecognition === null) {
        //TODO: display error!
        console.log('could not locate speech recognizer');
    }
    else {

        try {
            var speechRecog = new window.SpeechRecognition();
            var transcript = document.querySelector('textArea');

            //keep recording if user is silent
            speechRecog.continuous = true;
            //show speech before onResult event fires
            //speechRecog.interimResults = true;

            speechRecog.onresult = function(event) {
                transcript.value+=peerID+':';
                dataCon.send({script: peerID+':'});
                for (var i = event.resultIndex; i < event.results.length; i++) {
                    transcript.value += event.results[i][0].transcript;
                    dataCon.send({script: event.results[i][0].transcript});
                }
            };
            speechRecog.start();
            console.log('listening...');
        }
        catch(error) {
            //TODO: display error to user
            console.log('error from transcribe: ',error.message);
        }
    }
}

//MAIN FUNCTION

document.addEventListener('DOMContentLoaded', function() {
    navigator.getUserMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

    navigator.getUserMedia({ video: true, audio: true }, function (stream) {
        var Peer = require('peerjs');
        var peer = new Peer({key: 'xwx3jbch3vo8yqfr'});
        //var peer = new Peer({host:'arcane-island-4855.herokuapp.com', secure:true, port:443, key: 'peerjs', debug: 3});
        console.log('peer ',peer);

        //display user's peer ID
        peer.on('open', function(id) {
          peers.push(id);
          document.querySelector('#myID').value = id;
          showMedia(stream);
      });

        bindCallClick(peer, stream);
        handleIncomingCall(peer, stream);
        handleIncomingData(peer);

    }, function (err) {console.error(err);});
}, false);