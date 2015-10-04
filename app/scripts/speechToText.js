'use strict';
// Speech to text logic

//REQUIRED MODULES
var alterDOM = require('./alterDOM');

//buffer for transcript
var text = '';

function transcriptAppend(message) {
  text += message + '\n';
}

function transcribe(peerID, dataCon) {
  window.SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  null;

  if (window.SpeechRecognition === null) {
    alterDOM.makeAlert('could not locate speech recognizer');
  }
  else {

    try {
      var speechRecog = new window.SpeechRecognition();

      //keep recording if user is silent
      //speechRecog.continuous = true;
      //show speech before onResult event fires
      //speechRecog.interimResults = true;

      speechRecog.onresult = function(event) {
        var transcript = '';
        for (var i = event.resultIndex; i < event.results.length; i++) {
          if (i === 0) {
            transcript = peerID+': '+event.results[i][0].transcript;
          }
          else {
            transcript += event.results[i][0].transcript;
          }
          dataCon.send({script: transcript});
        }
        transcriptAppend(transcript);
        alterDOM.logTranscript(transcript);
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
      alterDOM.makeAlert('error when transcribing: '+error.message);
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

exports.transcriptAppend = transcriptAppend;
exports.bindDownloadClick = bindDownloadClick;
exports.transcribe = transcribe;
