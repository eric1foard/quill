'use strict';
document.addEventListener('DOMContentLoaded', function() {

    console.log('hello');

    //set getUserMedia to browser-specific version
    //only Chrome, FireFox, Opera are supported
    navigator.getUserMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

    navigator.getUserMedia({ video: true, audio: true }, function (stream) {
        var Peer = require('peerjs');
        var peer = new Peer({key: 'xwx3jbch3vo8yqfr'});
        var button = document.querySelector('#connect');

      //display user's peer ID
      peer.on('open', function(id) {
        document.querySelector('#myID').value = id;
        var video = document.createElement('video');
        document.body.appendChild(video);
        video.src = window.URL.createObjectURL(stream)
        video.play()
    });

      //on click, make call to peer
      button.addEventListener('click', function () {
        var otherPeer = document.querySelector('#peerID').value;
        if (otherPeer.length<=0) {
            alert('please enter a peer ID!');
        }

        else {
            console.log('calling peer...');
            peer.call(otherPeer, stream);
        }
    });

      //handle incoming call
      peer.on('call', function () {
        console.log('answering call!');
        call.answer(stream);
    });

  }, function (err) {console.error(err);});


}, false);
