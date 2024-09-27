import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';

const app = express();
const server = createServer(app);

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});

io.on('connection', socket => {
    socket.on('send message', data => {
        socket.to(data.room).emit('deliver message', data);
    })

    socket.on('join room', data => {
        socket.join(data.room);
        socket.to(data.room).emit('user connected', data.name);
    })

    socket.on('leave room', data => {
        socket.to(data.room).emit('user disconnected', data.name);
        socket.leave(data.room);
    })
})

server.listen(3000, () => {
    console.log("Server is running!");
})