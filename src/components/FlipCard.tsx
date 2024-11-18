import React, { useState } from 'react';
import { Star, ArrowRight } from 'lucide-react';

const FlipCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 内联样式对象，确保3D效果正常工作
  const styles = {
    cardContainer: {
      perspective: '1000px',
      transformStyle: 'preserve-3d',
    },
    cardInner: {
      position: 'relative',
      width: '100%',
      height: '100%',
      transformStyle: 'preserve-3d',
      transition: 'transform 0.6s',
      transform: isFlipped ? 'rotateY(180deg)' : '',
    },
    cardFace: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden', // Safari 支持
    },
    cardBack: {
      transform: 'rotateY(180deg)',
    }
  };

  return (
    <div className="p-8 flex flex-wrap justify-center gap-6">
      {/* Card 1 */}
      <div 
        className="w-80 h-52 cursor-pointer"
        style={styles.cardContainer}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div style={styles.cardInner}>
          {/* Front Side */}
          <div style={styles.cardFace} className="flex">
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl shadow-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">炫酷卡片</h2>
                  <p className="text-purple-100">hover我试试看✨</p>
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
          <div style={{...styles.cardFace, ...styles.cardBack}} className="flex">
            <div className="w-full h-full bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl shadow-xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">背面内容</h2>
                <p className="text-pink-100">
                  这是一个3D翻转卡片
                  <br/>
                  使用了新的样式结构
                </p>
              </div>
              <div className="text-white text-sm">
                继续hover保持翻转状态
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div 
        className="w-80 h-52 cursor-pointer"
        style={styles.cardContainer}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div style={styles.cardInner}>
          {/* Front Side */}
          <div style={styles.cardFace} className="flex">
            <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">第二张卡片</h2>
                  <p className="text-green-100">不同的配色方案</p>
                </div>
                <Star className="text-yellow-300" size={24} />
              </div>
              <div className="flex items-center text-white">
                <span>hover查看背面</span>
                <ArrowRight className="ml-2" size={20} />
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div style={{...styles.cardFace, ...styles.cardBack}} className="flex">
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">更多信息</h2>
                <p className="text-teal-100">
                  可以放置更多内容
                  <br/>
                  比如产品描述等
                </p>
              </div>
              <div className="text-white text-sm">
                优雅的渐变效果
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;