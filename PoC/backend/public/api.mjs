class SignalingClient {
    constructor (postURL, sseURL) {
        this._postURL = postURL
        this._sseURL = sseURL
    }
    _post (signal) {
        const response = await fetch(
            this._postURL,
            {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(signal)
            }
        )
    }
    _s2s (signalType, payload) {
        return {
            type: signalType,
            content: JSON.stringify(payload)
        }
    }
    post = {
        iceCandidate (iceCandidateObject) {
            this._post(this._s2s('ICE',iceCandidateObject))
        },
        serviceOffer (offerObject) {
            this._post(this._s2s('SRV',offerObject))
        },
        serviceRequest (responseObject) {
            this._post(this._s2s('REQ',responseObject))
        }

    }
}

export async function postSignal (id, candidate) {
    const response = await fetch(
        "/peer/",
        {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ id, candidate })
        }
    )
    return response
}

const exports = { SignalingClient }