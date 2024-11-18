---
marp: true
theme: am_blue
paginate: true
math: katex
headingDivider: [2,3,4,5]
backgroundColor: #D0E8D6DA
---
# 项目说明文档

## 项目简介

本项目旨在快速集成 Claude AI 生成的 React 代码，通过自动识别剪贴板中的组件代码，将其插入到本地的组件目录，并动态加载到应用中。主要功能包括：

- 自动识别剪贴板中的 React 组件。
- 动态生成或更新 `page.tsx` 文件以展示所有组件。
- 提供简单的卸载功能，通过按钮移除不需要的组件。
- 结合 Next.js 实现完整的前后端动态更新。

---

## 目录结构

```
project_root/
├── next_init.sh            # 用于创建基础环境的脚本
├── gpage.py                # 组件管理入口脚本
├── setup-claude.mjs        # 核心功能脚本，处理组件动态加载与卸载功能
├── src/
│   ├── app/
│   │   ├── page.tsx        # 自动生成的页面文件，动态加载组件
│   │   └── api/
│   │       └── uninstall/  # API 路由，用于支持卸载功能
│   │           └── route.ts
│   └── components/         # 存放所有的组件文件
└── README.md               # 项目说明文档
```

---

## 环境搭建

1. **安装依赖**
   确保你已经安装了以下工具：
   - Node.js
   - Python 3.x

2. **初始化项目**
   运行 `next_init.sh` 脚本，初始化 Next.js 环境。

   ```bash
   ./next_init.sh
   ```

   该脚本将会：
   - 初始化一个新的 Next.js 项目。
   - 安装必要的依赖。
   - 配置项目的基础结构。

3. **运行项目**
   初始化完成后，启动开发服务器：

   ```bash
   npm run dev
   ```

---

## 功能说明

### 1. **gpage.py**

`gpage.py` 是项目的组件管理脚本，负责从剪贴板读取组件代码并将其插入到项目中：

- **运行方式**：

  ```bash
  python3 gpage.py
  ```

- **功能**：
  1. 自动读取剪贴板中的内容，解析出 React 组件代码。
  2. 将解析的组件保存到 `src/components/` 目录下。
  3. 调用 `setup-claude.mjs`，重建 `page.tsx`，动态加载所有组件。

### 2. **setup-claude.mjs**

`setup-claude.mjs` 是项目的核心脚本，支持以下功能：

- **剪贴板检测与组件管理**
  - 从剪贴板读取 React 代码，保存为 `.tsx` 文件。
  - 扫描 `src/components/` 目录下所有组件，确保动态加载。
  - 重建 `page.tsx`，包括卸载按钮和组件展示。

- **组件卸载功能**
  自动创建 `src/app/api/uninstall/route.ts` 路由，支持通过界面卸载组件。

- **运行方式**：

  ```bash
  node setup-claude.mjs
  ```

  或通过 `gpage.py` 调用。

---

## 使用流程

1. **初始化项目**
   运行 `next_init.sh`，启动 Next.js 开发服务器。

2. **生成组件**
   将 Claude AI 生成的 React 组件代码复制到剪贴板。

3. **运行管理脚本**
   执行 `python3 gpage.py`：
   - 组件会自动保存到 `src/components/` 目录。
   - `page.tsx` 会自动重建，加载所有组件。

4. **查看结果**
   打开浏览器，访问 `http://localhost:3000`，可以看到页面中加载的所有组件。

5. **卸载组件**
   点击页面中的卸载按钮，可直接删除指定组件。

---

## 注意事项

- 剪贴板中的组件必须包含 `export default function ComponentName` 格式。
- 运行脚本前，请确保剪贴板中包含有效的 React 代码。

---

## 常见问题

### Q: 无法读取剪贴板内容？
A: 确保安装了 `clipboardy` 模块，并正确配置剪贴板权限。

### Q: `page.tsx` 无法加载新组件？
A: 确认组件是否保存在 `src/components/` 目录，或检查运行脚本是否出错。

---

## 示例

1. **剪贴板中的代码**：

   ```jsx
   export default function WeatherCard() {
     return <div>WeatherCard Component</div>;
   }
   ```

2. **运行 `python3 gpage.py` 后的结果**：

   页面中会显示 `WeatherCard Component`，并在侧边栏中显示相应的卸载按钮。

---

## 后续计划

- 支持多页面组件加载。
- 增强剪贴板内容的检测与错误处理。
- 添加更多组件管理功能，如排序、分组等。