'use strict';
//Peer to Peer connection logic

//REQUIRED MODULES
var SpeechToText = require('./SpeechToText');
var alterDOM = require('./alterDOM');

//array of peers in call
var peers = [];

function callPeer(peer, otherPeer, stream) {
  if (peers.indexOf(otherPeer)>=0) {
    alterDOM.makeAlert('you are already connected with this peer!');
  }

  else {
    var call = peer.call(otherPeer, stream);

    call.on('stream', function(stream) {
      //record that otherPeer is in the call
      peers.push(otherPeer);
      console.log('streaming call!');
      alterDOM.showPeerMedia(stream, call, otherPeer);
    });

    call.on('close', function() {
      console.log('call with ',otherPeer,' has ended!');
      alterDOM.removePeerVideo(otherPeer);
      peers = peers.filter(function(p) {
        return p!==otherPeer;
      });
    });

    call.on('error', function(error) {
      alterDOM.makeAlert('there was a problem completing the call: '+error.type+ '. Try again!');
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
      alterDOM.showPeerMedia(stream, call, otherPeer);
    });

    call.on('close', function() {
      console.log('call has ended!');
      alterDOM.removePeerVideo(otherPeer);
      peers = peers.filter(function(p) {
        return p!==otherPeer;
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

// DATA CONNECTION
function dataConnectPeer(peer, otherPeer, stream) {
  var dataCon = peer.connect(otherPeer);
  dataCon.on('open', function() {
    SpeechToText.transcribe(peer.id, dataCon);
    //send peers I'm connected to; same as yours?
    dataCon.send({peers: peers});
    dataCon.on('data', function(data) {
      if (data.script) {
        alterDOM.logTranscript(data.script);
      }
      if (data.peers) {
        handleNewPeers(data, peer, stream);
      }
    });
  });

  dataCon.on('error', function(error) {
    alterDOM.makeAlert('there was a problem with the data connection: '+error.type+ '. Try again!');
  });
}

 function handleIncomingData(peer, stream) {
  peer.on('connection', function(dataCon) {
    SpeechToText.transcribe(peer.id, dataCon);
    dataCon.on('open', function () {
      dataCon.send({peers: peers});
      dataCon.on('data', function(data) {
        if (data.script) {
          console.log('revieved data');
          alterDOM.logTranscript(data.script);
        }
        if (data.peers) {
          handleNewPeers(data, peer, stream);
        }
      });
    });
  });
}

//I DIDN'T WRITE THIS FUNCTION
//source:
function makePeerHeartbeater(peer) {
  var timeoutId = 0;
  function heartbeat () {
    timeoutId = setTimeout( heartbeat, 20000 );
    if ( peer.socket._wsOpen() ) {
      peer.socket.send( {type:'HEARTBEAT'} );
    }
  }
  // Start
  heartbeat();
  // return
  return {
    start : function () {
      if ( timeoutId === 0 ) { heartbeat(); }
    },
    stop : function () {
      clearTimeout( timeoutId );
      timeoutId = 0;
    }
  };
}

exports.peers = peers;
exports.callPeer = callPeer;
exports.handleIncomingCall = handleIncomingCall;
exports.dataConnectPeer = dataConnectPeer;
exports.handleIncomingData = handleIncomingData;
exports.makePeerHeartbeater = makePeerHeartbeater;
