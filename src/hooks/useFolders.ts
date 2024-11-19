// src/hooks/useFolders.ts
import { useState, useEffect, useCallback } from 'react';
import { ProcessedFolderStructure, FolderRelations } from '@/types/folder';
import { folderApi } from '@/lib/api';
import { processFolderStructure, getFolderRelations } from '@/utils/folder';

export const useFolders = (initialPath?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [structure, setStructure] = useState<ProcessedFolderStructure>({
    roots: [],
    children: new Map(),
    depth: new Map()
  });
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [relations, setRelations] = useState<FolderRelations | null>(null);

  // 初始化文件夹结构
  useEffect(() => {
    const initializeFolders = async () => {
      try {
        await folderApi.initialize();
        const data = await folderApi.getFolders(initialPath);
        const processedStructure = processFolderStructure(data);
        setStructure(processedStructure);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load folders'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeFolders();
  }, [initialPath]);

  // 处理文件夹选择
  const handleFolderSelect = useCallback((folder: string) => {
    setSelectedFolder(folder);
    setRelations(getFolderRelations(folder, structure));
  }, [structure]);

  // 清除选择
  const clearSelection = useCallback(() => {
    setSelectedFolder(null);
    setRelations(null);
  }, []);

  return {
    structure,
    selectedFolder,
    relations,
    isLoading,
    error,
    handleFolderSelect,
    clearSelection
  };
};