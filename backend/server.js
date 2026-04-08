const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require("socket.io")

const port = 8100
const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(cors())
app.use(express.json())

io.on("connection", (socket) => {
    console.log('socket connected : ', socket.id);

    socket.on("join", (username) => {
        console.log(`username associated with current socket : ${username}`);
    })
})

server.listen(port, () => {
    console.log('server live at ', port);
})