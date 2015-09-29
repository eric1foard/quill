'use strict';

//GLOBAL VARS
//keep track of who is in the call
var peers = [];
var $ = require('jquery');

//HELPER FUNCTIONS

function nextSquare(n) {
  var square = false;
  while (!square) {
    if (Number.isInteger(Math.sqrt(n))) {
      square = true;
    }
    else {
      n++;
    }
  }
  return n;
}

function resizeVids() {
  var numVids = $('.peerVideo').length;
  var parentWidth = $('#videoContainer').width();
  if (numVids>1) {
    var numVidsWide = Math.sqrt(nextSquare(numVids));
    $('.peerVideo').width((parentWidth/numVidsWide)-10);
  }
  else {
    $('.peerVideo').width(parentWidth);
  }
}

function logTranscript (message) {
  console.log('from logTranscript');
  var entry = document.createElement('div');
  entry.className = 'message';
  var mes = document.createTextNode(message);
  entry.appendChild(mes);
  document.querySelector('#tools').appendChild(entry);
}


function showMyMedia(stream) {
  var video = document.createElement('video');
  video.setAttribute('id', 'localMedia');
  video.src = window.URL.createObjectURL(stream);
  var parentWidth = $('#localMediaContainer').width();
  $('#localMediaContainer').append(video);
  $('#localMedia').width(parentWidth);
  video.play();
}

function showPeerMedia(stream, otherPeer) {
  try {
    var video = document.createElement('video');
    video.setAttribute('id', otherPeer);
    video.setAttribute('class', 'peerVideo');
    var videoContainer = document.querySelector('#videoContainer');
    videoContainer.appendChild(video);
    video.src = window.URL.createObjectURL(stream);
    resizeVids();
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
  //document.body.removeChild(document.getElementById('hangup'+otherPeer));
  var videoContainer = document.querySelector('#videoContainer');
  videoContainer.removeChild(document.getElementById(otherPeer));
  resizeVids();
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
      showPeerMedia(stream, otherPeer);
      //showHangUp(call, otherPeer);
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
      showPeerMedia(stream, otherPeer);
      //showHangUp(call, otherPeer);
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
  var dataCon = peer.connect(otherPeer);
  dataCon.on('open', function() {
    transcribe(peer.id, dataCon);
    //send peers I'm connected to; same as yours?
    dataCon.send({peers: peers});
    dataCon.on('data', function(data) {
      if (data.script) {
        logTranscript(data.script);
      }
      if (data.peers) {
        handleNewPeers(data, peer, stream);
      }
    });
  });

  dataCon.on('error', function(error) {
    //TODO: display error message to user
    console.log(error.type);
  });
}

function handleIncomingData(peer, stream) {
  peer.on('connection', function(dataCon) {
    transcribe(peer.id, dataCon);
    dataCon.on('open', function () {
      dataCon.send({peers: peers});
      dataCon.on('data', function(data) {
        if (data.script) {
          console.log('revieved data');
          logTranscript(data.script);
        }
        handleNewPeers(data, peer, stream);
      });
    });
  });
}

function handleNewPeers(data, peer, stream) {
  console.log('from handleNewPeers, ', data.peers);
  var newPeers = data.peers.filter(function(p) {
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
      var transcript = '';

      //keep recording if user is silent
      //speechRecog.continuous = true;
      //show speech before onResult event fires
      //speechRecog.interimResults = true;

      speechRecog.onresult = function(event) {
        transcript += peerID+':';
        dataCon.send({script: peerID+':'});
        for (var i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          dataCon.send({script: event.results[i][0].transcript});
        }
        logTranscript(transcript);
      };

      speechRecog.onend = function() {
        console.log('restarted speechRecog!');
        if (dataCon.open) {
          speechRecog.start();
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

//MAIN

document.addEventListener('DOMContentLoaded', function() {
  navigator.getUserMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

    navigator.getUserMedia({ video: {
      mandatory: { maxWidth: 1280, maxHeight: 720, minWidth: 1280, minHeight: 720, }},
      audio: true },
      function (stream) {
        var Peer = require('peerjs');
        //var peer = new Peer({key: 'xwx3jbch3vo8yqfr'});
        var peer = new Peer({host:'arcane-island-4855.herokuapp.com', secure:true, port:443, key: 'peerjs'});
        console.log('peer ',peer);

        //display user's peer ID
        peer.on('open', function(id) {
          peers.push(id);
          document.querySelector('#myID').value = id;
          showMyMedia(stream);
        });

        bindCallClick(peer, stream);
        handleIncomingCall(peer, stream);
        handleIncomingData(peer, stream);

      }, function (err) {console.error(err);});

      $(window).resize(function () {
        console.log('window resized');
        resizeVids();
      });

    }, false);
