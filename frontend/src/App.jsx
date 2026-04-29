import { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import MouseGlow from './MouseGlow';
import LiquidGlass from './LiquidGlass';
import './index.css';

function App() {
  const [token, setToken] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('dreamSyncToken');
    if (savedToken) {
      setToken(savedToken);
      setShowLanding(false);
    }
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('dreamSyncToken', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('dreamSyncToken');
    setShowLanding(true);
  };

  if (showLanding) {
    return <LiquidGlass onLaunch={() => setShowLanding(false)} />;
  }

  return (
    <>
      <MouseGlow />
      <main className="app-main">
        {token ? (
          <Dashboard token={token} onLogout={handleLogout} />
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </main>
    </>
  );
}

export default App;
