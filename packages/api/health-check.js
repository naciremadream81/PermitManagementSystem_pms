const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/profile',
  method: 'GET',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200 || res.statusCode === 401) {
    // 200 = OK, 401 = Unauthorized (but service is running)
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.on('timeout', () => {
  request.destroy();
  process.exit(1);
});

request.end();
