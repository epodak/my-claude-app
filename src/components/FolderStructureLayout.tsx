// src/components/FolderStructureLayout.tsx
import React, { useState } from 'react';
import { Folder, Grid2X2, Grid3X3, Settings } from 'lucide-react';

const FolderStructureLayout: React.FC = () => {
  const [isThreeColumns, setIsThreeColumns] = useState(false);

  const folders = [
    { id: '10_A', name: '数据结构', count: 12 },
    { id: '20_B', name: '算法设计', count: 8 },
    { id: '30_C', name: '计算机网络', count: 15 },
    { id: '40_D', name: '操作系统', count: 10 },
    { id: '50_E', name: '编译原理', count: 6 },
    { id: '60_F', name: '数据库', count: 9 },
  ];

  const FolderCard = ({ folder }: { folder: { id: string; name: string; count: number } }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <Folder className="w-8 h-8 text-blue-500" />
        <div>
          <h3 className="font-medium text-gray-800">{folder.name}</h3>
          <p className="text-sm text-gray-500">{folder.count} 个知识点</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      {/* 核心视觉区域 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">知识体系</h1>
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div className="text-blue-100">
            <p className="text-sm">共计 60 个知识点</p>
            <div className="mt-2 flex items-center space-x-4">
              <button
                className={`p-2 rounded ${!isThreeColumns ? 'bg-white bg-opacity-20' : ''}`}
                onClick={() => setIsThreeColumns(false)}
              >
                <Grid2X2 className="w-5 h-5 text-white" />
              </button>
              <button
                className={`p-2 rounded ${isThreeColumns ? 'bg-white bg-opacity-20' : ''}`}
                onClick={() => setIsThreeColumns(true)}
              >
                <Grid3X3 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="p-4">
        <div className={`grid ${isThreeColumns ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      </div>

      {/* 互动区域 */}
      <div className="bg-white p-6 border-t">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-800">学习进度</h2>
              <p className="text-sm text-gray-500 mt-1">已完成 24/60 知识点</p>
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            继续学习
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderStructureLayout;