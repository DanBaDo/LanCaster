'use strict';
import {randomBytes} from "crypto"
import express from "express" 
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"


const secret = "secret_isimo"
const otp_length = 24;
const otp = randomBytes((otp_length/4)*3).toString("base64")

console.log(`Login path: http://127.0.0.1:3000/login/${encodeURIComponent(otp)}`)

run().catch(err => console.log(err));

const peers = new Map();

function authMiddleware (request, response, next) {
  if ( request.cookies.jwt && jwt.verify(request.cookies.jwt, secret) ) {
    response.locals.authorization=jwt.decode(request.cookies.jwt)
  }
  next()
}

async function run() {
  const app = express();

  app.use(cookieParser())

  app.use('/', express.static('public', {index: "index.html"}));

  app.get("/login/:otp?", async (request, response) => {
    if ( request.params.otp === otp ) {
      response
        .cookie("jwt",jwt.sign({rol: "teacher"},secret))
        .redirect(303,'/')
      return
    } else {
      response.sendStatus(401)
    }
  });

  app.post('/signaling/', express.json(), async (request, response)=>{
    const { id, candidate } = request.body
    if ( ! id ) { 
        response.sendStatus(400);
        return
    };
    const peer = peers.get(id) || {candidates: []}
    if ( ! Array.isArray(peer.candidates)) peer.candidates = []
    if ( candidate ) peer.candidates.push(candidate);
    peers.set(id,peer);
    const peersKeysArray = Array.from(peers.keys()).filter( key => key !== id )
    const peersArray = peersKeysArray.map(key => {
      const peer = peers.get(key)
      return {id, candidates: peer.candidates}
    })
    const json = JSON.stringify(peersArray)
    peers.forEach(
      peer => {
        if ( peer.response ) {
          peer.response.write(`data: { "type": "peers", "content": ${json}}\n\n`)
        }
      }
    );
  })

  app.patch('/signaling/', express.json(), async (request, response)=>{
    // Provides a way for update peers offers and announce them
  })

  app.get('/signaling/', authMiddleware, async function(request, response) {
    // https://masteringjs.io/tutorials/express/server-sent-events
    response.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    //console.log("->",response.locals)
    response.flushHeaders();
    const id = request.params.id
    const peer = peers.get(id) || {}
    peers.set(id,{...peer, response });
    request.on("close", ()=>{
        const peer = peers.get(id);
        peers.set(id,{ ...peer, response: null});
    })
  });

  app.listen(3000);
  console.log('Listening on port http://127.0.0.1:3000');
}