const WebSocket = require("ws")

const port = 5001;
const wss = new WebSocket.Server({ port: port });
console.log(`Listenining on address:`);
console.log(wss.address());


wss.on("connection", (ws, req) => {
    const clientAddress = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
    console.log(`${clientAddress} – connected`);
    ws.on("message", (message) => {
        try {
            const msg = JSON.parse(message);
            console.log(`${clientAddress}: ${message}`);

            if(msg.type === "message") {    // TODO: Debug only; to be removed
                broadcastMessage(`${clientAddress}: ${msg.content}`);
            } else if(msg.type === "text") {
                broadcastMessage(JSON.stringify(msg));
            }
        } catch (e) {
            console.log(`Exception catch: ${e}`);
        }
    });
})

const broadcastMessage = message => {
    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(message)
        }
    });
};
