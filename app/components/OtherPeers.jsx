'use strict';

var React = require('react');
var OtherPeer = require('./OtherPeer.jsx');

var OtherPeers = React.createClass({
  render: function () {
    var peerVids = this.props.peers.map(function(p) {
      var streamSrc = window.URL.createObjectURL(p.stream);
      return(
        <OtherPeer src={streamSrc} />
      )
    });

    return(
      <div className="OtherPeers">
        {peerVids}
      </div>
    )
  }
});

module.exports = OtherPeers;
