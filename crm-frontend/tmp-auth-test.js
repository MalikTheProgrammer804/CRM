import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function run() {
  try {
    const signupData = {
      companyName: 'TestCoSample',
      fullName: 'Test User',
      email: `auth.test.${Date.now()}@example.com`,
      phoneNumber: '+1234567890',
      password: 'Password123!'
    };

    const signup = await axios.post(`${API_BASE_URL}/auth/signup`, signupData, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('SIGNUP', signup.status, signup.data);
  } catch (err) {
    if (err.response) {
      console.error('SIGNUP ERR', err.response.status, err.response.data);
    } else {
      console.error('SIGNUP ERR', err.message);
    }
  }
}

run();
