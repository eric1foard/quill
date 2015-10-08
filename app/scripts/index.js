'use strict';
//Main module

//REQUIRED MODULES
var $ = require('jquery');
var Peer = require('peerjs');
var P2P = require('./P2P');
var alterDOM = require('./alterDOM');
var speechToText = require('./speechToText');
var modal = require('./modal');

//on load, display instructions & prompt for custom peer id
modal.showModal();

//On ready, get mic and video data to ready P2P connectivity and init peer object
document.addEventListener('DOMContentLoaded', function() {
    speechToText.bindDownloadClick();

    navigator.webkitGetUserMedia({ video: {
        mandatory: { maxWidth: 1280, maxHeight: 720, minWidth: 1280, minHeight: 720, }},
        audio: true },
        function (stream) {
            //var peer = new Peer({key: 'xwx3jbch3vo8yqfr'});  //for testing
            var peer = new Peer({host:'arcane-island-4855.herokuapp.com', secure:true, port:443, key: 'peerjs'});
            P2P.makePeerHeartbeater(peer);

            peer.on('open', function(id) {
                P2P.peers.push(id);
                document.querySelector('#myID').value = id;
                alterDOM.showMyMedia(stream);
            });

            alterDOM.bindCallClick(peer, stream);
            P2P.handleIncomingCall(peer, stream);
            P2P.handleIncomingData(peer, stream);

        }, function (err) {console.error(err);});

        $(window).resize(function () {
            alterDOM.resizeVids();
        });

    }, false);
