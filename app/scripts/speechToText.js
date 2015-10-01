'use strict';
// Speech to text logic

//REQUIRED MODULES
var alterDOM = require('./alterDOM');

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
      console.log('error from transcribe: ',error.message);
    }
  }
}

exports.transcribe = transcribe;
