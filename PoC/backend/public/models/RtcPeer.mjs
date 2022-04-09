class Peer {
    constructor (signaligClient) {
        this._signalingClient = signaligClient
    }
    _rtcConnection = new RTCPeerConnection()
}

class ServerPeer extends Peer {
    constructor (track, stream) {
        this._rtcConnection.addTrack(track, stream)
    }
}