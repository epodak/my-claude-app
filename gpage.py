#!/usr/bin/env python
import os
import sys
import subprocess
import socket
import webbrowser
import time
import psutil
import shutil

def kill_process_on_port(port):
    """终止指定端口上的进程"""
    for proc in psutil.process_iter(['pid', 'name', 'connections']):
        try:
            for conn in proc.connections():
                if conn.laddr.port == port:
                    if os.name == 'nt':
                        subprocess.run(['taskkill', '/F', '/T', '/PID', str(proc.pid)],
                            capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
                    else:
                        proc.terminate()
                    time.sleep(1)
                    return True
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.Error):
            continue
    return False

def kill_node_processes():
    """终止所有 node.exe 进程"""
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if proc.name().lower() == 'node.exe':
                if os.name == 'nt':
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(proc.pid)],
                        capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
                else:
                    proc.terminate()
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.Error):
            continue

def update_env_file(project_path, scan_path):
    """更新环境变量文件"""
    env_file = os.path.join(project_path, '.env')
    env_content = f"""SCAN_PATH={scan_path.replace(os.sep, '/')}"""

    try:
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print(f"Updated .env file with SCAN_PATH: {scan_path}")
    except Exception as e:
        print(f"Warning: Failed to update .env file: {e}")

def start_backend_server(project_path):
    """启动后端服务器"""
    server_path = os.path.join(project_path, 'src', 'backend', 'server.js')
    print(f"Starting backend server: {server_path}")

    if not os.path.exists(server_path):
        print(f"Error: Server file not found at {server_path}")
        return None

    try:
        if os.name == 'nt':
            flags = subprocess.CREATE_NO_WINDOW
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            process = subprocess.Popen(['node', server_path],
                cwd=project_path,
                creationflags=flags,
                startupinfo=startupinfo,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE)
        else:
            process = subprocess.Popen(['node', server_path],
                cwd=project_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE)

        time.sleep(2)
        if process.poll() is not None:  # 检查进程是否已经退出
            stderr = process.stderr.read().decode('utf-8')
            print(f"Backend server failed to start: {stderr}")
            return None

        return process
    except Exception as e:
        print(f"Error starting backend server: {e}")
        return None

def read_process_output(process, timeout=1):
    """非阻塞地读取进程输出"""
    try:
        stdout = process.stdout.read1().decode('utf-8')
        stderr = process.stderr.read1().decode('utf-8')
        if stdout:
            print("Output:", stdout)
        if stderr:
            print("Error:", stderr)
        return stdout, stderr
    except Exception:
        return "", ""

def get_npm_command():
    """获取正确的 npm 命令路径"""
    if os.name == 'nt':
        # Windows 下尝试多个可能的路径
        possible_paths = [
            "npm.cmd",  # 标准 PATH 中的 npm
            r"C:\Program Files\nodejs\npm.cmd",
            r"C:\Program Files (x86)\nodejs\npm.cmd",
            os.path.expanduser("~\\AppData\\Roaming\\npm\\npm.cmd")
        ]
        for path in possible_paths:
            if os.path.exists(path) or shutil.which(path):
                return path
        return "npm.cmd"  # 如果都找不到，返回默认值
    return "npm"  # 非 Windows 系统

