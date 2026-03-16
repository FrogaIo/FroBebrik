import React, { useState } from 'react'
import axios from 'axios'

export default function IDE({taskId, onSubmitted}){
  const [code, setCode] = useState(`# Пишите код здесь\nprint('Hello, FroBebrik!')`)
  const [output, setOutput] = useState('')

  const run = async () => {
    setOutput('Выполняется...')
    try{
      const res = await axios.post('/api/run/', { code })
      if(res.data.error) setOutput(res.data.error)
      else setOutput(res.data.stdout + (res.data.stderr? '\nERR:\n'+res.data.stderr : ''))
    }catch(err){
      console.error(err)
      setOutput('Ошибка при выполнении')
    }
  }

  const submit = async () => {
    try{
      await axios.post('/api/submissions/', { task_id: taskId, code })
      if(onSubmitted) onSubmitted()
      alert('Решение отправлено преподавателю')
    }catch(err){
      console.error(err)
      alert('Ошибка при отправке решения')
    }
  }

  return (
    <div className="space-y-3">
      <textarea value={code} onChange={e=>setCode(e.target.value)} className="w-full h-60 p-2 border rounded font-mono" />
      <div className="flex gap-2">
        <button onClick={run} className="btn-green">Запустить</button>
        <button onClick={submit} className="px-3 py-2 border rounded">Отправить</button>
      </div>
      <pre className="bg-gray-100 p-3 rounded h-40 overflow-auto">{output}</pre>
    </div>
  )
}
