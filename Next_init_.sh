#!/bin/bash
# 2024-11-18新建的版本,处理了tailwind的问题

# 当脚本出现错误时立即退出
set -e

# 定义输出颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 创建 Next.js 项目
create_next_app() {
    print_info "正在创建新的 Next.js 项目..."
    npx create-next-app@14 my-claude-app \
        --typescript \
        --tailwind \
        --eslint \
        --src-dir \
        --app \
        --import-alias "@/*" \
        --no-turbo

    cd my-claude-app
    print_success "Next.js 项目创建成功！"
}

# 配置 Tailwind CSS
setup_tailwind_css() {
    print_info "正在配置 Tailwind CSS..."
    npm install tailwindcss postcss autoprefixer --save-dev
    npx tailwindcss init -p

    # 配置 tailwind.config.js
    cat > tailwind.config.js <<'EOL'
/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
EOL

    # 配置 globals.css
    mkdir -p src/app
    cat > src/app/globals.css <<'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

    print_success "Tailwind CSS 配置完成！"
}

# 安装 shadcn 和 lucide-react
install_shadcn_and_lucide() {
    print_info "正在安装 shadcn 和 lucide-react..."

    # 安装 shadcn
    npx shadcn@latest init --defaults --yes
    npx shadcn@latest add --all --yes

    # 安装 lucide-react
    npm install lucide-react

    print_success "shadcn 和 lucide-react 安装完成！"
}

# 配置页面和布局
setup_pages_and_layout() {
    print_info "正在创建页面和布局..."

# 创建 layout.tsx
cat > src/app/layout.tsx <<'EOL'
import "@/app/globals.css";

export const metadata = {
  title: "Sidebar Navigation App",
  description: "A simple Next.js app with sidebar navigation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
EOL

# 创建 page.tsx
cat > src/app/page.tsx <<'EOL'
"use client";

import { useState } from "react";
import { Home, Info, Phone } from "lucide-react";

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${
        isHovered ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ul className="p-4 space-y-4">
        <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
          <Home className="w-6 h-6" />
          {isHovered && <span>Home</span>}
        </li>
        <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
          <Info className="w-6 h-6" />
          {isHovered && <span>About</span>}
        </li>
        <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
          <Phone className="w-6 h-6" />
          {isHovered && <span>Contact</span>}
        </li>
      </ul>
    </div>
  );
};

export default function Page() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-16 p-4 transition-all duration-300">
        <h1 className="text-3xl font-bold">Welcome to Sidebar Navigation</h1>
        <p className="mt-4">Hover over the sidebar to see it expand.</p>
      </main>
    </div>
  );
}
EOL

    print_success "页面和布局创建完成！"
}

# 安装 Linaria 所需依赖 尝试解决首次加载速度慢的问题,配置完全失败,抛弃
setup_linaria() {
    print_info "正在安装 Linaria 和配置 Webpack..."

    # 安装 Linaria 及其相关依赖
    npm install --save linaria @linaria/core @linaria/react babel-plugin-transform-react-remove-prop-types \
        @babel/plugin-syntax-jsx @babel/preset-env @babel/preset-react

    # 配置 Babel
    cat > .babelrc <<'EOL'
{
  "presets": ["next/babel", "@babel/preset-react"],
  "plugins": [
    "babel-plugin-transform-react-remove-prop-types",
    ["@linaria", {
      "babelOptions": {
        "presets": ["@babel/preset-env", "@babel/preset-react"]
      }
    }]
  ]
}
EOL

    # 更新 Next.js 的配置以支持 Linaria
    cat > next.config.js <<'EOL'
const withLinaria = require('next-linaria');

module.exports = withLinaria({
  reactStrictMode: true,
});
EOL

    print_success "Linaria 安装和配置完成！"
}


# 主脚本逻辑
main() {
    print_info "开始配置完整环境..."

    create_next_app
    setup_tailwind_css
    install_shadcn_and_lucide
    setup_pages_and_layout

    print_success "环境配置完成！"
    echo ""
    echo "运行以下命令启动开发服务器："
    echo "cd my-claude-app && npm run dev"
}

main
