const http = require('http');

const payload = JSON.stringify({
  companyName: 'Test Co',
  fullName: 'Test User',
  email: `auth.test.${Date.now()}@example.com`,
  phoneNumber: '+1234567890',
  password: 'Password123!'
});

const opts = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('HEADERS', res.headers);
    console.log('BODY', body);
  });
});

req.on('error', (err) => {
  console.error('ERROR', err.message);
});

req.write(payload);
req.end();
