function

navigator.webkitGetUserMedia({ video: true, audio: true }, function (stream) {
        var Peer = require('peerjs');
        var peer = new Peer({key: 'xwx3jbch3vo8yqfr'});
        //var peer = new Peer({host:'arcane-island-4855.herokuapp.com', secure:true, port:443, key: 'peerjs', debug: 3});
        console.log('peer ',peer);

        //display user's peer ID
        peer.on('open', function(id) {
          peers.push(id);
          document.querySelector('#myID').value = id;
          showMedia(stream);
      });

        bindCallClick(peer, stream);
        handleIncomingCall(peer, stream);
        handleIncomingData(peer);

    }, function (err) {console.error(err);});