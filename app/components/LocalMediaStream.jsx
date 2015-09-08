'use strict';

var React = require('react');

var LocalMediaStream = React.createClass({
  render: function () {
    var streamSrc = window.URL.createObjectURL(this.props.myStream);
    return(
      <div className="localMediaStream">
      <video src={streamSrc} autoPlay></video>
      </div>
    )
  }
});

module.exports = LocalMediaStream;
