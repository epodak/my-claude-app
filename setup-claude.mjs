// setup-claude.mjs

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
const archiveDir = path.join(componentsDir, 'Archive');
const pagePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
const apiRouteDir = path.join(projectRoot, 'src', 'app', 'api', 'uninstall');
const apiRoutePath = path.join(apiRouteDir, 'route.ts');

// 获取命令行参数
const args = process.argv.slice(2);
const action = args[0]; // 'install' or 'uninstall'
let componentName = args[1]; // 组件名称（卸载时需要）

// 检查项目结构并创建必要的文件
const checkProjectStructure = () => {
  console.log('==== 检查项目结构 ====');
  console.log(`项目根目录: ${projectRoot}`);
  console.log(`组件目录: ${componentsDir}`);
  console.log(`页面文件: ${pagePath}`);
  console.log(`API 路由文件: ${apiRoutePath}`);

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
    createBasicPage();
  }

  if (!fs.existsSync(apiRoutePath)) {
    console.log('API 路由文件不存在，将创建...');
    createApiRoute();
  }
};

const scanComponentsDirectory = () => {
  console.log('==== 扫描组件目录 ====');
  const components = [];

  // 读取 components 目录下的所有 .tsx 文件
  const files = fs.readdirSync(componentsDir);
  for (const file of files) {
    const fullPath = path.join(componentsDir, file);
    // 排除 Archive 目录和其他目录
    if (file.endsWith('.tsx') &&
        !fs.lstatSync(fullPath).isDirectory() &&
        !fullPath.includes('Archive')) {
      const componentName = file.replace('.tsx', '');
      components.push(componentName);
      console.log(`找到组件: ${componentName}`);
    }
  }

  return components;
};


// 创建基础的 page.tsx 模板
const createBasicPage = (components = []) => {
  const importStatements = components.map(name =>
    `import ${name} from "../components/${name}";`
  ).join('\n');

  const basicPageContent = `"use client";
import { useState } from "react";
import { Home, Info, Phone, Folder, Trash2 } from "lucide-react";
${importStatements}

const Sidebar = ({ currentComponent, setCurrentComponent }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleUninstall = async (componentName, e) => {
    e.stopPropagation();
    if (confirm(\`确定要卸载组件 \${componentName} 吗？\`)) {
      try {
        const response = await fetch('/api/uninstall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentName })
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('卸载失败:', error);
      }
    }
  };

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
        ${components.map(name => `
        <li
          className={\`flex items-center justify-between hover:bg-gray-700 p-2 rounded \${
            currentComponent === "${name}" ? "bg-gray-700" : ""
          }\`}
          onClick={() => setCurrentComponent("${name}")}
        >
          <div className="flex items-center space-x-2">
            <Folder className="w-6 h-6" />
            {isHovered && <span>${name}</span>}
          </div>
          {isHovered && (
            <button
              onClick={(e) => handleUninstall("${name}", e)}
              className="p-1 rounded-full hover:bg-red-500 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </li>`).join('\n')}
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
      ${components.map(name => `
      case "${name}":
        return (
          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <${name} />
          </div>
        );`).join('\n')}
      default:
        return <div className="p-4 text-lg">未知组件</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        currentComponent={currentComponent}
        setCurrentComponent={setCurrentComponent}
      />
      <main className="ml-16 p-8">
        {renderComponent()}
      </main>
    </div>
  );
}
`;

  fs.writeFileSync(pagePath, basicPageContent, 'utf-8');
  console.log('已创建基础版的 page.tsx');
};

// 创建 API 路由文件
const createApiRoute = () => {
  // 确保目录存在
  fs.mkdirSync(apiRouteDir, { recursive: true });

  const apiRouteContent = `import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// 定义允许的组件名称正则表达式，防止命令注入
const allowedComponentNameRegex = /^[a-zA-Z0-9_-]+$/;

