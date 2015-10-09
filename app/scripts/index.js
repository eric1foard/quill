'use strict';
//Main module

//REQUIRED MODULES
var $ = require('jquery');
var P2P = require('./P2P');
var alterDOM = require('./alterDOM');
var speechToText = require('./speechToText');
var modal = require('./modal');

//on load, display instructions & prompt for custom peer id
var emitter = modal.showModal();

//On ready, get mic and video data to ready P2P connectivity and init peer object
document.addEventListener('DOMContentLoaded', function() {

    speechToText.bindDownloadClick();

    navigator.webkitGetUserMedia({ video: {
        mandatory: { maxWidth: 1280, maxHeight: 720, minWidth: 1280, minHeight: 720, }},
        audio: true },
        function (stream) {

            alterDOM.showMyMedia(stream);

            emitter.on('peerid', function (myPeerId) {
                console.log('peerID event recieved ',myPeerId);
                P2P.initPeer(myPeerId, stream, emitter);
            });

        }, function (err) {console.error(err);});

        $(window).resize(function () {
            alterDOM.resizeVids();
        });

    }, false);
