'use strict';
import path from 'path';
import {fileURLToPath} from 'url';
import {randomBytes} from "crypto"
import express from "express" 
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const secret = "secret_isimo"
const otpLength = 24
const otp = randomBytes((otpLength/4)*3).toString("base64")
const clientIdLength = 8

console.log(`Login path: http://127.0.0.1:3000/${encodeURIComponent(otp)}`)

run().catch(err => console.log(err));

const peers = new Map();

function authenticationMiddleware (request, response, next) {
  // If running is same endpoint that authorizationMiddleware, run authorization first.
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
    console.log(response.locals.authorization, request.originalUrl);
  }
  next()
}

async function run() {
  const app = express();

  app.use(cookieParser())
  app.use('/static/', express.static(__dirname+'/public/static/'));

  app.post('/signaling/', express.json(), async (request, response)=>{
    console.log(request.body);
    response.sendStatus(201)
  })

  app.patch('/signaling/', express.json(), async (request, response)=>{
    // Provides a way for update peers offers and announce them
  })

  app.get('/signaling/', authorizationMiddleware, async function(request, response) {
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

  app.get('/:otp?', authorizationMiddleware, authenticationMiddleware, express.static(__dirname+'/public/', {index: "index.html"}));

  app.listen(3000);
  console.log('Listening on port http://127.0.0.1:3000');
}