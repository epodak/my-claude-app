#!/usr/bin/env python
import os
import sys
import subprocess
import socket
import webbrowser
import time
import signal
import psutil
from pathlib import Path

def find_free_port(start_port=3000):
    """找到一个可用的端口"""
    port = start_port
    while port < 65535:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except socket.error:
            port += 1
    raise RuntimeError("No free ports available")

def kill_process_on_port(port):
    """终止指定端口上的进程"""
    for proc in psutil.process_iter(['pid', 'name', 'connections']):
        try:
            for conn in proc.connections():
                if conn.laddr.port == port:
                    os.kill(proc.pid, signal.SIGTERM)
                    time.sleep(1)  # 等待进程终止
                    return True
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return False

def main():
    # 项目路径
    project_path = r"D:\1\my-claude-app"
    script_path = os.path.join(project_path, "setup-claude.mjs")

    # 确保路径存在
    if not os.path.exists(project_path) or not os.path.exists(script_path):
        print(f"Error: Project or script not found at {project_path}")
        sys.exit(1)

    # 找到空闲端口
    port = find_free_port()

    # 如果端口被占用，尝试终止占用进程
    if kill_process_on_port(port):
        print(f"Killed existing process on port {port}")

    # 修改 package.json 中的端口号
    package_json_path = os.path.join(project_path, "package.json")
    try:
        import json
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)

        # 修改或添加 dev 脚本中的端口
        dev_script = package_data.get('scripts', {}).get('dev', '')
        if 'next dev' in dev_script:
            package_data['scripts']['dev'] = f'next dev -p {port}'

        with open(package_json_path, 'w', encoding='utf-8') as f:
            json.dump(package_data, f, indent=2)
    except Exception as e:
        print(f"Warning: Failed to update port in package.json: {e}")

    # 启动 Next.js 项目
    env = os.environ.copy()
    env["PORT"] = str(port)

    cmd = f'node "{script_path}"'

    try:
        # 使用 nohup 启动进程
        if os.name == 'nt':  # Windows
            # 使用 DETACHED_PROCESS 标志使进程独立运行
            process = subprocess.Popen(
                cmd,
                shell=True,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
                stdin=subprocess.DEVNULL
            )
        else:  # Unix-like
            process = subprocess.Popen(
                f'nohup {cmd} &',
                shell=True,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setpgrp
            )

        # 等待几秒确保服务器启动
        time.sleep(3)

        # 在现有Chrome窗口中打开新标签
        url = f"http://localhost:{port}"
        print(f"Opening {url} in new tab...")
        try:
            import webbrowser
            webbrowser.open_new_tab(url)  # 使用open_new_tab而不是open_new
        except Exception as e:
            print(f"Failed to open browser: {e}")
            print("Please manually open:", url)

        print("Server is running in background. You can close this window.")
        # 不再使用while循环，让进程在后台运行
        sys.exit(0)

    except KeyboardInterrupt:
        print("\nShutting down...")
        # 清理进程
        if os.name == 'nt':
            subprocess.run(['taskkill', '/F', '/T', '/PID', str(process.pid)], capture_output=True)
        else:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)

if __name__ == "__main__":
    main()