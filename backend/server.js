const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require("socket.io")

const port = 8100
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

// app.use(cors())
app.use(express.json())

const joinedUsers = {}

io.on("connection", (socket) => {
    console.log('socket connected : ', socket.id);

    socket.on("join", (username) => {
        if (username) {
            console.log(`username associated with current socket : ${username}`);
            joinedUsers[socket.id] = username
            console.log('joinedUsers:', joinedUsers);
            socket.emit("success", "user sucessfully joined")
            io.emit("online-users", joinedUsers)
        }
    })
})

server.listen(port, () => {
    console.log('server live at ', port);
})