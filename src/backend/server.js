// src/backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupRoutes() {
        // 获取端口信息
        this.app.get('/api/port', (_, res) => {
            res.json({ port: this.port });
        });

        // 获取文件夹结构
        this.app.get('/api/folders', async (req, res) => {
            try {
                const basePath = req.query.path || process.cwd();
                const structure = await this.scanDirectory(basePath);
                res.json(structure);
            } catch (error) {
                console.error('扫描目录失败:', error);
                res.status(500).json({
                    error: '扫描目录失败',
                    message: error.message
                });
            }
        });

        // 健康检查
        this.app.get('/api/health', (_, res) => {
            res.json({ status: 'ok' });
        });

        // 错误处理中间件
        this.app.use(this.errorHandler.bind(this));
    }

    async scanDirectory(dirPath, depth = 1, maxDepth = 4) {
        if (depth > maxDepth) return null;

        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const folders = entries
            .filter(entry => entry.isDirectory() && /^[0-9]{3}_/.test(entry.name))
            .map(entry => entry.name);

        const structure = {
            path: path.relative(process.cwd(), dirPath),
            folders,
            children: {}
        };

        for (const folder of folders) {
            const childPath = path.join(dirPath, folder);
            const childStructure = await this.scanDirectory(childPath, depth + 1, maxDepth);
            if (childStructure) {
                structure.children[folder] = childStructure;
            }
        }

        return structure;
    }

    errorHandler(err, req, res, next) {
        console.error(err.stack);
        res.status(500).json({
            error: '服务器内部错误',
            message: err.message
        });
    }

    async start() {
        try {
            // 确保端口信息目录存在
            const portInfoPath = path.join(process.cwd(), '.port-info');
            await fs.writeJSON(portInfoPath, { port: this.port }, { spaces: 2 });

            return new Promise((resolve) => {
                const server = this.app.listen(this.port, () => {
                    console.log(`后端服务器启动成功: http://localhost:${this.port}`);
                    
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