window.addEventListener('click', function(event) {
      var t = event.target;
      if (t.nodeName == 'BUTTON')
        console.log("Sending event: ", t.name);
        self.port.emit('click-button', t.name);
}, false);

console.log("Eventlistener attached");
