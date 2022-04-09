class ServerPeer {
    constructor () {
        this._rtcConnection = new RTCPeerConnection()

    }
    addStream (track, stream) {
        this._rtcConnection.addTrack(track, stream)
    }
}