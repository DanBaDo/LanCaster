console.log("Here I'm!");

const local = new RTCPeerConnection()
//local.setLocalDescription() // For updating local conection parameters
api.sessions.post(local.localDescription)