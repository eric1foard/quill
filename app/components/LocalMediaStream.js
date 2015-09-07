'use strict';

var React = require('react');

var LocalMediaStream = React.createClass({
  render: function () {
    return(
      <div className="localMediaStream">
      <video src={this.props.mySrc} autoPlay></video>
      </div>
    )
  }
});

module.exports = LocalMediaStream;
