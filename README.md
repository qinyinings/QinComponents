# QinComponents 组件库

QinComponents 是一个基于 React + Vite + SCSS + Storybook 搭建的现代化组件库，提供了一系列可复用的 UI 组件，帮助开发者快速构建美观、一致的用户界面。

## 技术栈

- React (19.x)
- TypeScript
- SCSS
- Storybook (8.x)
- Vite (6.x)
- Vitest + Testing Library

## 环境要求

- Node.js 18.x 或更高版本
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

### 启动 Storybook

```bash
pnpm run storybook
```

### 构建组件库

```bash
pnpm run build
```

### 预览构建结果

```bash
pnpm run preview
```

### 运行测试

```bash
pnpm run test
```

### 查看测试覆盖率

```bash
pnpm run coverage
```

## 组件列表

当前组件库包含以下组件：

- Button - 按钮组件
- Input - 输入框组件
- Card - 卡片组件

## 组件开发规范

### 文件结构

每个组件都应遵循以下文件结构：

```
ComponentName/
  ├── src/
  │   ├── index.tsx           // 组件实现
  │   └── index.scss          // 组件样式
  ├── .stories/               // Storybook 故事目录
  │   └── ComponentName.stories.tsx  // Storybook 故事文件
  └── .tests/                 // 测试文件目录
      └── ComponentName.test.tsx     // 测试文件
```

### 组件命名

- 组件文件名：使用 PascalCase（如 `Button.tsx`）
- 组件名：使用 PascalCase（如 `Button`）
- CSS 类名：使用 kebab-case 并添加前缀（如 `QinComponents-button`）

### 开发流程与环境选择

#### 🎯 组件开发阶段 - 使用 Storybook

```bash
pnpm run storybook
```

**开发步骤：**
1. 在 `src/components` 目录下创建新的组件目录
2. 实现组件的 TSX 文件和 SCSS 样式文件
3. 在 `.stories` 子目录中编写 Storybook 故事
4. 在 Storybook 中实时预览和调试组件
5. 完善组件的各种状态和变体

**Storybook 开发的优势：**
- 🔍 **专注开发**：隔离环境，专注单个组件
- ⚡ **实时预览**：修改代码立即看到效果
- 🎛️ **状态切换**：快速测试不同 props 和状态
- 📖 **文档同步**：开发过程中同时完善文档

#### 🔗 集成测试阶段 - 使用 Dev 模式

```bash
pnpm run dev
```

**测试内容：**
1. 验证组件在主应用中的表现
2. 测试组件间的交互和组合使用
3. 检查整体样式一致性
4. 确认在真实场景下的可用性

#### 📝 推荐的开发工作流

```bash
# 1. 启动 Storybook 进行组件开发
pnpm run storybook

# 2. 开发完成后，启动主应用进行集成测试
pnpm run dev

# 3. 编写测试用例
pnpm run test

# 4. 构建验证
pnpm run build
```

### 具体开发建议

1. **新组件开发**：主要在 Storybook 中进行
2. **现有组件修改**：在 Storybook 中调试，在 Dev 中验证
3. **样式调整**：优先在 Storybook 中完成
4. **交互逻辑**：Storybook 中开发，Dev 中测试集成效果
5. **文档编写**：在 Storybook Stories 中同步完成

### 组件导出

完成组件开发后，在 `src/components/index.ts` 中导出组件：

```typescript
export { NewComponent } from './NewComponent/src';
export type { NewComponentProps } from './NewComponent/src';
```

## 测试指南

- 所有组件都必须编写单元测试
- 测试文件放在组件目录下的 `.tests` 子目录中
- 测试必须覆盖组件的所有主要功能和边界情况
- 使用 Vitest 作为测试运行器
- 使用 Testing Library 进行组件测试
- 尽量达到较高的测试覆盖率（80%以上）

## 许可证

MIT
