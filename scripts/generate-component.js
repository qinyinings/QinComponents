#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 获取命令行参数，第一个参数是组件名
let componentName = process.argv[2];

// 组件属性存储
const componentProps = [];

// 主函数
async function main() {
  if (!componentName) {
    componentName = await promptQuestion('请输入组件名称: ');
    if (!componentName) {
      console.error('组件名称不能为空');
      process.exit(1);
    }
  }

  // 确保组件名称第一个字母大写
  const formattedComponentName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  // 创建属性
  console.log(
    '\n请添加组件属性（每行一个，格式为: 属性名:类型:默认值:描述，输入空行结束）:'
  );
  console.log('例如: disabled:boolean:false:是否禁用');

  let propInput = await promptQuestion('属性 1: ');
  let propCount = 1;

  while (propInput.trim() !== '') {
    const [name, type, defaultValue, description] = propInput.split(':');

    if (name) {
      componentProps.push({
        name: name.trim(),
        type: type?.trim() || 'string',
        defaultValue: defaultValue?.trim() || undefined,
        description: description?.trim() || `${name} 属性`,
      });
    }

    propCount++;
    propInput = await promptQuestion(`属性 ${propCount}: `);
  }

  // 始终添加 className 属性
  if (!componentProps.some((prop) => prop.name === 'className')) {
    componentProps.push({
      name: 'className',
      type: 'string',
      defaultValue: "''",
      description: '自定义类名',
    });
  }

  // 始终添加 children 属性
  if (!componentProps.some((prop) => prop.name === 'children')) {
    componentProps.push({
      name: 'children',
      type: 'React.ReactNode',
      defaultValue: undefined,
      description: '子元素',
    });
  }

  // 组件目录路径
  const componentDir = path.join(
    __dirname,
    '..',
    'src',
    'components',
    formattedComponentName
  );
  const srcDir = path.join(componentDir, 'src');
  const storiesDir = path.join(componentDir, '.stories');
  const testsDir = path.join(componentDir, '.tests');

  // 创建目录
  try {
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
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

  // 生成文件内容
  const componentContent = generateComponentContent(formattedComponentName);
  const scssContent = generateScssContent(formattedComponentName);
  const storiesContent = generateStoriesContent(formattedComponentName);
  const testsContent = generateTestsContent(formattedComponentName);

  // 写入文件
  try {
    fs.writeFileSync(
      path.join(srcDir, 'index.tsx'),
      componentContent
    );
    fs.writeFileSync(
      path.join(srcDir, 'index.scss'),
      scssContent
    );
    fs.writeFileSync(
      path.join(storiesDir, `${formattedComponentName}.stories.tsx`),
      storiesContent
    );
    fs.writeFileSync(
      path.join(testsDir, `${formattedComponentName}.test.tsx`),
      testsContent
    );

    console.log(`\n✅ 成功创建 ${formattedComponentName} 组件相关文件：`);
    console.log(`- src/index.tsx`);
    console.log(`- src/index.scss`);
    console.log(`- .stories/${formattedComponentName}.stories.tsx`);
    console.log(`- .tests/${formattedComponentName}.test.tsx`);

    // 提示更新 index.ts
    console.log('\n别忘了在 src/components/index.ts 文件中添加导出：');
    console.log(
      `export { ${formattedComponentName} } from './${formattedComponentName}/src';`
    );
    console.log(
      `export type { ${formattedComponentName}Props } from './${formattedComponentName}/src';`
    );
  } catch (err) {
    console.error('写入文件失败:', err);
    process.exit(1);
  }

  rl.close();
}

// 生成组件内容
function generateComponentContent(componentName) {
  // 属性接口定义
  const propsInterface = componentProps
    .map((prop) => {
      return `  /**
   * ${prop.description}
   */
  ${prop.name}${prop.defaultValue !== undefined ? '?' : ''}: ${prop.type};`;
    })
    .join('\n\n');

  // 属性解构和默认值
  const propsDestructure = componentProps
    .filter((prop) => prop.name !== 'children') // children 单独处理
    .map((prop) => {
      return prop.defaultValue !== undefined
        ? `  ${prop.name} = ${prop.defaultValue},`
        : `  ${prop.name},`;
    })
    .join('\n');

  // 是否包含 children 属性
  const hasChildren = componentProps.some((prop) => prop.name === 'children');
  const childrenDestructure = hasChildren ? '\n  children,' : '';

  return `import React from 'react';
import './index.scss';

export interface ${componentName}Props {
${propsInterface}
}

/**
 * ${componentName} 组件
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
${propsDestructure}${childrenDestructure}
}) => {
  const componentClassName = [
    'QinComponents-${componentName.toLowerCase()}',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={componentClassName}>
      ${hasChildren ? '{children}' : `${componentName} 组件`}
    </div>
  );
};

export default ${componentName};`;
}

// 生成 SCSS 内容
function generateScssContent(componentName) {
  return `@use "../../../styles/variables" as *;

// ${componentName} 基础样式
.QinComponents-${componentName.toLowerCase()} {
  display: flex;
  color: $text-color-primary;
  font-family: $font-family-sans;
  font-size: $font-size-base;
  line-height: $line-height-normal;
}`;
}

// 生成 Stories 内容
function generateStoriesContent(componentName) {
  const argTypes = componentProps
    .filter((prop) => prop.name !== 'children')
    .map((prop) => {
      if (prop.type === 'boolean') {
        return `    ${prop.name}: { control: 'boolean' }`;
      } else if (prop.type.includes('|')) {
        // 处理联合类型，如 'primary' | 'secondary' | 'outline'
        const options = prop.type
          .replace(/['"]/g, '')
          .split('|')
          .map((t) => t.trim());
        return `    ${prop.name}: {
      control: { type: 'select' },
      options: [${options.join(', ')}],
    }`;
      } else {
        return `    ${prop.name}: { control: 'text' }`;
      }
    })
    .join(',\n');

  const hasChildren = componentProps.some((prop) => prop.name === 'children');
  const childrenStory = hasChildren
    ? `
    children: '这是一个 ${componentName} 组件',`
    : '';

  const defaultArgs = componentProps
    .filter(
      (prop) =>
        prop.name !== 'children' &&
        prop.defaultValue !== undefined &&
        prop.defaultValue !== "''"
    )
    .map((prop) => {
      if (prop.type === 'string') {
        return `    ${prop.name}: ${prop.defaultValue},`;
      } else {
        return `    ${prop.name}: ${prop.defaultValue},`;
      }
    })
    .join('\n');

  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from '../src';

const meta = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
${argTypes}
  },
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础示例
export const Default: Story = {
  args: {${childrenStory}
${defaultArgs}
  },
};

// 自定义类名
export const CustomClassName: Story = {
  args: {
    className: 'custom-class',${childrenStory}
  },
};`;
}

// 生成测试内容
function generateTestsContent(componentName) {
  const hasChildren = componentProps.some((prop) => prop.name === 'children');
  const renderArgs = hasChildren
    ? `<${componentName}>{testContent}</${componentName}>`
    : `<${componentName} />`;

  const testElement = hasChildren
    ? `screen.getByText(testContent)`
    : `container.firstChild`;

  const classNameTest = hasChildren
    ? `    expect(element).toHaveClass('QinComponents-${componentName.toLowerCase()}');
    expect(element).toHaveClass(customClass);`
    : `    expect(screen.getByText('${componentName} 组件')).toHaveClass('QinComponents-${componentName.toLowerCase()}');
    expect(screen.getByText('${componentName} 组件')).toHaveClass(customClass);`;

  // 获取布尔类型的属性，用于添加测试用例
  const booleanProps = componentProps.filter((prop) => prop.type === 'boolean');
  const booleanTests = booleanProps
    .map((prop) => {
      return `
  it('应该正确处理 ${prop.name} 属性', () => {
    const { rerender } = render(<${componentName} ${prop.name}={true} />);
    ${
      hasChildren
        ? `let element = container.firstChild;
    expect(element).toHaveClass('QinComponents-${componentName.toLowerCase()}--${
            prop.name
          }');`
        : `let element = screen.getByText('${componentName} 组件');
    expect(element).toHaveClass('QinComponents-${componentName.toLowerCase()}--${
            prop.name
          }');`
    }
    
    rerender(<${componentName} ${prop.name}={false} />);
    ${
      hasChildren
        ? `element = container.firstChild;
    expect(element).not.toHaveClass('QinComponents-${componentName.toLowerCase()}--${
            prop.name
          }');`
        : `element = screen.getByText('${componentName} 组件');
    expect(element).not.toHaveClass('QinComponents-${componentName.toLowerCase()}--${
            prop.name
          }');`
    }
  });`;
    })
    .join('\n');

  return `import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from '../src';

describe('${componentName} 组件', () => {
  it('应该正确渲染默认组件', () => {
    ${hasChildren ? "const testContent = '测试内容';" : ''}
    const { container } = render(${renderArgs});
    
    ${
      hasChildren
        ? `expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByText(testContent).className).toContain('QinComponents-${componentName.toLowerCase()}');`
        : `expect(screen.getByText('${componentName} 组件')).toBeInTheDocument();
    expect(screen.getByText('${componentName} 组件').className).toContain('QinComponents-${componentName.toLowerCase()}');`
    }
  });

  it('应该应用自定义类名', () => {
    ${hasChildren ? "const testContent = '测试内容';" : ''}
    const customClass = 'custom-class';
    const { container } = render(${
      hasChildren
        ? `<${componentName} className={customClass}>{testContent}</${componentName}>`
        : `<${componentName} className={customClass} />`
    });
    
    ${hasChildren ? `const element = screen.getByText(testContent);` : ''}
    ${classNameTest}
  });${booleanTests}
});`;
}

// 提示问题并获取回答
function promptQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// 运行主函数
main().catch((err) => {
  console.error('出错了:', err);
  process.exit(1);
});
