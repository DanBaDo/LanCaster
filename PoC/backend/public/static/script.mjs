import { SignalingClient } from "./models/signaling.mjs"
import { ServerPeer } from "./models/rtcPeer.mjs"
import { decodeAuthData } from "./aux/authentication.mjs"

const signaling = new SignalingClient("/signaling/")

const authData = decodeAuthData()

export var service;

async function shareDesktopHandler () {
    const screenMedia = await navigator.mediaDevices.getDisplayMedia({audio:false, video:{
        //width: { max: 300 },
        //height: { max: 300 }
        }})    
    service = new ServerPeer(signaling, screenMedia)
}

function addControls () {
    const button = document.createElement("button");
    button.innerText = "Compartir";
    button.addEventListener("click", shareDesktopHandler);
    document.querySelector("#controls").append(button);
}

function main () {
    if (authData.rol === "teacher") addControls()
}

main();