import { postPeer } from "./api.mjs";

const local = new RTCPeerConnection()
local.addEventListener("connectionstatechange",ev=>console.log(ev))
await local.setLocalDescription()

const peers = [];

const response = await postPeer(
    JSON.stringify({
        name: "Master",
        rtcDescription: local.localDescription
    })
)

const id = await response.json()

console.log(id);

function sseMessageHandler (ev) {
    const data = JSON.parse(ev.data);
    switch (data.type) {
        case "newPeer":
            peers.push(data.content);
            local.setRemoteDescription(data.content.rtcDescription);
            const rtcPeer = new RTCPeerConnection();
            break;
        default:
            console.error("Unknown SSE message type:",data)
            break;
    }
}

const sse = new EventSource("/events/"+id);
sse.addEventListener('open', ev=>console.log("SSE ready"));
sse.addEventListener('message', sseMessageHandler);
sse.addEventListener("error",err=>console.log("SSE error",err));