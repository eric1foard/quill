'use strict';

var React = require('react');
var speechRecog = require('./transcribe');

console.log('listening...');
speechRecog.transcribe('test123');
var data = speechRecog.speechRecord;

var Quill = React.createClass({
	getInitialState: function() {
		console.log('from getInitialState ',data);
		return {data: data};
	},
	render: function() {
		return (
			<div className="quill">
			<h1>Welcome To Quill!</h1>
			<TranscriptContainer data={this.state.data}/>
			</div>
			);
	}	
	
});

var TranscriptContainer = React.createClass({
	render: function () {
		console.log('from TranscriptContainer state ',this.props.data);
		var transcriptions = this.props.data.map(function (t) {
			return (
				<Transcript author={t.author} text={t.text}>
				</Transcript>
				);
		});
		return (
			<div className="transcriptContainer">
			{transcriptions}
			</div>
			);
	},
	componentDidMount: function() {
		speechRecog.wksr.onresult = function(event) {
			var result = '';
			for (var i = event.resultIndex; i < event.results.length; i++) {
				result += event.results[i][0].transcript;
			}
			console.log('from onresult ',result);
			data.push({author: 'eric', text: result});
			this.setState({data: data});
		}.bind(this);
	}
});


var Transcript = React.createClass({
	render: function () {
		return (
			<div className="transcript">
			<b>{this.props.author}</b> :
			{this.props.text}
			</div>
			);
	}
});


var PeerVideoContainer = React.createClass({
	render: function () {
		var peerVids = this.props.data.map(function (p) {
			return (<PeerVideo peerID={p.peerID} src={p.stream}>
				</PeerVideo>);
		});
		return (
			<div className="peerVideoContainer">
			{peerVids}
			</div>
			);
	}
});

var PeerVideo = React.createClass({
	render: function () {
		stream = window.URL.createObjectURL(this.props.src);

		return (
			<div className="PeerVideo">
			<video id={this.props.peerID} src={stream} autoplay></video>
			<button id={peerID}> Hang Up </button>
			</div>
			);
	}
});

React.render(<Quill data={data} />, document.getElementById('content'));


// var data = {
// 	transcript: [
// 	{author: "Pete Hunt", text: "This is one comment"},
// 	{author: "Jordan Walke", text: "This is another comment"}
// 	]
// 	// ,peers: [
// 	// {peerID: '', stream: STREAM}
// 	// ]
// };




