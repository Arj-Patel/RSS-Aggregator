import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://6fa0-2409-40c1-402e-56ce-199a-608-be22-48b2.ngrok-free.app/v1/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('apiKey', response.data.apiKey);
      console.log(response.data.apiKey);
      navigate('/dashboard'); // Change this line
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="login-input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="login-input" />
        <button type="submit" className="login-button">Log In</button>
      </form>
    </div>
  );
};

export default Login;