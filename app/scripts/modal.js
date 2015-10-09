'use strict';

var EventEmitter = require('events').EventEmitter;
var basicModal = require('basicModal');


function setModalHTML(error) {

    if (error) {

        if (error.type === 'unavailable-id') {
            return'<center><h3>the ID you\'ve chosen is in use!</h3></center>'+
            '<p>Try another alphanumeric ID.</p>';
        }

        if (error.type === 'invalid-id') {
            return '<center><h3>You\'ve chosen an invalid ID</h3></center>'+
            '<p>You probably used a character other than a letter or number. Try another alphanumeric ID!</p>';
        }
    }

    else {
        return '<center><h1>Welcome to Quill!</h1></center>'+
        '<p>Please enter an alphanumeric peer id. You can share it with others to start a call. Enjoy!</p>'+
        '<b><p>The transcript will be most accurate if you use headphones. Try it out!</p></b>';
    }
}

var showModal = function(error, emitter) {

    if (!emitter) {
        emitter = new EventEmitter();
    }

    var bodyHTML = setModalHTML(error);

    basicModal.show({
        // String containing HTML (required)
        body: bodyHTML+
        '<input id="modal_text" class="basicModal__text" type="text" placeholder="peer id" name="peer_id">',

        // String - List of custom classes added to the modal (optional)
        //class: 'customClass01 customClass02',

        // Boolean - Define if the modal can be closed with the close-function (optional)
        closable: true,

        // Function - Will fire when modal is visible (optional)
        //callback: undefined,

        // Object - basicModal accepts up to two buttons and requires at least one of them
        buttons: {

            cancel: {

                // String (optional)
                title: 'Leave Quill',

                // String - List of custom classes added to the button (optional)
                class: 'customButtonClass',

                // Function - Will fire when user clicks the button (required)
                fn: function() {
                    window.close();
                }

            },

            action: {

                // String (optional)
                title: 'Continue',

                // String - List of custom classes added to the button (optional)
                class: 'customButtonClass',

                // Function - Will fire when user clicks the button (required)
                fn: function() {
                    var myPeerID = basicModal.getValues().peer_id;
                    if (myPeerID === '') {
                        document.getElementById('modal_text').placeholder =
                        'please enter an alphanumeric id';
                        basicModal.error('peer_id');
                    }
                    else if (!myPeerID.match(/^[a-z0-9]+$/i)) {
                        document.getElementById('modal_text').value = '';
                        document.getElementById('modal_text').placeholder =
                        'peer id must contain letters and numbers only';
                        basicModal.error('peer_id');
                    }
                    else {
                        //valid peerid ready to be sent to signaling server
                        emitter.emit('peerid', myPeerID);
                        basicModal.close();
                        console.log('peerid event emitted ',myPeerID);
                    }
                }
            }
        }
    });
    
    return emitter;

};

exports.showModal = showModal;
