import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function TeacherSubmissions(){
  const [subs, setSubs] = useState([])

  useEffect(()=>{ load() },[])
  const load = ()=> axios.get('/api/submissions/').then(r=>setSubs(r.data))

  const grade = async (id, score)=>{
    try{
      await axios.post(`/api/submissions/${id}/grade/`, { score })
      await load()
      alert('Оценка выставлена')
    }catch(err){
      console.error(err)
      alert('Ошибка при выставлении оценки')
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Проверка решений</h2>
        <div className="space-y-4">
          {subs.map(s=> (
            <div key={s.id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{s.task} — {s.student ? s.student.username : 'Аноним'}</div>
                  <div className="text-sm text-gray-600">Отправлено: {new Date(s.created_at).toLocaleString()}</div>
                  <pre className="bg-gray-100 p-2 mt-2 rounded max-h-48 overflow-auto">{s.code}</pre>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm">Оценка: {s.score===null? '—' : s.score}</div>
                  <button onClick={()=>grade(s.id, 100)} className="btn-green">100</button>
                  <button onClick={()=>grade(s.id, 0)} className="px-3 py-2 border rounded">0</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
