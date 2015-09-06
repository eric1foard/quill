var speechRecord = [{author: 'Eric Foard', text: 'hey hey with the monkeys'}]; 

function transcribe(peerID) {
    window.SpeechRecognition =
    window.webkitSpeechRecognition ||
    null;

    if (window.SpeechRecognition === null) {
        //TODO: display error!
        console.log('could not locate speech recognizer');
    }
    else {
        try {
            var speechRecog = new window.SpeechRecognition();
            module.exports.wksr = speechRecog;
            

            //keep recording if user is silent
            //speechRecog.continuous = true;
            //show speech before onResult event fires
            //speechRecog.interimResults = true;

            speechRecog.onresult = function(event) {
            	var result = '';
                for (var i = event.resultIndex; i < event.results.length; i++) {
                    result += event.results[i][0].transcript;
                }
                //console.log('from onresult ',result);
                speechRecord.push({author: peerID, text: result});
            };

            speechRecog.onend = function() {
                console.log('restarted speechRecog!');
                //if (dataCon.open) {
                    speechRecog.start();
                //}
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

module.exports.speechRecord = speechRecord;
module.exports.transcribe = transcribe;