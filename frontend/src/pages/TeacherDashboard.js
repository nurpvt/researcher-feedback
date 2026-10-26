import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeacherDashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('/projects').then(res => setProjects(res.data));
  }, []);

  return (
    <div>
      <h2>Мұғалім панелі</h2>
      <div className="card">
        <h3>Барлық жобалар</h3>
        {projects.length === 0 && <p>Жоба жоқ</p>}
        {projects.map(p => (
          <div key={p.id} style={{marginBottom: '1rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '8px'}}>
            <strong>{p.title}</strong>
            <div>Күйі: {p.status}</div>
            <div>Сипаттама: {p.description || '—'}</div>
            <a href={`/project/${p.id}`}>Ашу</a>
          </div>
        ))}
      </div>
    </div>
  );
}
