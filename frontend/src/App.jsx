import { useEffect, useState } from 'react'
import { socket } from "./utils/socket"
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [onlineUsers, SetOnlineUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')

  useEffect(() => {
    socket.on("success", (msg) => {
      console.log(msg)
    })
    socket.on("online-users", (userDB) => {
      let arr = []
      for (let key in userDB) { arr.push(userDB[key]) }
      SetOnlineUsers(arr)
    })
    return () => {
      socket.off("success")
      socket.off("online-users")
    }
  }, [])

  let joinUser = () => {
    console.log(username)
    setUsername('')
    socket.emit("join", username)
  }

  return (
    <>
      <section id="center">
        <input
          type="text"
          value={username}
          placeholder='Enter Username'
          id="usernameInput"
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={joinUser}>Join</button><hr />

        <h4>Online Users</h4>
        {onlineUsers.map((username, index) => {
          return <button
            key={index}
            onClick={() => {
              setSelectedUser(username)
              console.log("selected user : ", username)
            }}>
            {username}
          </button>
        })}
      </section>
    </>
  )
}

export default App
