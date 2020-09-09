const WebSocket = require("ws")

const port = 5001
const wss = new WebSocket.Server({ port: port })


wss.on("connection", (ws, req) => {
    const clientAddress = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
    console.log(`${clientAddress} – connected`)
    ws.on("message", (message) => {
        const msg = JSON.parse(message);
        console.log(`${clientAddress}: ${message}`)

        if(msg.type === "message") {
            broadcastMessage(`${clientAddress}: ${msg.content}`);
        }
    })

    ws.send(`Connected to server | ${wss.address().address}:${wss.address().port}`);
})

const broadcastMessage = message => {
    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(message)
        }
    })
}
