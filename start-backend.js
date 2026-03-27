#!/usr/bin/env node

// Load environment variables first
require('dotenv').config({ path: './backend/.env' });

// Apply DNS fix globally
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Import and start the backend
require('./backend/dist/index.js');
