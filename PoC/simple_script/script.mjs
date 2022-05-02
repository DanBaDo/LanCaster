const screenMedia = await navigator.mediaDevices.getDisplayMedia({audio:false, video:{
  width: { max: 300 },
  height: { max: 300 }
}})
const track = screenMedia.getTracks()[0]

function onTrack1 (ev) {
     const video = document.querySelector("#remoteVideo1")
     video.addEventListener("loadedmetadata",ev=>console.log("Video metadata"))
     video.addEventListener("resize",ev=>console.log("Video resize"))
     video.srcObject = ev.streams[0]
}

function onTrack2 (ev) {
  const video = document.querySelector("#remoteVideo2")
  video.addEventListener("loadedmetadata",ev=>console.log("Video metadata"))
  video.addEventListener("resize",ev=>console.log("Video resize"))
  video.srcObject = ev.streams[0]
}

async function onIce (ev, peer) {
  await peer.addIceCandidate(ev.candidate)
}

const remote1 = new RTCPeerConnection()
remote1.addEventListener("track", onTrack1)
remote1.addEventListener('icecandidate', (ev)=>onIce(ev,local))

const local = new RTCPeerConnection()
local.addEventListener('icecandidate',  (ev)=>onIce(ev,remote1))
local.addEventListener("iceconnectionstatechange", ev=>console.log(local.iceConnectionState))
local.addEventListener("iceconnectionstatechange", ev=>console.log(remote1.iceConnectionState))
local.addTrack(track, screenMedia)
local.createOffer().then(
  async offer => {
    await local.setLocalDescription(offer)
    await remote1.setRemoteDescription(offer)
    remote1.createAnswer().then(
      answer => {
        remote1.setLocalDescription(answer)
        local.setRemoteDescription(answer)
      }
    )
  }
)


