// ... (前面的代码保持不变，直到 updatePage 函数)

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

  // 自动安装依赖（改进版）
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

  // ... (后面的代码保持不变)