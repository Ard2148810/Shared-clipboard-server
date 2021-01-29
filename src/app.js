const WebSocket = require("ws");
const shortid = require('shortid');

const port = 5001;
const wss = new WebSocket.Server({ port: port });
console.log(`Listenining on address:`);
console.log(wss.address());

const INCORRECT_ROOM_ID = 4001;
const INCORRECT_ROOM_ID_REASON = "Incorrect room ID";

const rooms = new Map();
let test;

wss.on("connection", (ws, req) => {
    const wsRoomHeader = req.headers["sec-websocket-protocol"];
    if(!wsRoomHeader) {
        const roomId = createRoom();
        test = roomId;
        rooms.get(roomId).add(ws);
        ws.roomId = roomId;
        console.log(`room created, id: ${roomId}`);
    } else {
        if(!validateRoom(wsRoomHeader)) {
            ws.close(INCORRECT_ROOM_ID, INCORRECT_ROOM_ID_REASON); // Incorrect ID
            console.log(`incorrect id: ${wsRoomHeader}`);
        } else {
            rooms.get(wsRoomHeader).add(ws);
            ws.roomId = wsRoomHeader;
        }
    }

    const clientAddress = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
    console.log(`${clientAddress} – connected`);
    ws.on("message", (message) => {
        try {
            const msg = JSON.parse(message);
            console.log(`${clientAddress}: ${message}`);

            if(msg.type === "message") {    // TODO: Debug only; to be removed
                broadcastMessage(ws, `${clientAddress}: ${msg.content}`);
            } else if(msg.type === "text") {
                broadcastMessage(ws, JSON.stringify(msg));
            }
        } catch (e) {
            console.log(`Exception catch: ${e}`);
        }
    });

    ws.on("close", () => {
        console.log("ws close")
        removeUserFromRoom(ws);
    })
});

const broadcastMessage = (requester, message) => {
    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN && client !== requester) {
            client.send(message)
        }
    });
};

const createRoom = () => {
    const id = shortid.generate();
    let newRoomSet = new Set();
    rooms.set(id, newRoomSet);
    return id;
}

const validateRoom = (id) => {
    return shortid.isValid(id) && rooms.has(id);
}

const removeUserFromRoom = (user) => {
    const room = rooms.get(user.roomId);
    if(room) {  // Check if user is assigned to any room
        room.delete(user);
        if(room.size === 0) {   // Delete the room when it's left empty
            rooms.delete(room);
            console.log(`room ${user.roomId} deleted`);
        }
    }
}
