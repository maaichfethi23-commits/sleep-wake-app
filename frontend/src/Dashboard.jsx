import { useState, useEffect } from 'react';
import { api } from './api';

export default function Dashboard({ token, onLogout }) {
  const [alarm, setAlarm] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sleep log states
  const [bedtime, setBedtime] = useState('');
  const [wakeupTime, setWakeupTime] = useState('');
  const [quality, setQuality] = useState(5);
  const [logStatus, setLogStatus] = useState('');

  const fetchAlarm = async () => {
    try {
      const data = await api.getNextAlarm(token);
      setAlarm(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarm();
  }, [token]);

  const handleSync = async () => {
    setLoading(true);
    try {
      await api.syncCalendar(token);
      await fetchAlarm();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSleepLogSubmit = async (e) => {
    e.preventDefault();
    setLogStatus('Submitting...');
    try {
      const bTime = new Date(bedtime).toISOString();
      const wTime = new Date(wakeupTime).toISOString();
      await api.submitSleepLog(token, {
        bedtime: bTime,
        wakeup_time: wTime,
        quality_score: quality
      });
      setLogStatus('Logged successfully!');
      setTimeout(() => setLogStatus(''), 3000);
      setBedtime('');
      setWakeupTime('');
      setQuality(5);
    } catch (err) {
      console.error(err);
      setLogStatus('Failed to log sleep');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>DreamSync Dashboard</h1>
        <button onClick={onLogout} className="outline-btn">Log Out</button>
      </header>

      <div className="grid">
        <section className="glass-panel alarm-section">
          <h2>Next Alarm</h2>
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : alarm ? (
            <div className="alarm-display">
              <div className="time-huge">{formatTime(alarm.adjusted_time || alarm.target_time)}</div>
              <p className="alarm-detail">
                {alarm.adjusted_time ? "Adjusted for traffic/weather" : "Original target time"}
              </p>
              <button onClick={handleSync} className="primary-btn sync-btn">Sync Calendar Again</button>
            </div>
          ) : (
            <div className="no-alarm">
              <p>No active alarms.</p>
              <button onClick={handleSync} className="primary-btn">Sync with Calendar</button>
            </div>
          )}
        </section>

        <section className="glass-panel log-section">
          <h2>Log Sleep</h2>
          {logStatus && <div className="status-msg">{logStatus}</div>}
          <form onSubmit={handleSleepLogSubmit} className="log-form">
            <div className="input-group">
              <label>Bedtime</label>
              <input 
                type="datetime-local" 
                value={bedtime} 
                onChange={(e) => setBedtime(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Wakeup Time</label>
              <input 
                type="datetime-local" 
                value={wakeupTime} 
                onChange={(e) => setWakeupTime(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Quality Score ({quality}/10)</label>
              <input 
                type="range" 
                min="1" max="10" 
                value={quality} 
                onChange={(e) => setQuality(Number(e.target.value))} 
              />
            </div>
            <button type="submit" className="primary-btn">Submit Log</button>
          </form>
        </section>
      </div>
    </div>
  );
}
