// src/backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

class Server {
    constructor() {
        this.app = express();
        this.port = 3001;
        this.scanPath = process.env.SCAN_PATH || process.cwd();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // 配置 CORS，明确指定允许的前端端口
        this.app.use(cors({
            origin: 'http://localhost:3000',  // 强制指定前端端口
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }));
        this.app.use(express.json());
    }

    setupRoutes() {
        // 获取端口信息
        this.app.get('/api/port', (_, res) => {
            res.json({
                port: this.port,
                scanPath: this.scanPath
            });
        });

        // 获取文件夹结构
        this.app.get('/api/folders', async (req, res) => {
            try {
                console.log('Scanning directory:', this.scanPath);
                const structure = await this.scanDirectory(this.scanPath);
                res.json(structure);
            } catch (error) {
                console.error('扫描目录失败:', error);
                res.status(500).json({
                    error: '扫描目录失败',
                    message: error.message,
                    path: this.scanPath
                });
            }
        });

        // 健康检查
        this.app.get('/api/health', (_, res) => {
            res.json({
                status: 'ok',
                scanPath: this.scanPath
            });
        });

        // 错误处理中间件
        this.app.use(this.errorHandler.bind(this));
    }

    async scanDirectory(dirPath, depth = 1, maxDepth = 4) {
        try {
            if (depth > maxDepth) return null;

            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const folders = entries
                .filter(entry => entry.isDirectory() && /^[0-9]{3}_/.test(entry.name))
                .map(entry => entry.name);

            const structure = {
                path: dirPath,
                folders,
                children: {}
            };

            for (const folder of folders) {
                const childPath = path.join(dirPath, folder);
                try {
                    const childStructure = await this.scanDirectory(childPath, depth + 1, maxDepth);
                    if (childStructure) {
                        structure.children[folder] = childStructure;
                    }
                } catch (error) {
                    console.error(`扫描文件夹失败 ${folder}:`, error);
                }
            }

            return structure;
        } catch (error) {
            console.error(`扫描目录失败 ${dirPath}:`, error);
            throw error;
        }
    }

    errorHandler(err, req, res, next) {
        console.error('Error:', err.stack);
        res.status(500).json({
            error: '服务器内部错误',
            message: err.message
        });
    }

    async start() {
        try {
            // 验证扫描路径是否存在
            await fs.access(this.scanPath);
            console.log('扫描路径有效:', this.scanPath);

            // 保存端口信息
            const portInfoPath = path.join(process.cwd(), '.port-info');
            await fs.writeJSON(portInfoPath, {
                port: this.port,
                scanPath: this.scanPath
            }, { spaces: 2 });

            return new Promise((resolve) => {
                const server = this.app.listen(this.port, () => {
                    console.log(`后端服务器启动成功: http://localhost:${this.port}`);
                    console.log(`扫描路径: ${this.scanPath}`);

                    // 优雅关闭处理
                    process.on('SIGTERM', () => this.shutdown(server));
                    process.on('SIGINT', () => this.shutdown(server));

                    resolve(server);
                });
            });
        } catch (error) {
            console.error('服务器启动失败:', error);
            throw error;
        }
    }

    async shutdown(server) {
        console.log('正在关闭服务器...');
        server.close(() => {
            console.log('服务器已关闭');
            process.exit(0);
        });
    }
}

// 启动服务器
const startServer = async () => {
    try {
        const server = new Server();
        await server.start();
    } catch (error) {
        console.error('启动失败:', error);
        process.exit(1);
    }
};

// 仅在直接运行时启动服务器
if (require.main === module) {
    startServer();
}

module.exports = Server;