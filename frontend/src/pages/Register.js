import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'student', grade: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Қате орын алды');
    }
  };

  return (
    <div className="card" style={{maxWidth: '400px', margin: '2rem auto'}}>
      <h2>Тіркелу</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Аты-жөні" value={form.name} onChange={handleChange} required style={{width: '100%', padding: '0.6rem', marginBottom: '0.8rem'}} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{width: '100%', padding: '0.6rem', marginBottom: '0.8rem'}} />
        <input name="password" type="password" placeholder="Құпия сөз" value={form.password} onChange={handleChange} required style={{width: '100%', padding: '0.6rem', marginBottom: '0.8rem'}} />
        <select name="role" value={form.role} onChange={handleChange} style={{width: '100%', padding: '0.6rem', marginBottom: '0.8rem'}}>
          <option value="student">Оқушы</option>
          <option value="teacher">Мұғалім</option>
        </select>
        {form.role === 'student' && (
          <input name="grade" placeholder="Сынып (мысалы: 9А)" value={form.grade} onChange={handleChange} style={{width: '100%', padding: '0.6rem', marginBottom: '0.8rem'}} />
        )}
        <button className="btn" type="submit" style={{width: '100%'}}>Тіркелу</button>
      </form>
    </div>
  );
}
