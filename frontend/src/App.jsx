import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [username, setUsername] = useState('')

  let joinUser = () => {
    console.log(username)
    setUsername('')
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
