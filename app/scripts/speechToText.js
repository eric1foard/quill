'use strict';
// Speech to text logic

//REQUIRED MODULES
var alterDOM = require('./alterDOM');

// buffer for transcript
var text = '';
// window.SpeechRecognition object
var speechRecog;

function initRecognizer() {
    window.SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null;

    if (window.SpeechRecognition === null) {
        alterDOM.makeAlert('could not locate speech recognizer');
    }
    else {

        try {
            speechRecog = new window.SpeechRecognition();
        }

        catch(e) {
            console.log('error initializing speech recognizer');
            alterDOM.makeAlert('there was a problem, try restarting the app');
        }
    }
}

function transcriptAppend(message) {
    text += message + '\n';
}

function transcribe(peerName, dataCon) {

    if (window.SpeechRecognition === null) {
        alterDOM.makeAlert('could not locate speech recognizer');
    }
    else {

        try {
            if (typeof(speechRecog) === 'undefined') {
                initRecognizer();
            }
            //keep recording if user is silent
            //speechRecog.continuous = true;
            //show speech before onResult event fires
            //speechRecog.interimResults = true;

            speechRecog.onresult = function(event) {
                var transcript = '';
                for (var i = event.resultIndex; i < event.results.length; i++) {
                    if (i === 0) {
                        transcript = peerName+': '+event.results[i][0].transcript;
                    }
                    else {
                        transcript += event.results[i][0].transcript;
                    }
                    dataCon.send({script: transcript});
                }
                transcriptAppend(transcript);
                alterDOM.logTranscript(transcript);
            };

            // speechRecog.onerror = function (event) {
            //     console.log('error from speechRecog', event);
            // };

            speechRecog.onend = function() {
                if (dataCon.open) {
                    speechRecog.start();
                }
            };

            speechRecog.start();
            console.log('listening...');

        }
        catch(error) {
            console.log('error when transcribing: '+error.message);
        }
    }
}

function bindDownloadClick() {
    var a = document.getElementById('download');

    a.addEventListener('click', function() {
        if (text === '') {
            alterDOM.makeAlert('transcript is empty!');
        }
        else {
            console.log('from bindDownloadClick');
            var file = new Blob([text]);
            var url = window.URL.createObjectURL(file);
            var date = new Date();
            a.setAttribute('download', date.getTime().toString());
            a.setAttribute('href', url);
        }
    });
}

function stopRecog() {
    if (typeof(speechRecog) !== 'undefined') {
        console.log('stopped recognition');
        speechRecog.stop();
    }
}

function init() {
    bindDownloadClick();
    initRecognizer();
}

exports.stopRecog = stopRecog;
exports.init = init;
exports.transcriptAppend = transcriptAppend;
exports.transcribe = transcribe;
