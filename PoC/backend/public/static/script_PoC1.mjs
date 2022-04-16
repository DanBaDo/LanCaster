const local = new RTCPeerConnection()
const remote = new RTCPeerConnection()

function onTrack (ev) {
     const video = document.querySelector("#remoteVideo")
     video.addEventListener("loadedmetadata",ev=>console.log("Video metadata"))
     video.addEventListener("resize",ev=>console.log("Video resize"))
     video.srcObject = ev.streams[0]
}

async function onIce (ev, peer) {
    await peer.addIceCandidate(ev.candidate)
}

const screenMedia = await navigator.mediaDevices.getDisplayMedia({audio:false, video:{
    width: { max: 300 },
    height: { max: 300 }
  }})
const tracks = screenMedia.getTracks()
const track = tracks[0]

const sender = local.addTrack(track, screenMedia)

remote.addEventListener("track", onTrack)

local.addEventListener('icecandidate',  (ev)=>onIce(ev,remote))
local.addEventListener("iceconnectionstatechange", ev=>console.log(local.iceConnectionState))
remote.addEventListener('icecandidate', (ev)=>onIce(ev,local))
local.addEventListener("iceconnectionstatechange", ev=>console.log(remote.iceConnectionState))

const offer = await local.createOffer()
await local.setLocalDescription(offer)
await remote.setRemoteDescription(offer)

const answer = await remote.createAnswer()
await remote.setLocalDescription(answer)
await local.setRemoteDescription(answer)


