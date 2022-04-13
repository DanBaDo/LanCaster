import { SignalingClient } from "/static/models/signaling.mjs"
import { ServerPeer, ClientPeer } from "/static/models/rtcPeer.mjs"
import { getCookies } from "/static/aux/cookies.mjs"

const signaling = new SignalingClient("/signaling/")

const jwt = getCookies().valueOf("jwt")

