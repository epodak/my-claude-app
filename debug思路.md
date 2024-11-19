---
marp: true
theme: am_blue
paginate: true
math: katex
headingDivider: [2,3,4,5]
backgroundColor: #D0E8D6DA
---
调试工作流程规划：
[Optimizing Python-Powered Full-Stack App - Claude](https://claude.ai/chat/1adee611-f002-4eff-8a74-bf5eb1c0eb5d)
1. 第一阶段：清理配置文件
```plaintext
输入：
- 当前的 .env, .env.local, .port-info 文件

执行步骤：
1. 备份现有配置文件
2. 删除 .port-info
3. 合并 .env.local 和 .env 到单一的 .env
4. 仅保留 SCAN_PATH 配置

验证节点：
- 手动启动后端 (node src/backend/server.js)
- 手动启动前端 (npm run dev)
- 确认应用正常运行
```

2. 第二阶段：优化 setup-claude.mjs 中的动态侧边栏生成

```plaintext
输入：
- components 目录中的现有组件
- 剪贴板中的新组件代码

执行步骤：
1. 备份现有 page.tsx
2. 替换 setup-claude.mjs
3. 手动运行 setup-claude.mjs

验证节点：
- 检查组件是否正确显示在侧边栏
- 测试组件动态加载
- 测试剪贴板组件添加
```

3. 第三阶段：后端 API 优化

```plaintext
输入：
- 现有的 server.js

执行步骤：
1. 备份现有 server.js
2. 实现新的组件监控API
3. 添加组件列表管理功能

验证节点：
- 启动后端服务
- 测试 /api/components 接口
- 检查组件变更是否能被检测到
```

调试检查清单：

1. 配置文件清理：
```bash
# 1. 备份现有配置
cp .env .env.backup
cp .env.local .env.local.backup
# 2. 删除多余配置
rm .port-info
# 3. 更新 .env
echo "SCAN_PATH=你的扫描路径" > .env
# 4. 验证
node src/backend/server.js
# 新开终端
npm run dev
```

2. setup-claude.mjs 更新：
```bash
# 1. 备份
cp setup-claude.mjs setup-claude.mjs.backup
# 2. 更新文件
# 3. 测试
node setup-claude.mjs
# 4. 验证
- 打开浏览器检查 localhost:3000
- 测试组件加载
- 复制新组件到剪贴板并验证自动添加
```

3. 后端API测试：
```bash
# 1. 测试组件API
curl http://localhost:3001/api/components
# 2. 监控组件变化
- 添加新组件文件
- 检查API响应
- 验证前端更新
```

按这个流程,我们可以逐步验证每个改动,确保所有功能正常工作。你想先从哪个阶段开始调试？