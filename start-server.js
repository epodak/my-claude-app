// start-server.js
const path = require('path');
require('dotenv').config();

// 设置默认端口和扫描路径
const PORT = process.env.PORT || 3001;
const SCAN_PATH = process.env.SCAN_PATH || process.cwd();

// 设置环境变量
process.env.PORT = PORT;
process.env.SCAN_PATH = SCAN_PATH;

// 启动服务器
require('./src/backend/server.js');