
window.phantomSpeaker = {
  emit: function (event, data) {
    if( data && !data.substr) data = JSON.stringify(data)
    console.log(window.phantomSpeakerToken+''+event.toUpperCase()+':'+data)
  }
};
