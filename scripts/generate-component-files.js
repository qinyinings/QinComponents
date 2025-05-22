#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取命令行参数，第一个参数是组件名
const componentName = process.argv[2];

if (!componentName) {
  console.error('请提供组件名称作为参数');
  console.error('示例: node generate-component-files.js Button');
  process.exit(1);
}

// 确保组件名称第一个字母大写
const formattedComponentName =
  componentName.charAt(0).toUpperCase() + componentName.slice(1);

// 组件目录路径
const componentDir = path.join(
  __dirname,
  '..',
  'src',
  'components',
  formattedComponentName
);
const storiesDir = path.join(componentDir, '.stories');
const testsDir = path.join(componentDir, '.tests');

// 创建目录
try {
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  if (!fs.existsSync(storiesDir)) {
    fs.mkdirSync(storiesDir, { recursive: true });
  }
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }
} catch (err) {
  console.error('创建目录失败:', err);
  process.exit(1);
}

// 组件模板
const componentTemplate = `import React from 'react';
import './${formattedComponentName}.scss';

export interface ${formattedComponentName}Props {
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 子元素
   */
  children?: React.ReactNode;
}

/**
 * ${formattedComponentName} 组件
 */
export const ${formattedComponentName}: React.FC<${formattedComponentName}Props> = ({
  className = '',
  children,
}) => {
  const componentClassName = [
    'QinComponents-${formattedComponentName.toLowerCase()}',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={componentClassName}>
      {children}
    </div>
  );
};

export default ${formattedComponentName};`;

// SCSS 模板
const scssTemplate = `// ${formattedComponentName} 变量
$${formattedComponentName.toLowerCase()}-color: #333333;

// ${formattedComponentName} 基础样式
.QinComponents-${formattedComponentName.toLowerCase()} {
  display: flex;
  color: $${formattedComponentName.toLowerCase()}-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}`;

// Stories 模板
const storiesTemplate = `import type { Meta, StoryObj } from '@storybook/react';
import { ${formattedComponentName} } from '../${formattedComponentName}';

const meta = {
  title: 'Components/${formattedComponentName}',
  component: ${formattedComponentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
} satisfies Meta<typeof ${formattedComponentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础示例
export const Default: Story = {
  args: {
    children: '这是一个 ${formattedComponentName} 组件',
  },
};

// 自定义类名
export const CustomClassName: Story = {
  args: {
    className: 'custom-class',
    children: '自定义类名的 ${formattedComponentName} 组件',
  },
};`;

// Tests 模板
const testsTemplate = `import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${formattedComponentName} } from '../${formattedComponentName}';

describe('${formattedComponentName} 组件', () => {
  it('应该正确渲染默认组件', () => {
    const testContent = '测试内容';
    render(<${formattedComponentName}>{testContent}</${formattedComponentName}>);
    
    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByText(testContent).className).toContain('QinComponents-${formattedComponentName.toLowerCase()}');
  });

  it('应该应用自定义类名', () => {
    const testContent = '测试内容';
    const customClass = 'custom-class';
    render(<${formattedComponentName} className={customClass}>{testContent}</${formattedComponentName}>);
    
    const element = screen.getByText(testContent);
    expect(element).toHaveClass('QinComponents-${formattedComponentName.toLowerCase()}');
    expect(element).toHaveClass(customClass);
  });
});`;

// 写入文件
try {
  fs.writeFileSync(
    path.join(componentDir, `${formattedComponentName}.tsx`),
    componentTemplate
  );
  fs.writeFileSync(
    path.join(componentDir, `${formattedComponentName}.scss`),
    scssTemplate
  );
  fs.writeFileSync(
    path.join(storiesDir, `${formattedComponentName}.stories.tsx`),
    storiesTemplate
  );
  fs.writeFileSync(
    path.join(testsDir, `${formattedComponentName}.test.tsx`),
    testsTemplate
  );

  console.log(`✅ 成功创建 ${formattedComponentName} 组件相关文件：`);
  console.log(`- ${formattedComponentName}.tsx`);
  console.log(`- ${formattedComponentName}.scss`);
  console.log(`- .stories/${formattedComponentName}.stories.tsx`);
  console.log(`- .tests/${formattedComponentName}.test.tsx`);

  // 提示更新 index.ts
  console.log('\n别忘了在 src/components/index.ts 文件中添加导出：');
  console.log(
    `export { ${formattedComponentName} } from './${formattedComponentName}/${formattedComponentName}';`
  );
  console.log(
    `export type { ${formattedComponentName}Props } from './${formattedComponentName}/${formattedComponentName}';`
  );
} catch (err) {
  console.error('写入文件失败:', err);
  process.exit(1);
}
