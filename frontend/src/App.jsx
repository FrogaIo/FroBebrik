import React from 'react'
import { Link } from 'react-router-dom'

export default function App(){
  return (
    <div className="app-root">
      <div className="container">
        <h1>FroBebrik — Мини-LMS для изучения Python</h1>
        <p>Выберите роль:</p>
        <div className="button-row">
          <Link to="/teacher" className="btn-green">Frogalo(Бэбрикам нильзя, а не то прекручу jvt токены нахуй)</Link>
          <Link to="/student" className="btn-outline">Bebrik</Link>
        </div>
        <div className="auth-links">
          <Link to="/login">Вход(-)</Link>  · <Link to="/calendar">Календарь</Link>
        </div>
      </div>
    </div>
  )
}
