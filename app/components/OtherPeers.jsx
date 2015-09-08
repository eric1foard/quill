'use strict';

var React = require('react');
var OtherPeer = require('./OtherPeer.jsx');

var OtherPeers = React.createClass({
  render: function () {
    var peerVids = this.props.peers.map(function(p) {
      var streamSrc = window.URL.createObjectURL(p.stream);
      console.log('from OtherPeers ',streamSrc);
      return(
        <OtherPeer key={p.peerID} src={streamSrc} />
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
