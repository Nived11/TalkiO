import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Login from "./components/Login"
import Register from "./components/Register"
function App() {

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
