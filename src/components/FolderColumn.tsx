// src/components/FolderColumn.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';
// 类型定义
interface FolderStructure {
  path: string;
  folders: string[];
  children: Record<string, FolderStructure>;
}

interface ProcessedStructure {
  roots: string[];
  children: Map<string, string[]>;
  depth: Map<string, number>;
}

interface FolderRelations {
  ancestors: string[];
  descendants: string[];
  siblings: string[];
}

// API 类
class FolderAPI {
  private baseUrl: string;
  private port: number | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
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

// 工具函数
const isFolderNameValid = (name: string): boolean => {
  return /^[0-9]{3}_/.test(name);
};

const processFolderStructure = (data: FolderStructure): ProcessedStructure => {
  const structure: ProcessedStructure = {
    roots: [],
    children: new Map(),
    depth: new Map()
  };

  structure.roots = data.folders.filter(isFolderNameValid);
  structure.roots.forEach(folder => {
    structure.depth.set(folder, 1);
  });

  const processChildren = (folderData: FolderStructure, parentFolder: string, depth: number) => {
    if (folderData.children) {
      Object.entries(folderData.children).forEach(([folder, childData]) => {
        if (!isFolderNameValid(folder)) return;

        if (!structure.children.has(parentFolder)) {
          structure.children.set(parentFolder, []);
        }
        structure.children.get(parentFolder)?.push(folder);
        structure.depth.set(folder, depth);

        processChildren(childData, folder, depth + 1);
      });
    }
  };

  if (data.children) {
    Object.entries(data.children).forEach(([folder, childData]) => {
      if (isFolderNameValid(folder)) {
        processChildren(childData, folder, 2);
      }
    });
  }

  return structure;
};

const getFolderRelations = (folder: string, structure: ProcessedStructure): FolderRelations => {
  const relations: FolderRelations = {
    ancestors: [],
    descendants: [],
    siblings: []
  };

  let current = folder;
  for (const [parent, children] of structure.children.entries()) {
    if (children.includes(current)) {
      relations.ancestors.push(parent);
      current = parent;
    }
  }

  const getDescendants = (f: string) => {
    const children = structure.children.get(f) || [];
    children.forEach(child => {
      relations.descendants.push(child);
      getDescendants(child);
    });
  };
  getDescendants(folder);

  const parent = relations.ancestors[0];
  if (parent) {
    relations.siblings = (structure.children.get(parent) || []).filter(f => f !== folder);
  } else {
    relations.siblings = structure.roots.filter(f => f !== folder);
  }

  return relations;
};

const getFoldersByLevel = (level: number, structure: ProcessedStructure): string[] => {
  return Array.from(structure.depth.entries())
    .filter(([_, depth]) => depth === level)
    .map(([folder]) => folder);
};

// SVG 连接线组件
const FolderConnector: React.FC<{
  sourceElement: HTMLElement | null;
  targetElements: (HTMLElement | null)[];
}> = ({ sourceElement, targetElements }) => {
  return (
    <svg className="fixed inset-0 pointer-events-none z-10">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#2196f3" />
        </marker>
      </defs>
      {sourceElement && targetElements.map((target, index) => {
        if (!target) return null;

        const sourceBounds = sourceElement.getBoundingClientRect();
        const targetBounds = target.getBoundingClientRect();

        const startX = sourceBounds.right;
        const startY = sourceBounds.top + sourceBounds.height/2;
        const endX = targetBounds.left;
        const endY = targetBounds.top + targetBounds.height/2;

        const controlPoint1X = startX + (endX - startX) * 0.4;
        const controlPoint2X = startX + (endX - startX) * 0.6;

        return (
          <path
            key={index}
            d={`M ${startX},${startY} C ${controlPoint1X},${startY} ${controlPoint2X},${endY} ${endX},${endY}`}
            stroke="#2196f3"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
};

// 列组件
const Column: React.FC<{
  title: string;
  folders: string[];
  onFolderClick: (folder: string) => void;
  selectedFolder: string | null;
  relations: FolderRelations | null;
}> = ({ title, folders, onFolderClick, selectedFolder, relations }) => {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-500 text-white">
        <h2 className="font-semibold text-center">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {folders.map(folder => (
          <div
            key={folder}
            data-folder={folder}
            onClick={() => onFolderClick(folder)}
            className={`p-3 my-1 rounded-md cursor-pointer transition-all
              ${selectedFolder === folder ? 'bg-blue-500 text-white' : 'bg-gray-50 hover:bg-gray-100'}
              ${relations?.ancestors?.includes(folder) ? 'bg-green-500 text-white' : ''}
              ${relations?.descendants?.includes(folder) ? 'bg-orange-500 text-white' : ''}
              ${relations?.siblings?.includes(folder) ? 'bg-purple-500 text-white' : ''}
            `}
          >
            {folder}
          </div>
        ))}
      </div>
    </div>
  );
};

// 更新主组件，添加 path 属性
interface FolderColumnProps {
  path?: string;
}
// 主要组件
export default function FolderColumn({ path }: FolderColumnProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [structure, setStructure] = useState<ProcessedStructure>({
    roots: [],
    children: new Map(),
    depth: new Map()
  });
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [relations, setRelations] = useState<FolderRelations | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        const api = new FolderAPI();
        const data = await api.getFolders(path);
        const processedStructure = processFolderStructure(data);
        setStructure(processedStructure);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load folders'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [path]); // 添加 path 作为依赖

  // 处理文件夹选择
  const handleFolderSelect = useCallback((folder: string) => {
    setSelectedFolder(folder);
    setRelations(getFolderRelations(folder, structure));
  }, [structure]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error.message}</span>
        </div>
      </div>
    );
  }

  const filteredFolders = (level: number): string[] => {
    const folders = getFoldersByLevel(level, structure);
    if (!searchTerm) return folders;
    return folders.filter(folder =>
      folder.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 pl-10 rounded-lg border focus:outline-none focus:border-blue-500"
              placeholder="Search folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(level => (
          <Column
            key={level}
            title={`Level ${level} Folders`}
            folders={filteredFolders(level)}
            onFolderClick={handleFolderSelect}
            selectedFolder={selectedFolder}
            relations={relations}
          />
        ))}
      </div>

      {/* Connector Lines */}
      <FolderConnector
        sourceElement={selectedFolder ? document.querySelector(`[data-folder="${selectedFolder}"]`) : null}
        targetElements={relations ? [
          ...relations.ancestors.map(f => document.querySelector(`[data-folder="${f}"]`)),
          ...relations.descendants.map(f => document.querySelector(`[data-folder="${f}"]`))
        ] : []}
      />
    </div>
  );
}