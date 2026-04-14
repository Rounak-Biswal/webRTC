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
const activeCalls = {}

io.on("connection", (socket) => {
    console.log('socket connected : ', socket.id);

    socket.on("disconnect", () => {
        if (joinedUsers[socket.id]) {
            delete joinedUsers[socket.id]
            console.log("User disconnected\njoinedUsers : ", joinedUsers);
            io.emit("online-users", joinedUsers)
        }
        Object.keys(activeCalls).forEach((key) => {
            if (key === socket.id || activeCalls[key] === socket.id) {       //Terminate PeerConnection if caller or callee leaves
                delete activeCalls[key]
            }
        })
    })

    socket.on("join", (username) => {
        if (username) {
            console.log(`username associated with current socket : ${username}`);
            joinedUsers[socket.id] = username
            console.log('joinedUsers:', joinedUsers);
            socket.emit("success", "user sucessfully joined")
            io.emit("online-users", joinedUsers)
        }
    })

    socket.on("leave", () => {
        if (joinedUsers[socket.id]) {
            io.emit("success", `${joinedUsers[socket.id]} left`)
            io.emit("online-users", joinedUsers)
            delete joinedUsers[socket.id]
            console.log("user left, click to re-join\njoinedUsers : ", joinedUsers);
        }
        Object.keys(activeCalls).forEach((key) => {
            if (key === socket.id || activeCalls[key] === socket.id) {       //Terminate PeerConnection if caller or callee leaves
                delete activeCalls[key]
            }
        })
    })

    socket.on("callOffer", (obj) => {
        let sender = socket.id
        let reciever = Object.keys(joinedUsers).find((key) => joinedUsers[key] === obj.to)
        if (reciever in joinedUsers && sender in joinedUsers) {
            activeCalls[sender] = reciever
        }
        console.log(`From : ${joinedUsers[sender]}\nto : ${joinedUsers[reciever]}`)
        console.log(`From : ${sender}\nto : ${reciever}`)
        if (reciever) {
            io.to(reciever).emit("incomingCall",
                {
                    from: joinedUsers[sender],
                    fromId: sender
                })
        }
    })

    socket.on("acceptCall", (obj) => {
        let callerId = obj.callSender.fromId
        let calleeId = Object.keys(joinedUsers).find((key) => joinedUsers[key] === obj.callReciever)
        if (callerId in activeCalls && activeCalls[callerId] === calleeId) {
            console.log(`${joinedUsers[calleeId]} accepted call from ${joinedUsers[callerId]}`);
            io.to(callerId).emit("callAccepted", { msg: `${joinedUsers[calleeId]} accepted your call` })
        }
        delete activeCalls[callerId]
    })

    socket.on("rejectCall", (obj) => {
        let callerId = obj.callSender.fromId
        let calleeId = Object.keys(joinedUsers).find((key) => joinedUsers[key] === obj.callReciever)
        if (callerId in activeCalls && activeCalls[callerId] === calleeId) {
            console.log(`${joinedUsers[calleeId]} rejected call from ${joinedUsers[callerId]}`);
            io.to(callerId).emit("callRejected", { msg: `${joinedUsers[calleeId]} rejected your call` })
        }
        delete activeCalls[callerId]
    })
})

server.listen(port, () => {
    console.log('server live at ', port);
})