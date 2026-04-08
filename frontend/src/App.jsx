import { useState } from 'react'
import { socket } from "./utils/socket"
import './App.css'

function App() {
  const [username, setUsername] = useState('')

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
        <button onClick={joinUser}>Join</button>
      </section>
    </>
  )
}

export default App
