const axios = require('axios');

(async () => {
  try {
    const api = axios.create({ baseURL: 'http://127.0.0.1:5000/api', headers: { 'Content-Type': 'application/json' } });
    const login = await api.post('/auth/login', { email: 'mina@northstar.co', password: 'Password123!' });
    console.log('login', login.data);
    const token = login.data.token;
    const lead = {
      businessName: 'Test Lead Inc',
      ownerName: 'Test Owner',
      category: 'Testing',
      phone: '+1 555 0100',
      email: 'test-lead@example.com',
      website: 'https://example.com',
      address: '123 Test Street',
      facebook: 'facebook.com/test',
      instagram: 'instagram.com/test',
      linkedin: 'linkedin.com/test',
      group: 'Testers',
      assignedTo: 'Test Owner',
      notes: 'Created during backend test',
      status: 'New',
      source: 'Manual Entry',
    };
    const response = await api.post('/leads', lead, { headers: { Authorization: `Bearer ${token}` } });
    console.log('created', response.data);
  } catch (err) {
    if (err.response) {
      console.error('status', err.response.status);
      console.error('headers', err.response.headers);
      console.error('data', err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
})();