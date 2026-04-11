import { useEffect, useState } from 'react'
import { socket } from "./utils/socket"
import { IoCall } from "react-icons/io5";
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [currentUsername, setCurrentUsername] = useState('')
  const [onlineUsers, SetOnlineUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [incomingCall, setIncomingCall] = useState(null)

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
    })
    socket.on("incomingCall", (callData) => {
      console.log("incoming call from :", callData.from)
      setIncomingCall(callData)
    })

    return () => {
      socket.off("success")
      socket.off("online-users")
      socket.off("disconnect")
      socket.off("incomingCall")
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
  }

  let sendCallOffer = (targetUser) => {
    console.log("sendCallOffer triggered")
    console.log(`From : ${currentUsername}\nto : ${targetUser}`)
    socket.emit("callOffer", { to: targetUser, from: currentUsername })
  }

  let acceptCall = () => {
    socket.emit("acceptCall",
      {
        callSender: incomingCall,
        callReciever: currentUsername

      })
      setIncomingCall(null)
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
            <IoCall style={{ color: "red" }} />
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
            onClick={() => sendCallOffer(username)}
          >
            <IoCall />
          </button>
        </div>
      })}
    </div>
  )
}

export default App
