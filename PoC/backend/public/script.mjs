import { SignalingClient } from "./api.mjs"
import { ServerPeer } from "./models/RtcPeer.mjs"

const local = new RTCPeerConnection()

const remotes = new Map()

let id = localStorage.getItem("id")
if ( ! id ) {
    id = Date.now()
    localStorage.setItem("id", id)
}

async function sseMessageHandler (ev) {
    const data = JSON.parse(ev.data);
    switch (data.type) {
        case "peers":
            data.content.forEach( peer => {
                let remote = remotes.get(peer.id)
                if ( ! remote ) {
                    remote = new RTCPeerConnection()
                    remote.addEventListener("track", onTrack)
                }
                if (peer.candidates) peer.candidates.forEach(candidate=> remote.addIceCandidate(candidate))
                remotes.set(peer.id, remote)
            })
            break;
        default:
            console.error("Unknown SSE message type:",data)
            break;
    }
}

function onIceCandidate(ev) {
    console.log("Candidate")
    postPeer(id, ev.candidate)
}

function onTrack(ev) {
    console.log("Track", ev);
}

async function configureLocalPeer() {
    console.log("SSE ready. Configuring local peer")
    local.addEventListener('icecandidate', onIceCandidate)
    const screenMedia = await navigator.mediaDevices.getDisplayMedia()
    local.addTrack(screenMedia.getTracks()[0])
    const offer = await local.createOffer()
    local.setLocalDescription(offer)
}

const sse = new EventSource("/events/"+id);
sse.addEventListener('message', sseMessageHandler);
sse.addEventListener("error",err=>console.log("SSE error",err));
sse.addEventListener('open', configureLocalPeer);