$(document).ready(function(){
    var media = $('#embeded-video');
    var socket = io();
    var waitingStatus = false;
    var config = {};
    var playingIndex; // Index in mediaList of the media currently playing
    var mediaList = [];

    //
    // Calculates the length of playlist : media have to be defined to be take in account.
    //
    function getPlayListLength() {
      // Counting how many media we have in playlist
      var nb = 0;
      for(var i=0; i < config.rfid.numReaders; i++) {
        if (mediaList[i].media.tag) {
          // If the media is defined, increment canPlay
          nb++;
        }
        console.log(mediaList[i]);
      }
      return nb;
    }

    //
    // Set a media in the playlist.
    // The index is the reader number
    //
    function setPlaylistItem(i, m) {
      mediaList[i].media = m;
    }

    //
    // Re-init the playlist : useful in synchrone mode
    //
    function initPlaylist() {
      // Init tag/reader/media list
      console.log("Playlist is getting empty...");
      for(var i=0; i < config.rfid.numReaders; i++) mediaList[i] = {media:{}};
      playingIndex = 0;
      console.log("done !");
      // Saying to server we re-inited the client.
      socket.emit('client.endMedia', { message: "empty playlist from user action !" });
    }

    // ------------------------------------------------------------------
    // UI elements
    // ------------------------------------------------------------------
    // Hidden reset button
    $('#resetButton').on('click', function(){
      initPlaylist();
    });

    // ------------------------------------------------------------------
    // Socket listening
    // ------------------------------------------------------------------
    // Receiving config from server
    socket.on('server.sendConfig', function(data) {
      config = data;
      // Init the client at begining, when loading is done.
      initPlaylist();
    });

    // Receiving new media attributes by socket.
    socket.on('server.rfidData', function(data) {
      addMessage("<server.rfidData> rfid #" + data.tag + " on reader #" + data.reader);
      // Respond with a message including this clients' id sent from the server
      socket.emit('client.acknowledgment', {message: "Ok! Client is dealing with : #" + data.tag});
    });

    // Dealing with errors
    socket.on('server.error', console.error.bind(console));

    // Service messages (media)
    socket.on('server.message', playMedia);

    // Media service
    socket.on('server.play-media', function(m) {
      //
      // If the mode is 'synchrone', we have to wait that all readers have read a tag 
      // before chining media.
      //
      if (config.rfid.rfid_mode == "synchrone" && m.status == "content") {
        var index = m.reader-1;
        var countMedia = 0;

        setPlaylistItem(index, m);
        // Counting after adding last media
        countMedia = getPlayListLength();
        if (countMedia < config.rfid.numReaders) {
          // TODO : when media are video, we need to display this comment above to the user.     
          console.log("waiting for " + (config.rfid.numReaders - countMedia) + " more...");
         } else {
          // Starting to play first media
          playMedia(mediaList[playingIndex].media);
          playingIndex++;
          // the second one is driven by media.on 'ended' function below
          // Because we need to start when previous is finished          
        }

      } else {
        //
        // Asynchrone mode : playing media without waiting all the readers have decoded something.
        //
        playMedia(m);
      }
    });

    // ------------------------------------------------------------------
    // Media handling
    // ------------------------------------------------------------------
    function addMessage(message) {
        console.log(message);
    }

    // Playing Media callback 
    function playMedia(m) {
      console.log("playing " + JSON.stringify(m));
      // Hide service message
      $('#serviceMessage').hide();

      // Stopping previous media
      media.stop();

      // chaging media source
      media.attr("src", m.uri);

      // Looping attribute
      if (m.loop == "on") {
        media.attr("loop", m.loop);
      } else { 
        media.removeAttr("loop"); 
      }

      // Autoplay Attribute
      if (m.autoplay == "on")  {
        media.attr("autoplay", m.autoplay); 
      } else { 
        media.removeAttr("autoplay"); 
      }

      // Controls attribute
      if (m.controls == "on") {
        media.attr("controls", m.controls);
      } else { 
        media.removeAttr("controls"); 
      }
      // Put status and tag as attributes too
      media.attr("status", m.status);
      media.attr("tag", m.tag);
      media.attr("filename", m.filename);
      media.attr("reader", m.reader);

    }

    // ------------------------------------------------------------------
    // End media event handling
    // ------------------------------------------------------------------
    // Adding a listener on video ending
    media.on('ended',function(){
      var messageTag = "";
      var urlContrib = "<br/><a class='btn btn-xs btn-default' title='Ajouter un contenu lié à ce tag RFID' href='/contrib?tag=" + media.attr("tag") + "'>Ajouter un contenu</a>";
      var tempo = 5000;
      // If the video was a service message "noTagAssociation" or "mediaNotFound" let's print rfid tag or filename
      switch (media.attr("status")) {
        case "noTagAssociation":
          messageTag = "Le tag RFID comportant le code : \"" + media.attr("tag") + "\" n'est associé à aucun mot-clé." + urlContrib;
          break;
        case "mediaNotFound":
          messageTag = "Le fichier : " + media.attr("filename") + "\" est introuvable.";
          break;
        case "content":
        // this is the normal way to play media
        tempo = 0;
        // If synchrone mode, we have to playing next media !
        if ( config.rfid.rfid_mode == "synchrone") {
          if (playingIndex < config.rfid.numReaders) { // Playing next media
            playMedia(mediaList[playingIndex].media);
            playingIndex++;
            // So exit while the playList is not finished !
            return false;
          } else  {
            // The playlist is finished ! 
            console.log("--------The Playlist has finished ! --------");
            initPlaylist();
          }
        }
      }

      // display mesage
      if (messageTag != "") {
        $('#serviceMessage').html(messageTag);
        $('#serviceMessage').fadeIn('slow');
      } 

      // Emitting endMedia to the server. 
      // At least the service message if any, stays for 5 seconds.
      setTimeout(function() {
        $('#serviceMessage').hide();
        socket.emit('client.endMedia', { message: messageTag });
      }, tempo);
      
    });

}); // $(document).ready()

