import { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import './index.css';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('dreamSyncToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('dreamSyncToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('dreamSyncToken');
  };

  return (
    <main className="app-main">
      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </main>
  );
}

export default App;