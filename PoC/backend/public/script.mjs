import { postPeer } from "./api.mjs";

const peers = [];

async function sseMessageHandler (ev) {
    const data = JSON.parse(ev.data);
    switch (data.type) {
        case "newPeer":
            peers.push(data.content);
            await local.setRemoteDescription(data.content.rtcDescription);
            await local.createDataChannel('connection');
            break;
        default:
            console.error("Unknown SSE message type:",data)
            break;
    }
}

const local = new RTCPeerConnection()
local.addEventListener("connectionstatechange",ev=>console.log("Connection state changed:", ev))
const localOffer = await local.createOffer()
await local.setLocalDescription(localOffer)
const response = await postPeer(
    JSON.stringify({
        name: "Master",
        rtcDescription: local.localDescription
    })
)
const id = await response.json()
console.log(id);

const sse = new EventSource("/events/"+id);
sse.addEventListener('open', ev=>console.log("SSE ready"));
sse.addEventListener('message', sseMessageHandler);
sse.addEventListener("error",err=>console.log("SSE error",err));