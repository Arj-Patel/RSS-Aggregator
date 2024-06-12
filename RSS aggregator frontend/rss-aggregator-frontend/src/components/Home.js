import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css'; // Import the CSS Module

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1>Home</h1>
      <button className={styles.Login} onClick={() => navigate('/login')}>Login</button>
      <button className={styles.Signup} onClick={() => navigate('/signup')}>Signup</button>
    </div>
  );
}