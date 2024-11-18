import { NextResponse } from 'next/server';
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
    await execAsync(`node ${scriptPath} uninstall ${componentName}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('卸载失败:', error);
    return NextResponse.json({ success: false, error: 'Uninstall failed' }, { status: 500 });
  }
}
