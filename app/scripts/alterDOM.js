'use strict';
//logic for  DOM manipulations

//REQUIRED MODULES
var P2P = require('./P2P');
var util = require('./util');
var $ = require('jquery');
var alterDOM = require('./alterDOM');


function bindCallClick(peer, stream) {
  var button = document.querySelector('#connect');

  button.addEventListener('click', function () {
    var otherPeer = document.querySelector('#peerID').value;

    if (otherPeer.length<=0) {
      //TODO: display something to user
      alterDOM.makeAlert('please enter a peer ID!');
    }

    else {
      document.querySelector('#peerID').value = '';
      P2P.callPeer(peer, otherPeer, stream);
      P2P.dataConnectPeer(peer, otherPeer, stream);
    }
  });
}

function resizeVids() {
  var numVids = $('.peerVideo').length;
  var parentWidth = $('#videoContainer').width();
  if (numVids>1) {
    var numVidsWide = Math.sqrt(util.nextSquare(numVids));
    $('.peerVideo').width((parentWidth/numVidsWide)-10);
  }
  else {
    $('.peerVideo').width(parentWidth);
  }
}

function logTranscript(message) {
  console.log('from logTranscript');
  var entry = document.createElement('div');
  entry.className = 'message';
  var mes = document.createTextNode(message);
  entry.appendChild(mes);
  document.querySelector('#transcript').appendChild(entry);
}

function showMyMedia(stream) {
  var video = document.createElement('video');
  video.setAttribute('id', 'localMedia');
  video.src = window.URL.createObjectURL(stream);
  //prevent audio feedback
  video.muted = true;
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
    alterDOM.makeAlert('there was a problem displaying ',otherPeer,'\'s video. ');
    console.log('there was a problem displaying ',otherPeer,'\'s video. ',error);
  }
}

function showHangUp(call, otherPeer) {
  var button = document.createElement('button');
  button.id = 'hangup'+otherPeer;
  button.appendChild(document.createTextNode('Hang Up Call'));
  button.addEventListener('click', function() {
    call.close();
    P2P.peers = P2P.peers.filter(function (p) {
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

function makeAlert(message) {
  var alerts = document.querySelector('#alerts');
  var alert = document.createElement('div');
  alert.className = 'alert alert-danger';
  var close = document.createElement('a');
  close.setAttribute('href', '#');
  close.className = 'close';
  close.setAttribute('data-dismiss','alert');
  close.setAttribute('aria-label','close');
  var x = document.createTextNode('x');
  close.appendChild(x);
  var msg = document.createTextNode(message);
  alert.appendChild(msg);
  alert.appendChild(close);
  alerts.appendChild(alert);
}

exports.makeAlert = makeAlert;
exports.bindCallClick = bindCallClick;
exports.resizeVids = resizeVids;
exports.logTranscript = logTranscript;
exports.showMyMedia = showMyMedia;
exports.showPeerMedia = showPeerMedia;
exports.showHangUp = showHangUp;
exports.removePeerVideo = removePeerVideo;
