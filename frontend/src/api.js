const API_URL = "http://localhost:8000";

export const api = {
  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  async register(email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Registration failed");
    return res.json();
  },

  async syncCalendar(token) {
    const res = await fetch(`${API_URL}/alarms/sync-calendar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Sync failed");
    return res.json();
  },

  async getNextAlarm(token) {
    const res = await fetch(`${API_URL}/alarms/next`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch alarm");
    return res.json();
  },

  async submitSleepLog(token, data) {
    const res = await fetch(`${API_URL}/sleep-logs/submit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit log");
    return res.json();
  }
};