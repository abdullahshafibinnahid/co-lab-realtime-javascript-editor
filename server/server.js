// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process'); // engine

const app = express();
app.use(cors());
app.use(express.json()); // JSON data reading

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// special root
app.post('/run', (req, res) => {
    const { code } = req.body;
    exec(`node -e "${code.replace(/"/g, '\\"')}"`, { timeout: 3000 }, (error, stdout, stderr) => {
        if (error) {
            res.json({ output: stderr || error.message });
            return;
        }
        res.json({ output: stdout });
    });
});

io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId }) => socket.join(roomId));
    socket.on('code-change', ({ roomId, code }) => {
        socket.to(roomId).emit('code-update', code);
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));