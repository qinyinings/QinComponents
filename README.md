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

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动 Storybook

```bash
npm run storybook
```

### 构建组件库

```bash
npm run build
```

### 运行测试

```bash
npm test
```

### 查看测试覆盖率

```bash
npm run coverage
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
  ├── ComponentName.tsx       // 组件实现
  ├── ComponentName.scss      // 组件样式
  ├── .stories/               // Storybook 故事目录
  │   └── ComponentName.stories.tsx  // Storybook 故事文件
  └── .tests/                 // 测试文件目录
      └── ComponentName.test.tsx     // 测试文件
```

### 组件命名

- 组件文件名：使用 PascalCase（如 `Button.tsx`）
- 组件名：使用 PascalCase（如 `Button`）
- CSS 类名：使用 kebab-case 并添加前缀（如 `QinComponents-button`）

### 开发流程

1. 在 `src/components` 目录下创建新的组件目录
2. 实现组件的 TSX 文件
3. 创建组件的 SCSS 样式文件
4. 在 `.stories` 子目录中编写组件的 Storybook 故事
5. 在 `.tests` 子目录中编写组件的测试用例
6. 在 `src/components/index.ts` 中导出组件

## 测试指南

- 所有组件都必须编写单元测试
- 测试文件放在组件目录下的 `.tests` 子目录中
- 测试必须覆盖组件的所有主要功能和边界情况
- 使用 Vitest 作为测试运行器
- 使用 Testing Library 进行组件测试
- 尽量达到较高的测试覆盖率（80%以上）

## 许可证

MIT
