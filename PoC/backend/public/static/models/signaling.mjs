import { signals } from "../defines/signalsDefines.mjs";

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
            signals.SERVICE_REQUEST,
            responseObject
    ))}
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