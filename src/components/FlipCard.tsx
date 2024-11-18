import React, { useState } from 'react';
import { Star, ArrowRight } from 'lucide-react';

const FlipCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-8">
      <div
        className="relative w-96 h-64 cursor-pointer"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {/* Card Container */}
        <div
          className={`relative w-full h-full transition-all duration-500 transform-gpu preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Side */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl shadow-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">前端卡片</h2>
                  <p className="text-purple-100">hover我试试看</p>
                </div>
                <Star className="text-yellow-300" size={24} />
              </div>
              <div className="flex items-center text-white">
                <span>翻转查看更多</span>
                <ArrowRight className="ml-2" size={20} />
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl shadow-xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">背面内容</h2>
                <p className="text-pink-100">
                  这是一个3D翻转卡片组件
                  使用了React和Tailwind CSS实现
                </p>
              </div>
              <div className="text-white text-sm">
                继续hover保持翻转状态
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default FlipCard;