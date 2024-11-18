import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import clipboardy from 'clipboardy';

// 项目路径配置
const projectRoot = path.resolve('.');
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
    const basicPageContent = `
import React, { useState } from 'react';
import { Folder } from 'lucide-react';

export default function Home() {
  const [currentComponent, setCurrentComponent] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const renderComponent = () => {
    switch (currentComponent) {
      default:
        return <div>Select a component</div>;
    }
  };

  return (
    <main className="flex min-h-screen">
      <nav className="w-16 hover:w-48 transition-all bg-gray-800 text-white">
        <ul className="p-2 space-y-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
        </ul>
      </nav>
      <div className="flex-1 p-4">
        {renderComponent()}
      </div>
    </main>
  );
}
`;
    fs.writeFileSync(pagePath, basicPageContent, 'utf-8');
  }
};

// 从剪贴板读取代码
const readClipboardCode = async () => {
  console.log('==== 读取剪贴板 ====');
  try {
    const code = await clipboardy.read();
    console.log('成功读取剪贴板内容，长度:', code.length);
    console.log('代码前100个字符:', code.substring(0, 100));

    // 更严格的组件代码验证
    if (!code.includes('React')) {
      console.log('警告: 代码中没有找到 React 引用');
    }
    if (!code.includes('export default')) {
      throw new Error('代码中没有找到 export default 语句');
    }
    if (!code.match(/const \w+: React\.FC/)) {
      console.log('警告: 没有找到 React.FC 类型声明');
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

  // 提取文件名的正则表达式增强版
  const patterns = [
    /export default function (\w+)/,
    /const (\w+): React\.FC/,
    /const (\w+) = \(\)/,
    /function (\w+)\(/
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
const installDependencies = (code) => {
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

  // 添加必要的核心依赖
  dependencies.add('react');
  dependencies.add('lucide-react');
  dependencies.add('@types/react');
  dependencies.add('@types/node');
  dependencies.add('typescript');

  if (dependencies.size > 0) {
    console.log('检测到以下依赖:', [...dependencies]);
    return new Promise((resolve, reject) => {
      // 分别安装开发依赖和生产依赖
      const devDependencies = ['@types/react', '@types/node', 'typescript'];
      const prodDependencies = [...dependencies].filter(dep => !devDependencies.includes(dep));

      // 先安装生产依赖
      const installProd = new Promise((resolveProd, rejectProd) => {
        if (prodDependencies.length > 0) {
          exec(
            `npm install ${prodDependencies.join(' ')}`,
            { cwd: projectRoot },
            (err, stdout, stderr) => {
              if (err) {
                console.error('生产依赖安装失败:', stderr);
                rejectProd(err);
              } else {
                console.log('生产依赖安装成功:', stdout);
                resolveProd();
              }
            }
          );
        } else {
          resolveProd();
        }
      });

      // 然后安装开发依赖
      const installDev = new Promise((resolveDev, rejectDev) => {
        if (devDependencies.length > 0) {
          exec(
            `npm install -D ${devDependencies.join(' ')}`,
            { cwd: projectRoot },
            (err, stdout, stderr) => {
              if (err) {
                console.error('开发依赖安装失败:', stderr);
                rejectDev(err);
              } else {
                console.log('开发依赖安装成功:', stdout);
                resolveDev();
              }
            }
          );
        } else {
          resolveDev();
        }
      });

      // 等待所有依赖安装完成
      Promise.all([installProd, installDev])
        .then(resolve)
        .catch(reject);
    });
  }
  return Promise.resolve();
};

// 更新 page.tsx
const updatePage = (fileName) => {
  console.log('==== 更新 page.tsx ====');
  console.log(`准备添加组件: ${fileName}`);

  // 新的页面模板
  const newPageContent = `"use client";
import { useState } from "react";
import { Home, Info, Phone, Folder } from "lucide-react";
import ${fileName} from "../components/${fileName}";

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
        <li
          className={\`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded \${
            currentComponent === "${fileName}" ? "bg-gray-700" : ""
          }\`}
          onClick={() => setCurrentComponent("${fileName}")}
        >
          <Folder className="w-6 h-6" />
          {isHovered && <span>Folder Structure</span>}
        </li>
      </ul>
    </div>
  );
};

export default function Page() {
  const [currentComponent, setCurrentComponent] = useState("${fileName}");

  const renderComponent = () => {
    switch (currentComponent) {
      case "Home":
        return <div className="p-4 text-lg">这是首页组件</div>;
      case "About":
        return <div className="p-4 text-lg">这是关于页面组件</div>;
      case "Contact":
        return <div className="p-4 text-lg">这是联系页面组件</div>;
      case "${fileName}":
        return (
          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <${fileName} />
          </div>
        );
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
}`;

  // 直接写入新的内容，而不是修改现有内容
  fs.writeFileSync(pagePath, newPageContent, 'utf-8');
  console.log('page.tsx 完全更新完成');
};

// 启动开发服务器
const startServer = () => {
  console.log('==== 启动开发服务器 ====');
  return new Promise((resolve, reject) => {
    exec('npm run dev', { cwd: projectRoot }, (err, stdout, stderr) => {
      if (err) {
        console.error('开发服务器启动失败:', stderr);
        reject(err);
      } else {
        console.log('开发服务器输出:', stdout);
        resolve();
      }
    });
  });
};

// 主函数
const main = async () => {
  try {
    console.log('==== 开始处理 ====');

    // 检查项目结构
    await checkProjectStructure();

    // 读取剪贴板
    const clipboardCode = await readClipboardCode();

    // 保存组件
    const fileName = saveClipboardCode(clipboardCode);

    // 安装依赖
    await installDependencies(clipboardCode);

    // 更新页面
    updatePage(fileName);

    // 延迟启动服务器
    console.log('等待 5 秒后启动服务器...');
    setTimeout(() => startServer(), 5000);

    console.log('==== 处理完成 ====');
  } catch (error) {
    console.error('发生错误:', error);
    process.exit(1);
  }
};

// 运行主函数
main();