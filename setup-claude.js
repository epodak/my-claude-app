// setup-claude.js

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// 项目根目录
const projectRoot = path.resolve('./my-claude-app');
const componentsDir = path.join(projectRoot, 'src', 'components');
const pagePath = path.join(projectRoot, 'src', 'app', 'page.tsx');

// 创建组件文件并保存代码
const saveClipboardCode = (code) => {
  // 提取文件名（默认第一个 `export default` 后的名称）
  const fileNameMatch = code.match(/export default function (\w+)/);
  if (!fileNameMatch) {
    console.error('无法提取文件名，请确保代码中包含 `export default function`。');
    process.exit(1);
  }
  const fileName = fileNameMatch[1];
  const filePath = path.join(componentsDir, `${fileName}.tsx`);

  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  fs.writeFileSync(filePath, code, 'utf-8');
  console.log(`组件代码已保存到：${filePath}`);
  return fileName;
};

// 提取 import 依赖并安装
const installDependencies = (code) => {
  const importRegex = /import .* from ['"](.*)['"]/g;
  const dependencies = new Set();
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    if (!match[1].startsWith('.')) {
      dependencies.add(match[1]);
    }
  }

  if (dependencies.size > 0) {
    console.log('检测到以下依赖需要安装：', [...dependencies].join(', '));
    exec(`npm install ${[...dependencies].join(' ')}`, { cwd: projectRoot }, (err, stdout, stderr) => {
      if (err) {
        console.error('依赖安装失败：', stderr);
      } else {
        console.log('依赖安装成功：', stdout);
      }
    });
  }
};

// 更新 page.tsx，添加组件到主内容和侧边栏
const updatePage = (fileName) => {
  let pageContent = fs.readFileSync(pagePath, 'utf-8');
  const importStatement = `import ${fileName} from '../components/${fileName}';`;

  if (!pageContent.includes(importStatement)) {
    // 添加 import 语句
    pageContent = `${importStatement}\n${pageContent}`;
  }

  // 添加到侧边栏
  const newSidebarEntry = `
        <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
          <${fileName} className="w-6 h-6" />
          {isHovered && <span>${fileName}</span>}
        </li>`;
  if (!pageContent.includes(newSidebarEntry)) {
    pageContent = pageContent.replace(
      /<\/ul>/,
      `${newSidebarEntry}\n      </ul>`
    );
  }

  // 添加组件到主内容
  const newComponentRender = `<${fileName} />`;
  if (!pageContent.includes(newComponentRender)) {
    pageContent = pageContent.replace(
      /<\/main>/,
      `  ${newComponentRender}\n      </main>`
    );
  }

  fs.writeFileSync(pagePath, pageContent, 'utf-8');
  console.log('page.tsx 已更新。');
};

// 启动开发服务器
const startServer = () => {
  console.log('启动开发服务器...');
  exec('npm run dev', { cwd: projectRoot }, (err, stdout, stderr) => {
    if (err) {
      console.error('开发服务器启动失败：', stderr);
    } else {
      console.log(stdout);
    }
  });
};

// 主流程
const main = () => {
  const clipboardCode = `// 将你的剪贴板代码粘贴到这里`;

  const fileName = saveClipboardCode(clipboardCode);
  installDependencies(clipboardCode);
  updatePage(fileName);
  setTimeout(startServer, 5000); // 等待依赖安装完成后启动服务器
};

main();
