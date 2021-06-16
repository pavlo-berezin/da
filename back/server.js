let WebSocketServer = require('websocket').server;
let http = require('http');
const { v4: uuidv4 } = require('uuid');
const connections = {};
let oplogs = [];
let state = 'Initial state';

const add = (orString, newValues, index) => {
  return orString.slice(0, index) + newValues + orString.slice(index);
}

const del = (orString, index, count) => {
  return orString.slice(0, index) + orString.slice(index + count);
}

let server = http.createServer(function (request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(8080, function () {
  console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});


wsServer.on('request', function (request) {
  let connection = request.accept(null, request.origin);
  let id = uuidv4();

  connections[id] = connection;

  console.log(id + ' Connection accepted.');

  connection.send(JSON.stringify({ state, lastI: oplogs.length }));

  connection.on('message', function (message) {
    const { diff, lastI } = JSON.parse(message.utf8Data);
    console.log({ diff });
    let index = 0;
    let indexToChange;
    let count;
    
    let missedChanges = oplogs.length && lastI !== oplogs.length;
    console.log({missedChanges})
    for (let i = 0; i < diff.length; i++) {
      const { added, removed, value } = diff[i];
      count = diff[i].count;

      indexToChange = index;

      if (missedChanges) {
        for (let i = lastI; i < oplogs.length; i++) {
          const prevOps = oplogs[i];
          if (prevOps.added && prevOps.index < index) {
            indexToChange += prevOps.count;
          }

          if (prevOps.removed && prevOps.index < index) {
            indexToChange = Math.max(0, indexToChange - prevOps.count);
          }
        }
      }

      if (added) {
        state = add(state, value, indexToChange);
        index = indexToChange + count;
      } else if (removed) {
        state = del(state, indexToChange, count);
      } else {
        index = index + count;
      }

      if (added || removed) {
        oplogs.push({ added, removed, value, index: indexToChange, count });
      }
    }

    connection.send(JSON.stringify({ state, lastI: oplogs.length, position: indexToChange + count }))

    Object.entries(connections).filter(([k, c]) => k !== id).forEach(([k, c]) => {
      c.send(JSON.stringify({ state, lastI: oplogs.length }));
    });


  });
  connection.on('close', function (reasonCode, description) {
    console.log(id + ' Peer ' + connection.remoteAddress + ' disconnected.');
    delete connections[id];
  });
});