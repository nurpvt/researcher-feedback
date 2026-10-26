import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('username', email);
      form.append('password', password);
      const res = await axios.post('/token', form);
      localStorage.setItem('token', res.data.access_token);
      setToken(res.data.access_token);
      navigate(res.data.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError('Email немесе құпия сөз қате');
    }
  };

  return (
    <div className="card" style={{maxWidth: '400px', margin: '2rem auto'}}>
      <h2>Кіру</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{width: '100%', padding: '0.6rem', marginBottom: '0.8rem'}} />
        <input type="password" placeholder="Құпия сөз" value={password} onChange={e => setPassword(e.target.value)} required style={{width: '100%', padding: '0.6rem', marginBottom: '0.8rem'}} />
        <button className="btn" type="submit" style={{width: '100%'}}>Кіру</button>
      </form>
    </div>
  );
}
