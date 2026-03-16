import React, { useEffect, useState } from 'react'
import axios from 'axios'

function startOfMonth(date){
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export default function Calendar(){
  const [lessons, setLessons] = useState([])
  const [date, setDate] = useState(new Date())

  useEffect(()=>{ axios.get('/api/lessons/').then(r=>setLessons(r.data)) },[])
  useEffect(()=>{ axios.get('/api/lessons/').then(r=>{
    const data = r.data
    const list = Array.isArray(data) ? data : (data && data.results ? data.results : [])
    setLessons(list)
  }).catch(()=>setLessons([])) },[])

  const monthStart = startOfMonth(date)
  const month = monthStart.getMonth()
  // compute days in month
  const days = []
  const dCount = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate()
  for(let d=1; d<=dCount; d++) days.push(new Date(date.getFullYear(), date.getMonth(), d))

  const lessonsByDay = {}
  lessons.forEach(l=>{
    lessonsByDay[l.date] = lessonsByDay[l.date] || []
    lessonsByDay[l.date].push(l)
  })

  const prev = ()=> setDate(new Date(date.getFullYear(), date.getMonth()-1, 1))
  const next = ()=> setDate(new Date(date.getFullYear(), date.getMonth()+1, 1))

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Календарь уроков — {date.toLocaleString('ru', {month:'long', year:'numeric'})}</h2>
          <div className="flex gap-2">
            <button onClick={prev} className="px-3 py-2 border rounded">Назад</button>
            <button onClick={next} className="px-3 py-2 border rounded">Вперед</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(h=> <div key={h} className="font-semibold text-center">{h}</div>)}
          {days.map(d=> (
            <div key={d.toISOString()} className="min-h-[80px] p-2 bg-white rounded border">
              <div className="text-sm font-medium">{d.getDate()}</div>
              <div className="mt-1 text-xs">
                {(lessonsByDay[d.toISOString().slice(0,10)] || []).map(l=> (
                  <div key={l.id} className="text-emerald-700">{l.title}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
