const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message);
  });
});

function broadcastSessionUpdate(session) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'sessionUpdate',
        sessionId: session.sessionId,
        result: session.result,
      }));
    }
  });
}

module.exports = { wss, broadcastSessionUpdate };