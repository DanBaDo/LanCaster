import { SignalingClient } from "./api.mjs"
import { ServerPeer, ClientPeer } from "./models/RtcPeer.mjs"
import { getCookies } from "./aux/cookies.mjs"

const signaling = new SignalingClient("/signaling/")

const jwt = getCookies().valueOf("jwt")

