// 请确保你的脚本文件名为 setup-claude.mjs
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import clipboardy from 'clipboardy';

// 项目路径配置
const findProjectRoot = () => {
  let currentDir = process.cwd();
  while (currentDir !== '/' && !fs.existsSync(path.join(currentDir, 'package.json'))) {
    currentDir = path.dirname(currentDir);
  }
  if (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    throw new Error('未找到 package.json，请在项目根目录运行此脚本');
  }
  return currentDir;
};

const projectRoot = findProjectRoot();
const componentsDir = path.join(projectRoot, 'src', 'components');
const pagePath = path.join(projectRoot, 'src', 'app', 'page.tsx');

// 检查项目结构
const checkProjectStructure = () => {
  console.log('==== 检查项目结构 ====');
  console.log(`项目根目录: ${projectRoot}`);
  console.log(`组件目录: ${componentsDir}`);
  console.log(`页面文件: ${pagePath}`);

  if (!fs.existsSync(projectRoot)) {
    throw new Error(`项目根目录不存在: ${projectRoot}`);
  }

  // 确保目录结构存在
  if (!fs.existsSync(componentsDir)) {
    console.log('组件目录不存在，将创建...');
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  if (!fs.existsSync(pagePath)) {
    console.log('page.tsx 不存在，将创建基础版本...');
    const basicPageContent = `"use client";
import { useState } from "react";
import { Home, Info, Phone, Folder } from "lucide-react";

const Sidebar = ({ currentComponent, setCurrentComponent }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className={\`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 \${
        isHovered ? "w-64" : "w-16"
      }\`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ul className="p-4 space-y-4">
        <li
          className={\`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded \${
            currentComponent === "Home" ? "bg-gray-700" : ""
          }\`}
          onClick={() => setCurrentComponent("Home")}
        >
          <Home className="w-6 h-6" />
          {isHovered && <span>Home</span>}
        </li>
        <li
          className={\`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded \${
            currentComponent === "About" ? "bg-gray-700" : ""
          }\`}
          onClick={() => setCurrentComponent("About")}
        >
          <Info className="w-6 h-6" />
          {isHovered && <span>About</span>}
        </li>
        <li
          className={\`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded \${
            currentComponent === "Contact" ? "bg-gray-700" : ""
          }\`}
          onClick={() => setCurrentComponent("Contact")}
        >
          <Phone className="w-6 h-6" />
          {isHovered && <span>Contact</span>}
        </li>
      </ul>
    </div>
  );
};

export default function Page() {
  const [currentComponent, setCurrentComponent] = useState("Home");

  const renderComponent = () => {
    switch (currentComponent) {
      case "Home":
        return <div className="p-4 text-lg">这是首页组件</div>;
      case "About":
        return <div className="p-4 text-lg">这是关于页面组件</div>;
      case "Contact":
        return <div className="p-4 text-lg">这是联系页面组件</div>;
      default:
        return <div className="p-4 text-lg">未知组件</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar
        currentComponent={currentComponent}
        setCurrentComponent={setCurrentComponent}
      />
      {/* 主内容区域 */}
      <main className="ml-16 p-8">
        {renderComponent()}
      </main>
    </div>
  );
}
`;
    fs.writeFileSync(pagePath, basicPageContent, 'utf-8');
    console.log('已创建基础版的 page.tsx');
  }
};

// 从剪贴板读取代码
const readClipboardCode = async () => {
  console.log('==== 读取剪贴板 ====');
  try {
    const code = await clipboardy.read();
    console.log('成功读取剪贴板内容，长度:', code.length);
    console.log('代码前100个字符:', code.substring(0, 100));

    if (!code.includes('export default')) {
      throw new Error('代码中没有找到 export default 语句');
    }

    return code;
  } catch (err) {
    console.error('剪贴板读取错误:', err);
    throw err;
  }
};

// 保存组件到文件
const saveClipboardCode = (code) => {
  console.log('==== 保存组件文件 ====');

  // 提取文件名的正则表达式
  const patterns = [
    /export default function (\w+)/,             // 匹配 'export default function ComponentName'
    /const (\w+): React\.FC/,                    // 匹配 'const ComponentName: React.FC = () => {}'
    /const (\w+) = \((.*)\) =>/,                 // 匹配 'const ComponentName = (...) =>'
    /function (\w+)\(/,                          // 匹配 'function ComponentName('
    /export default (\w+);/,                     // 匹配 'export default ComponentName;'
  ];

  let fileName = null;
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match) {
      fileName = match[1];
      console.log(`通过模式 ${pattern} 找到组件名: ${fileName}`);
      break;
    }
  }

  if (!fileName) {
    throw new Error('无法提取组件名，请检查代码格式');
  }

  const filePath = path.join(componentsDir, `${fileName}.tsx`);
  console.log(`准备保存到: ${filePath}`);

  fs.writeFileSync(filePath, code, 'utf-8');
  console.log(`组件成功保存到: ${filePath}`);
  return fileName;
};

