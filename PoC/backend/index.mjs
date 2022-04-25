'use strict';
import path from 'path';
import {fileURLToPath} from 'url';
import {randomBytes} from "crypto"
import express from "express" 
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import { signals } from './public/static/defines/signalsDefines.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const secret = "secret_isimo"
const otpLength = 24
const otp = randomBytes((otpLength/4)*3).toString("base64")
const clientIdLength = 8

console.log(`Login path: http://127.0.0.1:3000/login/${encodeURIComponent(otp)}`)

run().catch(err => console.log(err));

const peers = new Map();

function authenticationMiddleware (request, response, next) {
  // If running with authorizationMiddleware, run authorization first.
  if ( ! response.locals.authorization ) {
    const id = `${randomBytes((clientIdLength/4)*3).toString("base64")}.${Date.now()}`
    if ( request.params.otp === otp ) {
      response.cookie("jwt",jwt.sign({id, rol: "teacher"},secret))
    } else {
      response.cookie("jwt",jwt.sign({id, rol: "student"},secret))
    }
  }
  next()
}

function authorizationMiddleware (request, response, next) {
  if ( request.cookies.jwt && jwt.verify(request.cookies.jwt, secret) ) {
    response.locals.authorization=jwt.decode(request.cookies.jwt)
    //console.log(response.locals.authorization, request.originalUrl);
  }
  next()
}

async function run() {
  const app = express();

  app.use(cookieParser())

  app.get('/login/:otp?', authenticationMiddleware, (request, response)=>{
    response.redirect("/")
  });

  app.post('/signaling/', authorizationMiddleware, express.json(), async (request, response)=>{
    const peer = peers.get(response.locals.authorization.id);
    if (peer) {
      switch (request.body.type) {
        case signals.ICE:
          peer.RTCdata.candidates.push(request.body.content)
          break
        case signals.SERVICE_OFFER:
          peer.RTCdata.offer = request.body.content
          break
      }
      peers.set(response.locals.authorization.id, peer)
      const currentPeers = JSON.stringify(
        Array.from(peers.values())
        .map( item => item.RTCdata )
      );
      response.sendStatus(201)
      peers.forEach(
        peer => { 
          if ( peer.response ) {
            peer.response.write(`data: ${currentPeers}\n\n`);
          }
        }
      )
    } else {
      response.sendStatus(401)
    }
  })

  app.patch('/signaling/', express.json(), async (request, response)=>{
    // Provides a way for update peers offers and announce them
  })

  app.get('/signaling/', authorizationMiddleware, async function(request, response) {
    // https://masteringjs.io/tutorials/express/server-sent-events
    response.writeHead(
      200,
      {
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
      }
    );
    const id = response.locals.authorization.id
    const peer = peers.get(id) || { RTCdata:{candidates: [], offer: null} }
    peers.set(id,{...peer, response });
    request.on("close", ()=>{
        const peer = peers.get(id);
        peers.set(id,{ ...peer, response: null});
    })
  });

  app.get('/', authorizationMiddleware, authenticationMiddleware, express.static(__dirname+'/public/', {index: "index.html"}));
  app.use('/static/', express.static(__dirname+'/public/static/'));

  app.listen(3000);
  console.log('Listening on port http://127.0.0.1:3000');
}