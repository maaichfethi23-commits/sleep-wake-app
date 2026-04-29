import { useState, useEffect } from 'react';
import { api } from './api';

const AlarmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', verticalAlign: 'middle', color: '#a855f7' }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const SleepIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', verticalAlign: 'middle', color: '#6366f1' }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'sub', color: '#10b981' }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

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
          <h2><AlarmIcon />Next Alarm</h2>
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : alarm ? (
            <div className="alarm-display">
              <div className="time-huge">{formatTime(alarm.adjusted_time || alarm.target_time)}</div>
              <p className="alarm-detail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {alarm.adjusted_time ? <><SparkleIcon /> Adjusted for traffic/weather</> : "Original target time"}
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
          <h2><SleepIcon />Log Sleep</h2>
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