def check_npm_installed(project_path):
    """检查 npm 是否正确安装"""
    npm_cmd = get_npm_command()
    try:
        result = subprocess.run([npm_cmd, '-v'],
            cwd=project_path,
            capture_output=True,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        if result.returncode == 0:
            print(f"Found npm version: {result.stdout.strip()}")
            return True
    except Exception as e:
        print(f"Error checking npm: {e}")
    return False

def start_frontend(project_path):
    """启动前端服务器"""
    script_path = os.path.join(project_path, "setup-claude.mjs")
    if not os.path.exists(script_path):
        print(f"Error: setup script not found at {script_path}")
        return None

    print(f"Starting frontend using {script_path}")
    try:
        if os.name == 'nt':
            flags = subprocess.CREATE_NO_WINDOW
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            process = subprocess.Popen(['node', script_path],
                cwd=project_path,
                creationflags=flags,
                startupinfo=startupinfo,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=os.environ.copy())
        else:
            process = subprocess.Popen(['node', script_path],
                cwd=project_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE)

        # 等待并检查启动状态
        start_time = time.time()
        while time.time() - start_time < 30:  # 30秒超时
            if process.poll() is not None:
                stdout = process.stdout.read().decode('utf-8', errors='ignore')
                stderr = process.stderr.read().decode('utf-8', errors='ignore')
                print(f"Frontend startup failed with output:\n{stdout}\n{stderr}")
                return None

            # 检查端口是否已经可用
            if check_port_status(3000, retries=1, delay=0.1):
                print("Frontend server started successfully")
                return process

            time.sleep(1)

        print("Frontend server startup timed out")
        return None

    except Exception as e:
        print(f"Error starting frontend: {e}")
        return None

def close_all(processes=None):
    """关闭所有Node相关进程"""
    closed = []

    # 关闭特定进程
    if processes:
        for process in processes:
            if process and process.poll() is None:
                process.terminate()
                time.sleep(1)
                if process.poll() is None:
                    process.kill()

    # 关闭端口上的进程
    if kill_process_on_port(3000):
        closed.append("Frontend (port 3000)")
    if kill_process_on_port(3001):
        closed.append("Backend (port 3001)")

    # 清理所有node进程
    node_count = len([p for p in psutil.process_iter(['name']) if p.info['name'] == 'node.exe'])
    kill_node_processes()

    print("Closed processes:")
    for proc in closed:
        print(f"- {proc}")
    print(f"- {node_count} Node processes")
    sys.exit(0)

def check_port_status(port, retries=30, delay=1):
    """检查端口是否可访问"""
    for _ in range(retries):
        try:
            with socket.create_connection(('localhost', port), timeout=1):
                return True
        except (socket.error, socket.timeout):
            time.sleep(delay)
    return False

def start_servers(project_path, scan_path):
    """启动所有服务器并检查状态"""
    # 启动后端
    backend_process = start_backend_server(project_path)
    if not check_port_status(3001):
        print("Error: Backend server failed to start")
        close_all()
        sys.exit(1)
    print("Backend server started successfully")

    # 启动前端
    frontend_process = start_frontend(project_path)
    if not check_port_status(3000):
        print("Error: Frontend server failed to start")
        close_all()
        sys.exit(1)
    print("Frontend server started successfully")

    return backend_process, frontend_process

def check_existing_server(scan_path):
    """检查是否有相同路径的服务器正在运行"""
    try:
        # 检查两个端口是否都在运行
        if not (check_port_status(3000, retries=1, delay=0.1) and
                check_port_status(3001, retries=1, delay=0.1)):
            return False

        # 检查后端服务器的扫描路径
        response = requests.get('http://localhost:3001/api/health', timeout=1)
        if response.ok:
            existing_path = response.json().get('scanPath')
            if existing_path == scan_path:
                print(f"Server already running for path: {scan_path}")
                return True
            else:
                print(f"Server running with different path: {existing_path}")
                print("Will restart with new path...")
                return False
    except Exception as e:
        return False
    return False

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Manage Claude app server')
    parser.add_argument('-c', '--close', action='store_true', help='Close all Node processes')
    args = parser.parse_args()

    if args.close:
        close_all()
        return

    project_path = r"D:\1\my-claude-app"
    scan_path = os.getcwd()
    print(f"Setting scan path to: {scan_path}")

    if not os.path.exists(project_path):
        print(f"Error: Project not found at {project_path}")
        sys.exit(1)

    # 检查是否可以复用现有服务器
    if check_existing_server(scan_path):
        print("Using existing server instance")
        webbrowser.open_new_tab("http://localhost:3000")
        sys.exit(0)

    # 否则，执行完整的启动流程
    kill_process_on_port(3000)
    kill_process_on_port(3001)
    kill_node_processes()
    update_env_file(project_path, scan_path)
    backend_process, frontend_process = start_servers(project_path, scan_path)

    # 打开浏览器
    url = "http://localhost:3000"
    print(f"Opening frontend at {url}")
    try:
        webbrowser.open_new_tab(url)
    except Exception as e:
        print(f"Failed to open browser: {e}")
        print("Please manually open:", url)

    print(f"Server is running in background.")
    print(f"Scanning directory: {scan_path}")
    print("You can close this window.")
    sys.exit(0)

if __name__ == "__main__":
    main()