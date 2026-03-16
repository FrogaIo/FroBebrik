import React, { useState } from 'react'
import axios from 'axios'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const submit = async ()=>{
    try{
      const res = await axios.post('/api/token/', { username, password })
      const { access } = res.data
      localStorage.setItem('token', access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      alert('Вход выполнен')
      window.location.href = '/teacher'
    }catch(err){
      console.error(err)
      alert('Ошибка входа: проверьте логин/пароль')
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Вход</h2>
        <input className="w-full p-2 border rounded mb-2" placeholder="Логин" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded mb-2" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={submit} className="btn-green">Войти</button>
        </div>
      </div>
    </div>
  )
}
