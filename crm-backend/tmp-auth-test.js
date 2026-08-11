const axios = require('axios');

(async () => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/auth/signup', {
      companyName: 'TestCo',
      fullName: 'Test User',
      email: 'testuser+copilot@example.com',
      phoneNumber: '+1234567890',
      password: 'Password123!'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Request failed:', error.message);
    }
  }
})();
