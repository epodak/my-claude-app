// src/types/folder.ts
export interface FolderStructure {
  path: string;
  folders: string[];
  children: Record<string, FolderStructure>;
}

export interface ProcessedFolderStructure {
  roots: string[];
  children: Map<string, string[]>;
  depth: Map<string, number>;
}

export interface FolderRelations {
  ancestors: string[];
  descendants: string[];
  siblings: string[];
}

export interface FolderViewerProps {
  initialPath?: string;
}