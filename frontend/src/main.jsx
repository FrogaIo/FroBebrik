import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import axios from 'axios'

const token = localStorage.getItem('token')
if(token && token !== 'null' && token !== 'undefined'){
  if(typeof token === 'string' && token.split('.').length === 3){
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }else{
    localStorage.removeItem('token')
  }
}
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:8000'
}

axios.interceptors.response.use(response => response, err => {
  if(err && err.response && err.response.status === 401){
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    if(window.location.pathname !== '/login') window.location.href = '/login'
  }
  return Promise.reject(err)
})
import App from './App'
import Teacher from './pages/Teacher'
import TeacherSubmissions from './pages/TeacherSubmissions'
import Calendar from './pages/Calendar'
import Login from './pages/Login'
import Register from './pages/Register'
import Student from './pages/Student'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/teacher' element={<Teacher />} />
        <Route path='/teacher/submissions' element={<TeacherSubmissions />} />
        <Route path='/calendar' element={<Calendar />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/student' element={<Student />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
