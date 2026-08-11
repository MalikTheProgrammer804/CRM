const axios = require('axios');

(async () => {
  try {
    const signupResponse = await axios.post(
      'http://127.0.0.1:5000/api/auth/signup',
      {
        companyName: 'TestCo',
        fullName: 'Test User',
        email: 'testuser+copilot2@example.com',
        phoneNumber: '+1234567891',
        password: 'Password123!'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('Signup status:', signupResponse.status);
    const token = signupResponse.data.token;
    console.log('Signup data:', signupResponse.data.user);

    const discoveryResponse = await axios.get('http://127.0.0.1:5000/api/lead-discovery/search', {
      params: { query: 'dental', category: 'clinic' },
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Lead discovery status:', discoveryResponse.status);
    console.log('Lead discovery sample:', discoveryResponse.data.results.slice(0, 3));
  } catch (error) {
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Request failed:', error.message);
    }
  }
})();
