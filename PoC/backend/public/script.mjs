import { SignalingClient } from "./models/signaling.mjs"
import { ServerPeer, ClientPeer } from "./models/rtcPeer.mjs"
import { getCookies } from "./aux/cookies.mjs"

const signaling = new SignalingClient("/signaling/")

const jwt = getCookies().valueOf("jwt")

