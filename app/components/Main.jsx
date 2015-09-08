'use strict';

var React = require('react');
var LocalMediaStream = require('./LocalMediaStream.jsx');
var OtherPeers = require('./OtherPeers.jsx');
var CallPeerForm = require('./CallPeerForm.jsx');
var Peer = require('peerjs');


var Quill = React.createClass({
	getInitialState: function() {
		return {
			myPeer: {},
			myPeerID: '',
			myStream: new Blob(),
			peers: []
		};
	},
	render: function() {
		return (
			<div className="quill">
				<h1>Welcome To Quill!</h1>
				<LocalMediaStream myStream={this.state.myStream} />
					<OtherPeers peers={this.state.peers} />
					<CallPeerForm myStream={this.state.myStream} callPeer={this.callPeer}
						myPeerID={this.state.myPeerID} myPeer={this.state.myPeer} />
			</div>
		);
	},
	componentDidMount: function () {
		try {
			var peer = new Peer({key: 'xwx3jbch3vo8yqfr'});
			peer.on('open', function (id) {
				this.setState({myPeer: peer});
				this.setState({myPeerID: id});
				initLocalMediaStream(this);
				handleIncomingCall(peer, this.state.MyStream, this);
			}.bind(this));
		} catch (e) {
			console.log('error from Main componentDidMount, ', e);
		}

	},
	 callPeer: function (peer, otherPeer, myStream) {
	    if (this.state.peers.indexOf(otherPeer)>=0) {
	        console.log('you are already connected with this peer!');
	    }
	    else {
	        var call = peer.call(otherPeer, myStream);
	        call.on('stream', function(stream) {
	                this.setState({peers: this.state.peers.concat({peerID: otherPeer, stream: stream})});
									console.log('from callPeer ',this.state.peers);
	            }.bind(this));

	        call.on('close', function() {
	            console.log('call with ',otherPeer,' has ended!');
							var updatedPeers = this.state.peers.filter(function(p) {
								return p.peerID!==otherPeer;
			        });
							this.setState({peers: updatedPeers});
							console.log('after end call: ',this.state.peers);
	        }.bind(this));

	        call.on('error', function(error) {
	                //TODO: display error message to user
	                console.log(error.type);
	            });
	    }
	}
});

function initLocalMediaStream(anchor) {
  navigator.getUserMedia = ( navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

	navigator.getUserMedia({ video: true, audio: false },
		function (stream) {
		this.setState({myStream: stream});
	}.bind(anchor),
	function (err) {
		console.log('there was a problem when we tried to access your camera!',
	err);
	});
}

function handleIncomingCall(peer, myStream, anchor) {
  peer.on('call', function (call) {
    var otherPeer = call.peer;

    console.log('answering call!');
    call.answer(myStream);

    call.on('stream', function(stream) {
        console.log('streaming call!');
				this.setState({peers: this.state.peers.concat({peerID: otherPeer, stream: stream})});
				console.log('peers after answer: ', this.state.peers);
    }.bind(anchor));

    call.on('close', function() {
        console.log('call has ended!');
        var updatedPeers = this.state.peers.filter(function(p) {
            return p.peerID!==otherPeer;
        });
				this.setState({peers: updatedPeers});
				console.log('peers after close: ', this.state.peers);
    }.bind(anchor));
});
}

React.render(<Quill />, document.getElementById('content'));
