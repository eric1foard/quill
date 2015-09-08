'use strict';

var React = require('react');

var OtherPeer = React.createClass({
  render: function () {
    return (
      <div className="OtherPeer">
      <video key={this.props.key} src={this.props.src} autoPlay></video>
      </div>
      );
  }
});

module.exports = OtherPeer;
