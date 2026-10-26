import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function StudentDashboard() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const load = () => axios.get('/projects').then(res => setProjects(res.data));

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title) return;
    await axios.post('/projects', { title, description: desc });
    setTitle(''); setDesc('');
    load();
  };

  return (
    <div>
      <h2>Оқушы панелі</h2>
      <div className="card">
        <h3>Жаңа жоба</h3>
        <input placeholder="Жоба атауы" value={title} onChange={e => setTitle(e.target.value)} style={{width: '100%', padding: '0.5rem', marginBottom: '0.5rem'}} />
        <textarea placeholder="Қысқаша сипаттама" value={desc} onChange={e => setDesc(e.target.value)} style={{width: '100%', padding: '0.5rem', marginBottom: '0.5rem'}} />
        <button className="btn" onClick={create}>Жоба бастау</button>
      </div>
      <div className="card">
        <h3>Менің жобаларым</h3>
        {projects.length === 0 && <p>Әлі жоба жоқ</p>}
        {projects.map(p => (
          <div key={p.id} style={{marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee'}}>
            <Link to={`/project/${p.id}`}><strong>{p.title}</strong></Link>
            <div>Күйі: {p.status}</div>
            <small>{new Date(p.created_at).toLocaleDateString('kk-KZ')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
