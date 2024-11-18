# AI提示词模板

## 基础提示模板

```markdown
我正在使用Next.js + React开发一个组件库项目。请你帮我创建一个[组件名称]组件，需要满足以下要求：

基础要求：
1. 使用 TypeScript + Tailwind CSS
2. 必须包含 "export default" 语句
3. 代码结构清晰，便于维护
4. 组件必须是独立的，不依赖全局状态管理
5. 如果需要3D效果，请使用内联style确保transform-style: preserve-3d生效

可用技术栈：
- React 18 + Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui 组件库
- lucide-react 图标库
- recharts 图表库
- Zod 数据验证
- React Hook Form
- 其他常用npm包（会自动安装）

数据持久化：
- 需要持久化的数据使用localStorage存储
- 实现数据自动过期（默认7天）
- 包含数据版本控制
- 提供错误处理机制

样式指南：
1. 优先使用Tailwind CSS
2. 可以使用shadcn/ui组件进行快速构建
3. 可以添加自定义动画和过渡效果
4. 响应式设计支持移动端和桌面端

请生成完整的组件代码，确保代码可以直接复制使用，无需额外配置。
```

## 工具函数模板

### LocalStorage持久化Hook
```typescript
import { useState, useEffect } from 'react';
import { z } from 'zod'; // 可选的数据验证

interface StorageOptions {
  expiresIn?: number;
  version?: string;
}

const useLocalStorage = <T>(key: string, initialValue: T, options?: StorageOptions) => {
  // ...实现逻辑
};
```

### 表单处理（使用React Hook Form）
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 表单schema示例
const formSchema = z.object({
  // ...字段定义
});
```

## 示例：请求卡片组件

```markdown
使用上述模板，我需要一个交互式卡片组件，具体要求：

1. 使用shadcn/ui的Card组件作为基础
2. 包含标题、描述和操作按钮
3. 添加过渡动画效果
4. 支持响应式布局
5. 记住用户的操作状态（7天有效）
6. 支持暗色主题

可以使用的其他依赖：
- @/components/ui/card
- @/components/ui/button
- 其他shadcn组件
```

## 组件代码规范检查清单

✅ 基础检查：
- 是否包含正确的export default语句
- TypeScript类型定义是否完整
- 组件命名是否规范

✅ 依赖使用：
- shadcn/ui组件使用是否恰当
- 外部依赖导入是否正确
- 是否使用了推荐的工具库

✅ 数据处理：
- localStorage使用是否规范
- 是否实现了数据过期机制
- 是否有适当的错误处理

✅ 样式规范：
- Tailwind类使用是否合理
- 响应式设计是否完善
- 动画效果是否流畅

## 组织结构建议

```typescript
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 需要的图标 } from 'lucide-react';

// shadcn/ui组件
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 类型定义
interface ComponentProps {
  // props类型
}

// 数据验证Schema
const dataSchema = z.object({
  // 数据结构定义
});

// 组件实现
const ComponentName: React.FC<ComponentProps> = ({ props }) => {
  // 表单处理
  const form = useForm({
    resolver: zodResolver(dataSchema),
    defaultValues: {}
  });

  // 持久化存储
  const [storedData, setStoredData] = useLocalStorage('key', initialValue, {
    expiresIn: 7 * 24 * 60 * 60 * 1000
  });

  // 组件逻辑

  return (
    // JSX结构
  );
};

export default ComponentName;
```

## 常见功能实现示例

1. **表单验证与提交**:
```typescript
const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().optional()
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema)
});
```

2. **主题切换**:
```typescript
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

3. **响应式对话框**:
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ResponsiveDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog Description
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

## 测试和验证

1. 功能测试：
   - 组件渲染是否正常
   - 交互功能是否正确
   - 数据持久化是否生效
   - 表单验证是否有效

2. 样式测试：
   - 响应式布局
   - 暗色主题支持
   - 动画效果
   - 可访问性

3. 性能测试：
   - 组件重渲染优化
   - 数据处理效率
   - 本地存储使用情况

---

*使用此模板可以快速构建功能完整、性能可靠的React组件。模板支持各种现代开发工具和库，可根据具体需求灵活调整。*