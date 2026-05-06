import { useEffect, useRef, useState } from 'react'
import { socket } from "./utils/socket"
import { IoCall } from "react-icons/io5";
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [currentUsername, setCurrentUsername] = useState('')
  const [onlineUsers, SetOnlineUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [incomingCall, setIncomingCall] = useState(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const pcRef = useRef(null)

  useEffect(() => {
    socket.on("success", (msg) => {
      console.log(msg)
    })
    socket.on("online-users", (userDB) => {
      let arr = []
      for (let key in userDB) { arr.push(userDB[key]) }
      SetOnlineUsers(arr)
    })
    socket.on("disconnect", () => {
      setSelectedUser('')
      setUsername('')
      setCurrentUsername('')

      localVideoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
    })
    socket.on("call:incoming", (callData) => {
      console.log("incoming call from :", callData.from)
      setIncomingCall(callData)
    })
    socket.on("call:accepted", async (obj) => {
      console.log(obj.msg)

      console.log("initializeMedia calling")
      await initializeMedia(obj.sender, obj.reciever)     //initiate media on sender's side
      console.log("initializeMedia called")

      const offer = await pcRef.current.createOffer()
      await pcRef.current.setLocalDescription(offer)
      socket.emit("webrtc:offer", { offer, "to": obj.reciever, "from": obj.sender })
    })
    socket.on("call:rejected", (obj) => {
      console.log(obj.msg)
    })
    socket.on("webrtc:offer", async (data) => {
      console.log("Recieved offer from ", data.from)
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer))
      const answer = await pcRef.current.createAnswer()
      await pcRef.current.setLocalDescription(answer)
      socket.emit("webrtc:answer", { answer, "to": data.from, "from": data.to })
    })
    socket.on("webrtc:answer", async (data) => {
      console.log("Recieved answer from ", data.from)
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
    })
    socket.on("webrtc:recieveICE", async (data) => {
      console.log(`IceCandidate recieved from ${data.sender}`)
      await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
    })

    return () => {
      socket.off("success")
      socket.off("online-users")
      socket.off("disconnect")
      socket.off("call:incoming")
      socket.off("call:accepted")
      socket.off("call:rejected")
      socket.off("webrtc:offer")
      socket.off("webrtc:answer")
      socket.on("webrtc:recieveICE")
    }
  }, [])

  let joinUser = () => {
    setCurrentUsername(username)
    setUsername('')
    socket.emit("join", username)
  }

  let leaveUser = () => {
    socket.emit("leave")
    setSelectedUser('')
    setCurrentUsername('')


    localVideoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
  }

  let sendCallOffer = (targetUser) => {
    console.log("sendCallOffer triggered")
    console.log(`From : ${currentUsername}\nto : ${targetUser}`)
    socket.emit("call:request", { to: targetUser, from: currentUsername })
  }

  let acceptCall = () => {
    socket.emit("call:accept",
      {
        callSender: incomingCall,
        callReciever: currentUsername
      })
    setIncomingCall(null)
    initializeMedia(currentUsername, incomingCall.from)     //initiate media on reciever's side
  }

  let rejectCall = () => {
    socket.emit("call:reject",
      {
        callSender: incomingCall,
        callReciever: currentUsername

      })
    setIncomingCall(null)
  }

  let initializeMedia = async (sender, reciever) => {
    pcRef.current = new RTCPeerConnection()
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localVideoRef.current.srcObject = stream

    stream.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, stream)
    })

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:sendICE",
          {
            candidate: event.candidate,
            from: sender,
            to: reciever
          })
      }
    }

    pcRef.current.ontrack = (event) => {
      const incomingStream = event.streams[0]
      remoteVideoRef.current.srcObject = incomingStream
    }
  }

  return (
    <div>
      {incomingCall &&
        <div id='msgSection'>
          <p>Incoming call from {incomingCall.from}</p>
          <button>
            <IoCall
              onClick={acceptCall}
              style={{ color: "green" }} />
          </button>
          <button>
            <IoCall
              onClick={rejectCall}
              style={{ color: "red" }} />
          </button>
        </div>}

      <input
        type="text"
        value={username}
        placeholder='Enter Username'
        id="usernameInput"
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={joinUser}>Join</button>
      <button onClick={leaveUser}>Leave</button>

      <h4>Online Users</h4>
      {onlineUsers.map((username, index) => {
        return <div key={index}>
          <span
            onClick={() => {
              setSelectedUser(username)
              console.log("selected user : ", username)
            }}>
            {username}
          </span>
          <button
            onClick={() => {
              sendCallOffer(username)
              setTargetUser(username)
              console.log("target user : ", targetUser)
            }}
          >
            <IoCall />
          </button>
        </div>
      })}

      <h4>video section</h4>
      <video id="localVideo" autoPlay muted playsInline ref={localVideoRef} />
      <video id="remoteVideo" autoPlay playsInline ref={remoteVideoRef} />
    </div>
  )
}

export default App
