import React, { useState } from 'react'
import axios from 'axios'

export default function Register(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')

  const submit = async ()=>{
    try{
      const res = await axios.post('/api/register/', { username, password, role })
      const { access } = res.data
      localStorage.setItem('token', access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      alert('Регистрация успешна')
      window.location.href = '/teacher'
    }catch(err){
      console.error(err)
      alert('Ошибка регистрации')
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Регистрация</h2>
        <input className="w-full p-2 border rounded mb-2" placeholder="Логин" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded mb-2" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="w-full p-2 border rounded mb-2" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="student">Студент</option>
          <option value="teacher">Преподаватель</option>
        </select>
        <div className="flex gap-2">
          <button onClick={submit} className="btn-green">Зарегистрироваться</button>
        </div>
      </div>
    </div>
  )
}
