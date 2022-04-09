'use strict';
import {randomBytes} from "crypto"
import express, { request } from "express" ;

const pin_length = 6;
const pin = randomBytes((pin_length/4)*3).toString("base64")

console.log('******************************')
console.log(pin)
console.log('******************************')


run().catch(err => console.log(err));

const peers = new Map();

async function run() {
  const app = express();

  app.use('/', express.static('public', {index: "index.html"}));

  app.post('/peer/', express.json(), async (request, response)=>{
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

  app.patch('/peer/:id', express.json(), async (request, response)=>{
    // Provides a way for update peers offers and announce them
  })

  app.get('/events/:id', async function(request, response) {
    // https://masteringjs.io/tutorials/express/server-sent-events
    response.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    response.flushHeaders();
    const id = request.params.id
    const peer = peers.get(id) || {}
    peers.set(id,{...peer, response });
    request.on("close", ()=>{
        const peer = peers.get(id);
        peers.set(id,{ ...peer, response: null});
    })
  });

  //const index = fs.readFileSync('./index.html', 'utf8');
  //app.get('/', (req, res) => res.send(index));

  app.listen(3000);
  console.log('Listening on port http://127.0.0.1:3000');
}