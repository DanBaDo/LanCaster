import { postPeer } from "./api.mjs";

const local = new RTCPeerConnection()
await local.setLocalDescription()

const response = await postPeer(
    JSON.stringify({
        name: "Master",
        rtcDescription: local.localDescription
    })
)

const id = await response.json()

console.log(id);