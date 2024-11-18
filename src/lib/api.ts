// src/lib/api.ts
import { FolderStructure } from '@/types/folder';

class FolderAPI {
  private baseUrl: string;
  private port: number | null = null;

  constructor() {
    this.baseUrl = '';
  }

  async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/port');
      if (!response.ok) throw new Error('Failed to get port');
      const data = await response.json();
      this.port = data.port;
      this.baseUrl = `http://localhost:${this.port}`;
    } catch (error) {
      console.error('Failed to initialize API:', error);
      throw error;
    }
  }

  async getFolders(path?: string): Promise<FolderStructure> {
    try {
      const url = new URL(`${this.baseUrl}/api/folders`);
      if (path) url.searchParams.set('path', path);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch folders');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }
}

export const folderApi = new FolderAPI();