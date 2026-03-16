import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import IDE from '../components/IDE'

function formatDate(d){
  try{
    const dt = new Date(d)
    return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
  }catch{ return d }
}

export default function Student(){
  const [lessons, setLessons] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(()=>{
    axios.get('/api/lessons/').then(r=>{
      const data = r.data
      const list = Array.isArray(data) ? data : (data && data.results ? data.results : [])
      setLessons(list)
      if(list.length>0 && !selectedDate) setSelectedDate(list[0].date)
    }).catch(()=>setLessons([]))
  },[])

  const dates = useMemo(()=>{
    const s = Array.from(new Set(lessons.map(l=>l.date))).sort()
    return s
  },[lessons])

  const lessonsForDate = useMemo(()=> lessons.filter(l=> l.date === selectedDate),[lessons, selectedDate])

  return (
    <div className="app-root">
      <div className="container student-grid">
        <div className="student-header topbar">
          <h2>FroBebrik — Хехе бЭбрик</h2>
          <div className="small">Выберите дату и открой задание в IDE</div>
        </div>

        <div className="student-body">
          <aside className="calendar-panel section">
            <h3>Календарь</h3>
            {dates.length===0 && <div className="small">Нет уроков</div>}
            <div className="calendar-list">
              {dates.map(d=> (
                <button key={d} className={`calendar-day ${d===selectedDate? 'active':''}`} onClick={()=>{ setSelectedDate(d); setSelectedLesson(null); setSelectedTask(null)}}>
                  <div className="date">{formatDate(d)}</div>
                  <div className="count small">{lessons.filter(l=>l.date===d).length} урок</div>
                </button>
              ))}
            </div>
          </aside>

          <main className="lessons-panel">
            <h3>Уроки — {selectedDate || 'все'}</h3>
            {lessonsForDate.length===0 && <div className="small">Нет уроков на выбранную дату</div>}
            <div className="lessons-list">
              {lessonsForDate.map(lesson=> (
                <div key={lesson.id} className={`lesson-card ${selectedLesson && selectedLesson.id===lesson.id ? 'selected':''}`} onClick={()=>{ setSelectedLesson(lesson); setSelectedTask(null)}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <h4 style={{margin:0}}>{lesson.title}</h4>
                      <div className="small">{lesson.description}</div>
                    </div>
                    <div className="small">{formatDate(lesson.date)}</div>
                  </div>

                  <div style={{marginTop:10}}>
                    <strong>Задания:</strong>
                    {(!lesson.tasks || lesson.tasks.length===0) && <div className="small">Нет заданий</div>}
                    {lesson.tasks && lesson.tasks.map(t=> (
                      <div key={t.id} className="task-row">
                        <div>
                          <div className="small" style={{fontWeight:700}}>{t.title}</div>
                          <div className="small">{t.description}</div>
                        </div>
                        <div>
                          <button onClick={(e)=>{ e.stopPropagation(); setSelectedTask(t); }} className="btn-green">Открыть IDE</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>

          <aside className="ide-panel section">
            {selectedTask ? (
              <div>
                <h3>IDE — {selectedTask.title}</h3>
                <div className="small" style={{marginBottom:8}}>{selectedTask.description}</div>
                <IDE taskId={selectedTask.id} onSubmitted={()=>{ setSelectedTask(null) }} />
              </div>
            ) : (
              <div className="small">Выберите задание, чтобы открыть IDE</div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
