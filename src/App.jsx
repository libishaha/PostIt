import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App