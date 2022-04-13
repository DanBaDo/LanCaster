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

function authenticationMiddleware (request, response, next) {
  if ( ! response.locals.authorization ) {
    if ( request.params.otp === otp ) {
      response.cookie("jwt",jwt.sign({rol: "teacher"},secret))
    } else {
      response.cookie("jwt",jwt.sign({rol: "student"},secret))
    }
  }
  next()
}

function authorizationMiddleware (request, response, next) {
  if ( request.cookies.jwt && jwt.verify(request.cookies.jwt, secret) ) {
    response.locals.authorization=jwt.decode(request.cookies.jwt)
  }
  next()
}

async function run() {
  const app = express();

  app.use(cookieParser())

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

  app.use('/static/', express.static('public/'));
  app.use('/', authorizationMiddleware, authenticationMiddleware, express.static('public', {index: "index.html"}));

  app.listen(3000);
  console.log('Listening on port http://127.0.0.1:3000');
}