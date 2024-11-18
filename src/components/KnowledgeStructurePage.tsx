import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Search, Share2, BookOpen, Save } from 'lucide-react';

const KnowledgeStructurePage = () => {
  const [expandedFolders, setExpandedFolders] = useState({
    '10_A': true,
    '10_aa': false
  });

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const FolderItem = ({ id, name, level, hasChildren = false, children }) => {
    const isExpanded = expandedFolders[id];
    const paddingLeft = `${level * 16}px`;

    return (
      <div>
        <div 
          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded-md"
          style={{ paddingLeft }}
          onClick={() => hasChildren && toggleFolder(id)}
        >
          {hasChildren && (
            <div className="mr-1">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </div>
          )}
          <Folder className="w-4 h-4 mr-2 text-blue-500" />
          <span className="text-sm text-gray-700">{name}</span>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4">{children}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 核心视觉区 (20-30%) */}
      <div className="bg-white shadow-sm p-4 flex-none" style={{ height: '25vh' }}>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">知识体系结构</h1>
          <p className="text-gray-500 mb-4">探索完整的知识架构图</p>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索知识点..."
              className="w-full p-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* 主要内容区 (40-50%) */}
      <div className="flex-1 overflow-auto" style={{ height: '50vh' }}>
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-1">
            <FolderItem id="10_A" name="10_A" level={0} hasChildren={true}>
              <FolderItem id="10_aa" name="10_aa" level={1} hasChildren={true}>
                <FolderItem id="10_aaa" name="10_aaa" level={2} />
                <FolderItem id="20_aab" name="20_aab" level={2} />
                <FolderItem id="30_aac" name="30_aac" level={2} />
              </FolderItem>
              <FolderItem id="20_ab" name="20_ab" level={1} hasChildren={true}>
                <FolderItem id="10_aba" name="10_aba" level={2} />
                <FolderItem id="20_abb" name="20_abb" level={2} />
              </FolderItem>
            </FolderItem>
          </div>
        </div>
      </div>

      {/* 互动区域 (20-30%) */}
      <div className="bg-white shadow-sm flex-none" style={{ height: '25vh' }}>
        <div className="max-w-md mx-auto p-4">
          <div className="grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
              <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-sm text-gray-600">学习模式</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
              <Share2 className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-sm text-gray-600">分享</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
              <Save className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-sm text-gray-600">保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeStructurePage;