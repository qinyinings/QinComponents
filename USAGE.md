# QinComponents 使用指南

## 安装和基本使用

### 1. 安装组件库（模拟）
```bash
npm install qin-components
# 或
pnpm add qin-components
```

### 2. 导入和使用组件

#### 方式一：按需导入（推荐）
```tsx
import React from 'react';
import { Button, Input, Card } from 'qin-components';

// 导入样式（可选，如果没有全局导入的话）
import 'qin-components/dist/styles.css';

function App() {
  return (
    <div>
      <Card title="欢迎使用 QinComponents">
        <Input placeholder="请输入内容" />
        <Button label="提交" variant="primary" />
      </Card>
    </div>
  );
}
```

#### 方式二：全量导入
```tsx
import React from 'react';
import QinComponents, { designTokens } from 'qin-components';

const { Button, Input, Card } = QinComponents;

function App() {
  return (
    <div>
      <Card title="欢迎使用 QinComponents">
        <Input placeholder="请输入内容" />
        <Button 
          label="提交" 
          variant="primary" 
          style={{ marginTop: designTokens.spacing.base }}
        />
      </Card>
    </div>
  );
}
```

### 3. 使用设计 Tokens

```tsx
import React from 'react';
import { Button, designTokens } from 'qin-components';

function CustomComponent() {
  return (
    <div
      style={{
        padding: designTokens.spacing.lg,
        borderRadius: designTokens.borderRadius.md,
        boxShadow: designTokens.boxShadow.base,
        fontSize: designTokens.fontSize.base,
      }}
    >
      <Button label="自定义样式按钮" />
    </div>
  );
}
```

### 4. 类型导入

```tsx
import React from 'react';
import { Button, ButtonProps, Input, InputProps } from 'qin-components';

// 扩展组件属性
interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ loading, ...props }) => {
  return <Button {...props} disabled={loading || props.disabled} />;
};
```

### 5. 样式导入选项

#### 选项一：在入口文件中导入
```tsx
// main.tsx 或 App.tsx
import 'qin-components/dist/styles.css';
import { Button } from 'qin-components';
```

#### 选项二：使用样式导入函数
```tsx
import { importStyles, Button } from 'qin-components';

// 动态导入样式
importStyles();

function App() {
  return <Button label="按钮" />;
}
```

#### 选项三：在 SCSS 中导入
```scss
// styles/main.scss
@import '~qin-components/dist/styles.scss';

// 或者只导入变量
@use '~qin-components/dist/variables' as qin;

.custom-element {
  color: qin.$primary-color;
  padding: qin.$spacing-base;
}
```

## 可用组件

| 组件名 | 说明 | 导入路径 |
|--------|------|----------|
| Button | 按钮组件 | `import { Button } from 'qin-components'` |
| Input | 输入框组件 | `import { Input } from 'qin-components'` |
| Card | 卡片组件 | `import { Card } from 'qin-components'` |

## 设计 Tokens

```tsx
import { designTokens } from 'qin-components';

// 颜色
designTokens.colors.primary    // '#3498db'
designTokens.colors.success    // '#52c41a'
designTokens.colors.error      // '#ff4d4f'

// 间距
designTokens.spacing.xs        // 4
designTokens.spacing.base      // 16
designTokens.spacing.xl        // 24

// 字体大小
designTokens.fontSize.sm       // 12
designTokens.fontSize.base     // 14
designTokens.fontSize.lg       // 18

// 圆角
designTokens.borderRadius.sm   // 4
designTokens.borderRadius.base // 6
designTokens.borderRadius.lg   // 12

// 阴影
designTokens.boxShadow.sm      // '0 1px 3px rgba(0, 0, 0, 0.1)...'
designTokens.boxShadow.base    // '0 4px 6px rgba(0, 0, 0, 0.07)...'
```

## 最佳实践

### 1. 按需导入
```tsx
// ✅ 推荐：按需导入
import { Button, Input } from 'qin-components';

// ❌ 不推荐：全量导入会增加包体积
import * as QinComponents from 'qin-components';
```

### 2. 类型安全
```tsx
// ✅ 推荐：使用 TypeScript 类型
import { ButtonProps } from 'qin-components';

interface MyButtonProps extends ButtonProps {
  customProp?: string;
}
```

### 3. 样式隔离
```tsx
// ✅ 推荐：使用 CSS Modules 或 styled-components
import { Button } from 'qin-components';
import styles from './MyComponent.module.css';

<Button 
  label="按钮" 
  className={styles.customButton} 
/>
```

## 兼容性

- React >= 18.0.0
- TypeScript >= 4.5.0
- Node.js >= 16.0.0
- 现代浏览器（支持 ES2020）