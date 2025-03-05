import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from "./components/Login"
import Register from "./components/Register"
import Home from './components/Home'
import Profile from './components/profile'
function App() {

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile/:id" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
