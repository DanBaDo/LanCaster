import { decodeAuthData } from "../aux/authentication.mjs"
import { signals } from "../defines/signalsDefines.mjs";
import { ClientPeer } from "./rtcPeer.mjs";
import { service } from "../script.mjs";

const authData = decodeAuthData()
export const peers = new Map()

export class SignalingClient {
    constructor (URL) {
        this._URL = URL
        this._sse = new EventSource(this._URL);
        this._sse.addEventListener("message", this._messageHandler)
    }
    async _post (signal) {
        const response = await fetch(
            this._URL,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Cookies": document.cookie
                },
                method: "POST",
                credentials: 'same-origin',
                body: JSON.stringify(signal)
            }
        )
    }
    _toSignalString (signalType, payload) {
        return {
            type: signalType,
            content: payload
        }
    }
    postICE (iceObject) {
        this._post(this._toSignalString(
            signals.ICE,
            iceObject
    ))}
    postServiceOffer (offerObject) {
        this._post(this._toSignalString(
            signals.SERVICE_OFFER,
            offerObject
    ))}
    postServiceRequest (responseObject) {
        this._post(this._toSignalString(
            signals.SERVICE_RESPONSE,
            responseObject
    ))}
    _messageHandler ( event ) {
        const peersData = JSON.parse( event.data);
        peersData.forEach(
            peerData => {
                console.log(peerData)
                const { id, candidates, offer, response } = peerData
                const peer = { candidates, offer, response }
                peers.set(id, peer)
                if ( offer && candidates ) peer.client = new ClientPeer(peerData, "remoteVideo")
                if ( response ) {
                    candidades.forEach(
                        item => service.addIceCandidate(item)
                    )
                    service.setRemoteDescription(response)
                }
            }
        )

        /*switch (message.type) {
            case signals.ICE_CANDIDATE:
                console.log("ICE_CANDIDATE", message);
                break;
            case signals.SERVICE_REQUEST:
                console.log("SERVICE_REQUEST", message);
                break;
            case signals.SERVICE_OFFER:
                console.log("SERVICE_OFFER", message);
                break;
            default:
                console.error("Unknown SSE message type:", message)
                break;
        }*/
    }
}