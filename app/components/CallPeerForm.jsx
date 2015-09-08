'use strict';

var React = require('react');

var CallPeerForm = React.createClass({
  render: function () {
    return (
      <div className="CallPeerForm">
        <input type="text" value={this.props.myPeerID} readOnly/>
        <input type="text" ref="newPeer" placeholder="Enter a Peer ID"/>
        <button onClick={this.handleSubmit}>Connect</button>
      </div>
      );
  },
  handleSubmit: function() {
    var newPeer = this.refs.newPeer.getDOMNode().value;
    this.refs.newPeer.getDOMNode().value = '';
    this.props.callPeer(this.props.myPeer, newPeer, this.props.myStream);
  }
});

module.exports = CallPeerForm;
