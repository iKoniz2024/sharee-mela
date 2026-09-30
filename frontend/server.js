const path = require('path');

// Set the port (cPanel Passenger uses process.env.PORT to assign a dynamic port or socket)
process.env.PORT = process.env.PORT || 3000;

// Boot the standalone server compiled by Next.js
require(path.join(__dirname, '.next', 'standalone', 'server.js'));
