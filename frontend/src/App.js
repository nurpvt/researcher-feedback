import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProjectPage from './pages/ProjectPage';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/me').then(res => setUser(res.data)).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      });
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>Зерттеуші Оқушы</h1>
          <div>
            {user ? (
              <>
                <span style={{marginRight: '1rem'}}>{user.name} ({user.role === 'student' ? 'Оқушы' : 'Мұғалім'})</span>
                <Link to={user.role === 'student' ? '/student' : '/teacher'}>Панель</Link>
                <button onClick={logout} style={{marginLeft: '1rem', background: 'transparent', color: 'white', border: '1px solid white', padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer'}}>Шығу</button>
              </>
            ) : (
              <>
                <Link to="/login">Кіру</Link>
                <Link to="/register">Тіркелу</Link>
              </>
            )}
          </div>
        </nav>
        <main>
          <Routes>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student" element={token && user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
            <Route path="/teacher" element={token && user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} />
            <Route path="/project/:id" element={token ? <ProjectPage /> : <Navigate to="/login" />} />
            <Route path="/" element={token ? <Navigate to={user?.role === 'teacher' ? '/teacher' : '/student'} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
