import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Teacher(){
  const [lessons, setLessons] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)

  // for task/material creation
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [materialFile, setMaterialFile] = useState(null)

  useEffect(()=>{ load() },[])
  const load = ()=> axios.get('/api/lessons/').then(r=>{
    const data = r.data
    const list = Array.isArray(data) ? data : (data && data.results ? data.results : [])
    setLessons(list)
  }).catch(()=>setLessons([]))

  const addLesson = async ()=>{
    if(!title) return alert('Введите заголовок')
    setLoading(true)
    try{
      await axios.post('/api/lessons/', { title, date, description: desc })
      setTitle(''); setDate(''); setDesc('')
      await load()
      alert('Урок добавлен')
    }catch(err){
      console.error(err)
      alert('Ошибка при добавлении урока')
    }finally{ setLoading(false) }
  }

  const addTask = async ()=>{
    if(!selectedLesson) return alert('Выберите урок')
    if(!taskTitle) return alert('Введите заголовок задания')
    setLoading(true)
    try{
      await axios.post('/api/tasks/', { lesson: selectedLesson, title: taskTitle, description: taskDesc })
      setTaskTitle(''); setTaskDesc('')
      await load()
      alert('Задание добавлено')
    }catch(err){
      console.error(err)
      alert('Ошибка при добавлении задания')
    }finally{ setLoading(false) }
  }

  const uploadMaterial = async ()=>{
    if(!selectedLesson) return alert('Выберите урок')
    if(!materialFile) return alert('Выберите файл')
    setLoading(true)
    try{
      const fd = new FormData()
      fd.append('lesson', selectedLesson)
      fd.append('file', materialFile)
      await axios.post('/api/materials/', fd, { headers: {'Content-Type':'multipart/form-data'} })
      setMaterialFile(null)
      await load()
      alert('Материал загружен')
    }catch(err){
      console.error(err)
      alert('Ошибка при загрузке материала')
    }finally{ setLoading(false) }
  }

  return (
    <div className="app-root">
      <div className="container">
        <div className="topbar">
          <h2>Преподаватель — панель</h2>
          <Link to="/teacher/submissions" className="small">Проверить решения</Link>
        </div>

        <div className="section">
          <h3>Добавить урок</h3>
          <input placeholder="Заголовок" value={title} onChange={e=>setTitle(e.target.value)} />
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{marginTop:'8px'}} />
          <textarea placeholder="Описание" value={desc} onChange={e=>setDesc(e.target.value)} style={{marginTop:'8px'}} />
          <div style={{marginTop:'12px'}}>
            <button onClick={addLesson} className="btn-green" disabled={loading}>{loading? 'Сохранение...' : 'Добавить урок'}</button>
          </div>
        </div>

        <div className="section">
          <h3>Управление уроками / заданиями / материалами</h3>
          <div style={{marginBottom:'8px'}}>
            <label className="small">Выберите урок</label>
            <select value={selectedLesson||''} onChange={e=>setSelectedLesson(e.target.value)}>
              <option value="">--</option>
              {lessons.map(l=> <option key={l.id} value={l.id}>{l.title} — {l.date}</option>)}
            </select>
          </div>

          <div style={{marginBottom:'8px'}}>
            <h4>Добавить задание</h4>
            <input placeholder="Заголовок задания" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} />
            <textarea placeholder="Описание задания" value={taskDesc} onChange={e=>setTaskDesc(e.target.value)} style={{marginTop:'8px'}} />
            <div style={{marginTop:'8px'}}>
              <button onClick={addTask} className="btn-green" disabled={loading}>{loading? 'Сохранение...' : 'Добавить задание'}</button>
            </div>
          </div>

          <div>
            <h4>Загрузить материал</h4>
            <input type="file" onChange={e=>setMaterialFile(e.target.files[0])} />
            <div style={{marginTop:'8px'}}>
              <button onClick={uploadMaterial} className="btn-outline" disabled={loading}>{loading? 'Загрузка...' : 'Загрузить'}</button>
            </div>
          </div>
        </div>

        <div className="lessons-list">
          {lessons.map(ls=> (
            <div key={ls.id} className="lesson-card">
              <div>
                <h3>{ls.title} — {ls.date}</h3>
                <p className="small">{ls.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
