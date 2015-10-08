'use strict';

var basicModal = require('basicModal');

var welcomeText = 'Please enter an alphanumeric peer id. This ID will identify you in the transcript, and you can share it with others to start a call. Enjoy!';
var notice = 'Your Quill experience will be best with headphones. Otherwise we\'ll write down what we hear from the speakers. Try it out!';

var modal = {
    // String containing HTML (required)
    body: '<center><h1>Welcome to Quill!</h1></center>'+
    '<p>'+welcomeText+'</p>'+
    '<p>'+notice+'</p>'+
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
                    console.log('hey it works');
                }
            }
        }
    }
};

var showModal = function() {
    basicModal.show(modal);
};

exports.showModal = showModal;
