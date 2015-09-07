'use strict';

var React = require('react');
var LocalMediaStream = require('./LocalMediaStream');
var Peer = require('peerjs');


var Quill = React.createClass({
	getInitialState: function() {
		return {
			myPeer: {}
		};
	},
	render: function() {
		return (
			<div className="quill">
			<h1>Welcome To Quill!</h1>
			</div>
		);
	},
  componentDidMount: function () {
		try {
			var peer = new Peer({key: 'xwx3jbch3vo8yqfr'});
			this.setState({myPeer: peer});
			peer.on('open', function(id) {
				//TODO: display own peerID to user
		});
		console.log('myPeer, ',this.state.myPeer);
		} catch (e) {
			console.log('error from Main componentDidMount, ', e);
		}
}
});

React.render(<Quill />, document.getElementById('content'));
