// src/lib/config.ts
export const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '3001'; // 使用不同于Next.js的端口
export const API_BASE_URL = `http://localhost:${API_PORT}`;