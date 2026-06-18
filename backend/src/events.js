// Simple in-memory SSE broadcaster
const clients = new Set();

function initClient(req, res){
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('\n');
  const client = res;
  clients.add(client);
  req.on('close', ()=>{ clients.delete(client); });
}

function sendEvent(eventName, payload){
  const data = JSON.stringify(payload === undefined ? null : payload);
  for(const res of clients){
    try{
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${data}\n\n`);
    }catch(e){
      try{ res.end(); }catch(_){}
      clients.delete(res);
    }
  }
}

module.exports = { initClient, sendEvent };
