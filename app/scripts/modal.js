'use strict';

var EventEmitter = require('events').EventEmitter;
var basicModal = require('basicModal');

function setModalHTML() {
    return '<center><h1>Welcome to Quill!</h1></center>'+
    '<p>Please enter a name we can use to identify you in the transcript.\n'+
    'To start a call, share your Peer ID with a friend or get theirs. \n</p>'+
    '<p><b>To achieve an accurate transcript, it is important that you use headphones '+
    'and are in a realtively quiet place.</b>\n'+
    'You\'re ready to start a call! Enjoy!</p>';
}

function submitName(event) {
    var input = document.querySelector('#modal_text');
    if (typeof(input !== 'undefined') &&
        (input === document.activeElement) &&
        (event.keyCode === 13)) {
            basicModal.action();
    }
}

var showModal = function(emitter) {
    if (!emitter) {
        emitter = new EventEmitter();
    }

    var bodyHTML = setModalHTML();

    document.addEventListener('keypress', submitName);

    basicModal.show({
        // String containing HTML (required)
        body: bodyHTML+
        '<input id="modal_text" class="basicModal__text" type="text" placeholder="peer name" name="peer_name">',

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
                    document.removeEventListener('keypress', submitName);
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
                    var peerName = basicModal.getValues().peer_name;
                    if (peerName === '') {
                        document.getElementById('modal_text').placeholder =
                        'your name should be alphanumeric and not blank';
                        basicModal.error('peer_name');
                    }
                    else if (!peerName.match(/^[a-z0-9]+$/i)) {
                        document.getElementById('modal_text').value = '';
                        document.getElementById('modal_text').placeholder =
                        'name must contain letters and numbers only';
                        basicModal.error('peer_name');
                    }
                    else {
                        //valid peerid ready to be sent to signaling server
                        emitter.emit('peerName', peerName);
                        document.querySelector('#myID').setAttribute('placeholder', 'fetching id...');
                        document.removeEventListener('keypress', submitName);
                        basicModal.close();
                        console.log('peerName event emitted ',peerName);
                    }
                }
            }
        }
    });



    return emitter;

};

exports.showModal = showModal;
