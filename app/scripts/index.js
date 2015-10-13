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

    speechToText.init();

    navigator.webkitGetUserMedia({ video: {
        mandatory: { maxWidth: 1280, maxHeight: 720, minWidth: 1280, minHeight: 720, }},
        audio: true },
        function (stream) {

            alterDOM.showMyMedia(stream);

            emitter.on('peerName', function (peerName) {
                console.log('peerName event recieved ',peerName);
                P2P.initPeer(peerName, stream);
            });

        }, function (err) {console.error(err);});

        $(window).resize(function () {
            alterDOM.resizeVids();
        });
        
    }, false);
