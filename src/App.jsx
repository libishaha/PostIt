import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Profile from './pages/Profile'

function PrivateRoute({children}){
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to = "/login"/>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element = {<Navigate to = "/login"/>}/>
        <Route path ="/login" element = {<Login/>}/>
        <Route path ="/signup" element = {<Signup/>}/>
        <Route path ="/home" element = {<PrivateRoute><Home/></PrivateRoute>}/>
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App