export async function POST(req: Request) {
  try {
    const { componentName } = await req.json();

    // 验证组件名称
    if (!allowedComponentNameRegex.test(componentName)) {
      return NextResponse.json({ success: false, error: '非法的组件名称' }, { status: 400 });
    }

    // 获取脚本的绝对路径，防止路径问题
    const scriptPath = path.join(process.cwd(), 'setup-claude.mjs');

    // 执行卸载命令，使用参数数组，避免命令注入
    await execAsync(\`node \${scriptPath} uninstall \${componentName}\`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('卸载失败:', error);
    return NextResponse.json({ success: false, error: 'Uninstall failed' }, { status: 500 });
  }
}
`;
  fs.writeFileSync(apiRoutePath, apiRouteContent, 'utf-8');
  console.log('已创建 API 路由文件: route.ts');
};

// 读取剪贴板代码
const readClipboardCode = async () => {
  console.log('==== 读取剪贴板 ====');
  try {
    const code = await clipboardy.read();
    if (!code.includes('export default')) {
      throw new Error('代码中没有找到 export default 语句');
    }
    return code;
  } catch (err) {
    console.error('剪贴板读取错误:', err);
    throw err;
  }
};

// 提取组件名
const extractComponentName = (code) => {
  console.log('==== 提取组件名 ====');
  const patterns = [
    /export default function (\w+)/,
    /const (\w+): React\.FC/,
    /const (\w+) = \((.*)\) =>/,
    /function (\w+)\(/,
    /export default (\w+);/,
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

  return fileName;
};

// 保存组件到文件
const saveComponentCode = (code, fileName) => {
  console.log('==== 保存组件文件 ====');
  const filePath = path.join(componentsDir, `${fileName}.tsx`);
  fs.writeFileSync(filePath, code, 'utf-8');
  console.log(`组件成功保存到: ${filePath}`);
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

  // 更新 dynamicComponents 初始状态
  if (!pageContent.includes(`components.add("${fileName}");`)) {
    pageContent = pageContent.replace(
      /const \[dynamicComponents, setDynamicComponents\] = useState\(\(\) => \{([\s\S]*?)\}\);/,
      (match, p1) => {
        const newInitialization = `${p1.trim()}\n  components.add("${fileName}");\n  return components;`;
        return `const [dynamicComponents, setDynamicComponents] = useState(() => {${newInitialization}\n});`;
      }
    );
  }

  fs.writeFileSync(pagePath, pageContent, 'utf-8');
  console.log('page.tsx 已增量更新完成');
};

// 卸载组件
const uninstallComponent = (componentName) => {
  console.log('==== 卸载组件 ====');
  console.log(`准备卸载组件: ${componentName}`);

  try {
    // 移动组件文件到 Archive 文件夹
    const componentFilePath = path.join(componentsDir, `${componentName}.tsx`);
    if (!fs.existsSync(componentFilePath)) {
      throw new Error(`组件文件不存在: ${componentFilePath}`);
    }

    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }
    const archiveFilePath = path.join(archiveDir, `${componentName}.tsx`);
    fs.renameSync(componentFilePath, archiveFilePath);
    console.log(`✅ 组件文件已移动到: ${archiveFilePath}`);

    // 重新扫描组件目录获取最新的组件列表
    const remainingComponents = scanComponentsDirectory();
    console.log('剩余组件:', remainingComponents);

    // 使用剩余组件重新生成 page.tsx
    createBasicPage(remainingComponents);
    console.log('✅ page.tsx 已更新，组件已完全移除');

    return true;
  } catch (error) {
    console.error('❌ 卸载组件失败:', error.message);
    return false;
  }
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

    if (action === 'uninstall') {
      if (!componentName) {
        console.error('请提供要卸载的组件名称');
        process.exit(1);
      }
      uninstallComponent(componentName);
    } else {
      // 扫描现有组件
      const existingComponents = scanComponentsDirectory();

      // 读取剪贴板中的新组件
      try {
        const clipboardCode = await readClipboardCode();
        const newComponentName = extractComponentName(clipboardCode);

        // 保存新组件
        saveComponentCode(clipboardCode, newComponentName);
        await installDependencies(clipboardCode);

        // 添加到组件列表
        if (!existingComponents.includes(newComponentName)) {
          existingComponents.push(newComponentName);
        }
      } catch (error) {
        console.log('剪贴板中没有新组件，继续处理现有组件');
      }

      // 重新生成 page.tsx
      createBasicPage(existingComponents);

      // 启动服务器
      startServer();
    }

    console.log('==== 处理完成 ====');
  } catch (error) {
    console.error('发生错误:', error);
    process.exit(1);
  }
};

// 运行主函数
main();
