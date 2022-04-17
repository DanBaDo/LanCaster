function randomId (length) {
    const intArray = new Uint8Array(Math.ceil(length*3/4))
    crypto.getRandomValues(intArray)
    let string = ""
    intArray.forEach(
        int => string += int.toString(16)
    )
    return string
}

class Peer {
    constructor (signalingClient) {
        this._signaling = signalingClient
        this.rtcConnection = new RTCPeerConnection()
    }
}

export class ServerPeer extends Peer {
    constructor (signalingClient, stream, trackIdx = 0) {
        super(signalingClient)
        this.rtcConnection.addTrack(stream.getTracks()[trackIdx], stream)
        this.rtcConnection.addEventListener("icecandidate", ev=>this._signaling.postICE(ev.candidate))
        this.rtcConnection.createOffer().then(
            offer => { 
                this.rtcConnection.setLocalDescription(offer)
                this._offer = offer
                this._signaling.postServiceOffer(offer)
            }
        )
    }
}

export class ClientPeer extends Peer {
    constructor (serverId, serviceName) {
        super()
        this.serverId = serverId
        this.serviceName = serviceName
    }
}