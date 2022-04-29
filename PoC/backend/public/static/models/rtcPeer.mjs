class Peer {
    constructor (signalingClient) {
        this.signaling = signalingClient
        this.rtcConnection = new RTCPeerConnection()
        this.rtcConnection.addEventListener("icecandidate", ev=>this.signaling.postICE(ev.candidate))
    }
}

export class ServerPeer extends Peer {
    constructor (signalingClient, stream, trackIdx = 0) {
        super(signalingClient)
        this.rtcConnection.addTrack(stream.getTracks()[trackIdx], stream)
        this.rtcConnection.createOffer().then(
            offer => { 
                this.rtcConnection.setLocalDescription(offer)
                this.offer = offer
                this.signaling.postServiceOffer(offer)
            }
        )
    }
}

export class ClientPeer extends Peer {
    constructor (serviceOffer, videoId) {
        super()
        this.videoElement = document.querySelector(`video#${videoId}`)
        this.rtcConnection.addEventListener("track", this.play)
        serviceOffer.candidates.forEach(
            item => this.rtcConnection.addIceCandidate(item)
        )
        this.rtcConnection.setRemoteDescription(serviceOffer.offer)
        this.rtcConnection.createAnswer().then(
            answer => { 
                this.rtcConnection.setLocalDescription(answer)
                this.answer = answer
                this.signaling.postServiceRequest(answer)
            }
        )
    }
    play ( event ) {
        this.videoElement.srcObject = event.streams[0]
    }
}