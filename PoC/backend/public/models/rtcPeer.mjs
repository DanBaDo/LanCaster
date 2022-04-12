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
    constructor () {
        this.id = sessionStorage.getItem("id")
        if ( ! this.id ) {
            this.id = randomId(24)
            localStorage.setItem("id", id)
        }
    }
    _rtcConnection = new RTCPeerConnection()
}

export class ServerPeer extends Peer {
    constructor (serviceName, track, stream) {
        super()
        this.serviceName = serviceName
        this._rtcConnection.addTrack(track, stream)
    }
}

export class ClientPeer extends Peer {
    constructor (serverId, serviceName) {
        super()
        this.serverId = serverId
        this.serviceName = serviceName
    }
}