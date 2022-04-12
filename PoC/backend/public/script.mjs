import { SignalingClient } from "./api.mjs"
import { ServerPeer, ClientPeer } from "./models/RtcPeer.mjs"

const signaling = new SignalingClient("/signaling/")

const coockies = browser.cookies.getAll()

console.log(coockies);