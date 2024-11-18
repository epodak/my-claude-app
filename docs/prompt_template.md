# AI提示词模板

## 基础提示模板

```markdown
我正在使用Next.js + React开发一个组件库项目。请你帮我创建一个[组件名称]组件，需要满足以下要求：

1. 使用 TypeScript + Tailwind CSS
2. 必须包含 "export default" 语句
3. 不使用外部样式文件，所有样式使用Tailwind或内联style
4. 如果需要3D效果，请使用内联style确保transform-style: preserve-3d生效
5. 只使用基础的Tailwind类，不要使用自定义值(如h-[500px])
6. 组件必须是独立的，不依赖外部状态管理
7. 所有动画效果使用CSS transition或transform实现
8. 任何图标请使用lucide-react库
9. 如果需要图表，请使用recharts
10. 代码结构清晰，便于维护

技术要求：
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- lucide-react用于图标
- recharts用于图表(如需要)

请生成完整的组件代码，确保代码可以直接复制使用。
```

## 示例：请求3D翻转卡片组件

```markdown
使用上述模板，我需要一个3D翻转卡片组件，具体要求：

1. 鼠标悬停时实现平滑的3D翻转效果
2. 正面显示标题和简介
3. 背面显示详细信息
4. 使用渐变背景
5. 添加适当的图标装饰
6. 响应式设计适配不同屏幕

请生成符合要求的完整组件代码。
```

## 组件代码规范检查清单

生成的代码应该检查以下几点：

✅ 导出语句检查：
- 是否包含正确的export default语句
- 是否使用了正确的组件命名

✅ TypeScript类型检查：
- 是否定义了必要的类型接口
- 是否正确使用了React.FC或function组件声明

✅ 样式规范检查：
- 是否只使用了Tailwind基础类
- 是否避免使用自定义值
- 3D效果是否使用了正确的内联样式

✅ 依赖检查：
- 是否只使用了允许的外部依赖
- 是否正确导入了所需的组件和图标

✅ 响应式设计：
- 是否考虑了不同屏幕尺寸
- 是否使用了Tailwind的响应式类

## 组织结构建议

生成的组件应遵循以下结构：

```typescript
import { useState } from 'react';
import { 需要的图标 } from 'lucide-react';

// 类型定义
interface ComponentProps {
  // props类型
}

// 组件实现
const ComponentName: React.FC<ComponentProps> = ({ props }) => {
  // 状态声明

  // 事件处理函数

  // 渲染逻辑
  return (
    // JSX结构
  );
};

export default ComponentName;
```

## 测试和验证

每个生成的组件都应该：

1. 可以独立运行，不依赖外部状态
2. 样式正确，动画流畅
3. 响应式布局正常
4. 没有控制台错误
5. TypeScript类型完整

## 常见问题解决方案

1. 3D效果不生效：
   ```javascript
   const styles = {
     cardContainer: {
       perspective: '1000px',
       transformStyle: 'preserve-3d'
     }
   };
   ```

2. 动画卡顿：
   ```javascript
   // 使用transform而不是position
   transition: 'transform 0.6s',
   transform: isFlipped ? 'rotateY(180deg)' : ''
   ```

3. 响应式问题：
   ```jsx
   <div className="w-full md:w-96 lg:w-120">
   ```

---

*请根据此模板生成组件，确保代码质量和可维护性。*