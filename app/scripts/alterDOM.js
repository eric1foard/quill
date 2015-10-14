'use strict';
//logic for  DOM manipulations

//REQUIRED MODULES
var P2P = require('./P2P');
var util = require('./util');
var $ = require('jquery');
var alterDOM = require('./alterDOM');


function bindCallClick(peer, stream, peerName) {
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
            P2P.dataConnectPeer(peer, otherPeer, stream, peerName);
        }
    });
}

function resizePeerVids() {
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

function resizeLocalMedia() {
    $('#localMedia').width($('#localMediaContainer').width());
}

function resizeVids() {
    resizePeerVids();
    resizeLocalMedia();
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

function bindHangUp(call, otherPeer) {
    var button = document.createElement('button');
    button.className = 'hangup btn btn-danger';

    var pos = $('#'+otherPeer).position();
    button.style.top = pos.top;
    button.style.left = pos.left;

    button.appendChild(document.createTextNode('hang up'));

    button.addEventListener('click', function() {
        var newPeers = P2P.getPeers().filter(function (p) {
            return p!==otherPeer;
        });
        P2P.setPeers(newPeers);

        call.close();
    });

    return button;
}

function showPeerMedia(stream, call, otherPeer) {

    if (!document.getElementById(otherPeer)) {

        try {

            //container for video and hangup button
            var div = document.createElement('div');
            div.setAttribute('class', 'peerVideoCont');
            div.setAttribute('id', 'cont'+otherPeer);

            var video = document.createElement('video');
            video.src = window.URL.createObjectURL(stream);
            video.setAttribute('class', 'peerVideo');
            video.setAttribute('id', otherPeer);

            var videoContainer = document.querySelector('#videoContainer');
            div.appendChild(video);
            videoContainer.appendChild(div);

            resizeVids();
            video.play();

            //need position of video, so append after resizeVids
            var button = bindHangUp(call, otherPeer);
            div.appendChild(button);
        }
        catch(error) {
            alterDOM.makeAlert('there was a problem displaying ',otherPeer,'\'s video.');
            console.log('there was a problem displaying ',otherPeer,'\'s video. ',error);
        }
    }
}

function removePeerVideo(otherPeer) {
    var videoContainer = document.querySelector('#videoContainer');
    if (document.getElementById('cont'+otherPeer)) {
        videoContainer.removeChild(document.getElementById('cont'+otherPeer));
    }
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
exports.removePeerVideo = removePeerVideo;
