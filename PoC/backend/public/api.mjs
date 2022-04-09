import { signals } from "./defines/signalsDefines.mjs"

export class SignalingClient {
    constructor (URL) {
        this._URL = URL
        this._sse = new EventSource(this._URL);
        this._sse.addEventListener("message", this._messageHandler)
    }
    _post (signal) {
        const response = await fetch(
            this._URL,
            {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(signal)
            }
        )
    }
    _toSignalString (signalType, payload) {
        return {
            type: signalType,
            content: JSON.stringify(payload)
        }
    }
    post = {
        iceCandidate (iceCandidateObject) {
            this._post(this._toSignalString(
                signals.ICE_CANDIDATE,
                iceCandidateObject
        ))},
        serviceOffer (offerObject) {
            this._post(this._toSignalString(
                signals.SERVICE_OFFER,
                offerObject
        ))},
        serviceRequest (responseObject) {
            this._post(this._toSignalString(
                signals.SERVICE_REQUEST,
                responseObject
        ))}
    }
    _messageHandler ( event ) {
        const message = JSON.parse( event.data);
        switch (message.type) {
            case signals.ICE_CANDIDATE:
                console.log("ICE_CANDIDATE");
                break;
            case signals.SERVICE_REQUEST:
                console.log("SERVICE_REQUEST");
                break;
            case signals.SERVICE_OFFER:
                console.log("SERVICE_OFFER");
                break;
            default:
                console.error("Unknown SSE message type:", message)
                break;
        }
    }
}