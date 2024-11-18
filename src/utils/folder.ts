// src/utils/folder.ts
import { FolderStructure, ProcessedFolderStructure, FolderRelations } from '@/types/folder';

// 文件夹命名规则校验
export const isFolderNameValid = (name: string): boolean => {
  return /^[0-9]{3}_/.test(name);
};

// 处理后端返回的文件夹结构
export const processFolderStructure = (data: FolderStructure): ProcessedFolderStructure => {
  const structure: ProcessedFolderStructure = {
    roots: [],
    children: new Map(),
    depth: new Map()
  };

  // 过滤并设置根文件夹
  structure.roots = data.folders.filter(isFolderNameValid);
  structure.roots.forEach(folder => {
    structure.depth.set(folder, 1);
  });

  // 递归处理子文件夹
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

  // 处理所有子文件夹
  if (data.children) {
    Object.entries(data.children).forEach(([folder, childData]) => {
      if (isFolderNameValid(folder)) {
        processChildren(childData, folder, 2);
      }
    });
  }

  return structure;
};

// 计算文件夹关系
export const getFolderRelations = (
  folder: string,
  structure: ProcessedFolderStructure
): FolderRelations => {
  const relations: FolderRelations = {
    ancestors: [],
    descendants: [],
    siblings: []
  };

  // 获取祖先
  let current = folder;
  for (const [parent, children] of structure.children.entries()) {
    if (children.includes(current)) {
      relations.ancestors.push(parent);
      current = parent;
    }
  }

  // 获取后代
  const getDescendants = (f: string) => {
    const children = structure.children.get(f) || [];
    children.forEach(child => {
      relations.descendants.push(child);
      getDescendants(child);
    });
  };
  getDescendants(folder);

  // 获取兄弟节点
  const parent = relations.ancestors[0];
  if (parent) {
    relations.siblings = (structure.children.get(parent) || [])
      .filter(f => f !== folder);
  } else {
    relations.siblings = structure.roots.filter(f => f !== folder);
  }

  return relations;
};

// 按深度获取文件夹
export const getFoldersByLevel = (
  level: number,
  structure: ProcessedFolderStructure
): string[] => {
  return Array.from(structure.depth.entries())
    .filter(([_, depth]) => depth === level)
    .map(([folder]) => folder);
};

// 搜索文件夹
export const searchFolders = (
  keyword: string,
  structure: ProcessedFolderStructure
): string[] => {
  if (!keyword) return [];
  
  const lowerKeyword = keyword.toLowerCase();
  return Array.from(structure.depth.keys())
    .filter(name => name.toLowerCase().includes(lowerKeyword));
};