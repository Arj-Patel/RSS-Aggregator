import React, { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import './Signup.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSubmit = async (event) => {
    event.preventDefault();
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    try {
      const response = await axios.post('http://localhost:8080/v1/users', { name, email, password: hashedPassword });
      console.log(response.data);
      navigate('/dashboard'); // Change this line
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = () => {
    navigate('/login'); // Navigate to the Login page
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="signup-input" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="signup-input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="signup-input" />
        <button type="submit" className="signup-button">Sign Up</button>
        <button type="button" onClick={handleLogin} className="login-button">I'm already a user (Login)</button> {/* Add the Login button */}
      </form>
    </div>
  );
};

export default Signup;