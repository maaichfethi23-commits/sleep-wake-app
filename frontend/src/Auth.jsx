import { useState } from 'react';
import { api } from './api';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const data = await api.login(email, password);
        onLogin(data.access_token);
      } else {
        await api.register(email, password);
        const data = await api.login(email, password);
        onLogin(data.access_token);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="auth-container glass-panel">
      <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
      <p className="subtitle">DreamSync AI Sleep Assistant</p>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="you@example.com"
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="primary-btn">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      
      <p className="toggle-auth">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}