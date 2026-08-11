const axios = require('axios');

(async () => {
  try {
    const api = axios.create({ baseURL: 'http://127.0.0.1:5000/api', headers: { 'Content-Type': 'application/json' } });
    const login = await api.post('/auth/login', { email: 'mina@northstar.co', password: 'Password123!' });
    const token = login.data.token;
    const payload = {
      title: 'Test Task title',
      description: 'Task create test',
      category: 'Call',
      dueAt: null,
      priority: 'Medium',
      reminderEnabled: true,
    };
    const response = await api.post('/tasks', payload, { headers: { Authorization: `Bearer ${token}` } });
    console.log('created', response.data);
  } catch (err) {
    if (err.response) {
      console.error('status', err.response.status);
      console.error('data', err.response.data);
    } else {
      console.error(err.message);
    }
  }
})();