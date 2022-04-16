import { SignalingClient } from "./models/signaling.mjs"
import { ServerPeer, ClientPeer } from "./models/rtcPeer.mjs"
import { decodeAuthData } from "./aux/authentication.mjs"

const signaling = new SignalingClient("/signaling/")

const authData = decodeAuthData()

const services = [];

async function shareDesktopHandler () {
    const screenMedia = await navigator.mediaDevices.getDisplayMedia({audio:false, video:{
        //width: { max: 300 },
        //height: { max: 300 }
        }})    
    services.push( new ServerPeer(signaling, screenMedia) )
    console.log();
}

function addControls () {
    const button = document.createElement("button");
    button.addEventListener("click", shareDesktopHandler);
    document.querySelector("#controls").append(button);
}

function main () {
    if (authData.roll = "teacher") addControls()
}

main();