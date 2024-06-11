import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  /*...*/
  return (
    <div className="container">
      <h1>Home</h1>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/signup')}>Signup</button>
    </div>
  );
}