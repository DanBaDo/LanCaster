'use strict';

import express, { request } from "express" ;

run().catch(err => console.log(err));

const peers = new Map();

async function run() {
  const app = express();

  app.use('/', express.static('public', {index: "index.html"}));

  app.post('/peer/', express.json(), async (req, res)=>{
    console.log(req.ip);
    const { name, rtcDescription } = req.body
    if ( ! name || ! rtcDescription ) { 
        res.sendStatus(400);
        return
    };
    const peerId = Date.now().toString();
    peers.set(peerId,{name, rtcDescription, response: null});
    console.log(peers);
    res.status(200);
    res.json(peerId)
  })

  app.get('/events/:id', async function(req, res) {
    // https://masteringjs.io/tutorials/express/server-sent-events
    if ( ! peers.has(req.params.id)) {
        res.sendStatus(400);
        return;
    }
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();
    const peer = peers.get(req.params.id)
    peer.response = res;
    peers.set(req.params.id, peer)
    request.on("close", ()=>{
        const peer = peers.get(req.params.id);
        peer.response = null;
        peers.set(req.params.id, peer);
    })

  });

  //const index = fs.readFileSync('./index.html', 'utf8');
  //app.get('/', (req, res) => res.send(index));

  await app.listen(3000);
  console.log('Listening on port 3000');
}