// 自动安装依赖
const installDependencies = async (code) => {
  console.log('==== 检查依赖 ====');
  const importRegex = /import .* from ['"](.*)['"]/g;
  const dependencies = new Set();
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    const dep = match[1];
    if (!dep.startsWith('.') && !dep.startsWith('@/')) {
      dependencies.add(dep);
    }
  }

  // 检查已有的依赖
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const existingDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const devDependencies = ['@types/react', '@types/node', 'typescript'].filter(
    (dep) => !existingDependencies[dep]
  );
  const prodDependencies = [...dependencies].filter((dep) => !existingDependencies[dep]);

  if (prodDependencies.length > 0) {
    console.log('需要安装以下生产依赖:', prodDependencies);
    await new Promise((resolve, reject) => {
      exec(
        `npm install ${prodDependencies.join(' ')}`,
        { cwd: projectRoot },
        (err, stdout, stderr) => {
          if (err) {
            console.error('生产依赖安装失败:', stderr);
            reject(err);
          } else {
            console.log('生产依赖安装成功:', stdout);
            resolve();
          }
        }
      );
    });
  }

  if (devDependencies.length > 0) {
    console.log('需要安装以下开发依赖:', devDependencies);
    await new Promise((resolve, reject) => {
      exec(
        `npm install -D ${devDependencies.join(' ')}`,
        { cwd: projectRoot },
        (err, stdout, stderr) => {
          if (err) {
            console.error('开发依赖安装失败:', stderr);
            reject(err);
          } else {
            console.log('开发依赖安装成功:', stdout);
            resolve();
          }
        }
      );
    });
  }
};

// 增量更新 page.tsx
const updatePageIncrementally = (fileName) => {
  console.log('==== 增量更新 page.tsx ====');
  console.log(`准备添加组件: ${fileName}`);

  let pageContent = fs.readFileSync(pagePath, 'utf-8');

  // 添加 import 语句
  const importStatement = `import ${fileName} from "../components/${fileName}";`;
  if (!pageContent.includes(importStatement)) {
    pageContent = pageContent.replace(/(import .* from .*;\s*)+/, (match) => {
      return `${match}${importStatement}\n`;
    });
  }

  // 更新 Sidebar
  const sidebarPattern = /<ul className="p-4 space-y-4">([\s\S]*?)<\/ul>/;
  const newSidebarItem = `
          <li
            className={\`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded \${currentComponent === "${fileName}" ? "bg-gray-700" : ""}\`}
            onClick={() => setCurrentComponent("${fileName}") }
          >
            <Folder className="w-6 h-6" />
            {isHovered && <span>${fileName}</span>}
          </li>`;
  if (!pageContent.includes(`onClick={() => setCurrentComponent("${fileName}")}`)) {
    pageContent = pageContent.replace(sidebarPattern, (match, p1) => {
      return `<ul className="p-4 space-y-4">${p1.trim()}${newSidebarItem}\n        </ul>`;
    });
  }

  // 更新 renderComponent
  const renderPattern = /switch \(currentComponent\) \{([\s\S]*?)\n\s+default:/;
  const newRenderCase = `      case "${fileName}":
        return (
          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <${fileName} />
          </div>
        );\n`;
  if (!pageContent.includes(`case "${fileName}":`)) {
    pageContent = pageContent.replace(renderPattern, (match, p1) => {
      return `switch (currentComponent) {${p1}\n${newRenderCase}      default:`;
    });
  }

  fs.writeFileSync(pagePath, pageContent, 'utf-8');
  console.log('page.tsx 已增量更新完成');
};

// 启动开发服务器
const startServer = () => {
  console.log('==== 启动开发服务器 ====');
  exec('npm run dev', { cwd: projectRoot }, (err, stdout, stderr) => {
    if (err) {
      console.error('开发服务器启动失败:', stderr);
    } else {
      console.log('开发服务器已启动');
    }
  });
};

// 主函数
const main = async () => {
  try {
    console.log('==== 开始处理 ====');

    // 检查项目结构
    checkProjectStructure();

    // 读取剪贴板
    const clipboardCode = await readClipboardCode();

    // 保存组件
    const fileName = saveClipboardCode(clipboardCode);

    // 安装依赖
    await installDependencies(clipboardCode);

    // 更新页面
    updatePageIncrementally(fileName);

    // 启动服务器
    startServer();

    console.log('==== 处理完成 ====');
  } catch (error) {
    console.error('发生错误:', error);
    process.exit(1);
  }
};

// 运行主函数
main();
