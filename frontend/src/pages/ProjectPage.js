import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ProjectPage() {
  const { id } = useParams();
  const [diary, setDiary] = useState('');
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [aiMsg, setAiMsg] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [newTask, setNewTask] = useState('');

  const load = () => {
    axios.get(`/diary/${id}`).then(res => setEntries(res.data));
    axios.get(`/tasks/${id}`).then(res => setTasks(res.data));
    axios.get(`/files/${id}`).then(res => setFiles(res.data));
  };

  useEffect(() => { load(); }, [id]);

  const addEntry = async () => {
    if (!diary.trim()) return;
    await axios.post('/diary', { project_id: id, content: diary });
    setDiary('');
    load();
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    await axios.post('/tasks', { project_id: id, title: newTask });
    setNewTask('');
    load();
  };

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    await axios.post(`/upload/${id}`, form);
    load();
  };

  const askAI = async () => {
    const res = await axios.post('/ai/chat', { message: aiMsg || 'Кеңес бер' });
    setAiReply(res.data.reply);
    setAiMsg('');
  };

  return (
    <div>
      <h2>Жоба беті</h2>

      <div className="card">
        <h3>Зерттеу күнделігі</h3>
        {entries.map(e => (
          <div key={e.id} style={{marginBottom: '0.8rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px'}}>
            <small>{new Date(e.created_at).toLocaleString('kk-KZ')}</small>
            <p>{e.content}</p>
          </div>
        ))}
        <textarea value={diary} onChange={e => setDiary(e.target.value)} placeholder="Бүгін не істедіңіз?" style={{width: '100%', minHeight: '80px', padding: '0.5rem', marginTop: '1rem'}} />
        <button className="btn" onClick={addEntry} style={{marginTop: '0.5rem'}}>Жазба қосу</button>
      </div>

      <div className="card">
        <h3>Тапсырмалар / Қадамдар</h3>
        {tasks.map(t => (
          <div key={t.id}>• {t.title} — <em>{t.status}</em></div>
        ))}
        <div style={{marginTop: '1rem'}}>
          <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Жаңа тапсырма" style={{padding: '0.5rem', width: '70%'}} />
          <button className="btn" onClick={addTask} style={{marginLeft: '0.5rem'}}>Қосу</button>
        </div>
      </div>

      <div className="card">
        <h3>Файлдар</h3>
        <input type="file" onChange={upload} />
        <ul>
          {files.map(f => <li key={f.id}>{f.filename} ({new Date(f.uploaded_at).toLocaleDateString('kk-KZ')})</li>)}
        </ul>
      </div>

      <div className="card">
        <h3>ЖИ-көмекші</h3>
        <textarea value={aiMsg} onChange={e => setAiMsg(e.target.value)} placeholder="ЖИ-ден не сұрағыңыз келеді?" style={{width: '100%', minHeight: '60px', padding: '0.5rem'}} />
        <button className="btn" onClick={askAI} style={{marginTop: '0.5rem'}}>Сұрау</button>
        {aiReply && <p style={{marginTop: '1rem', padding: '1rem', background: '#edf2f7', borderRadius: '8px'}}>{aiReply}</p>}
      </div>
    </div>
  );
}
