// ===========================================
// QinComponents 组件库主入口文件
// ===========================================

// 导入组件模块用于默认导出
import * as components from './components';

// 导出所有组件和类型
export * from './components';

// 导出通用类型定义
export * from './types/common';

// 导出样式变量（如果需要在 JS 中使用）
// 注意：SCSS 变量无法直接导出到 JS，但可以提供一些常用的值
export const designTokens = {
  // 颜色
  colors: {
    primary: '#3498db',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
  },
  
  // 间距（单位：px）
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },
  
  // 字体大小（单位：px）
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  
  // 圆角（单位：px）
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    base: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // 阴影
  boxShadow: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px rgba(0, 0, 0, 0.25)',
  },
} as const;

// 导出版本信息
export const version = '0.1.0';

// 导出组件库信息
export const libraryInfo = {
  name: 'QinComponents',
  version,
  description: 'QinComponents 是一个基于 React + Vite + SCSS + Storybook 搭建的现代化组件库',
  repository: 'https://github.com/qin/QinComponents',
  author: '',
  license: 'ISC',
} as const;

// 样式导入函数（可选）
export const importStyles = () => {
  if (typeof window !== 'undefined') {
    import('./styles.scss').catch(console.error);
  }
};

// 默认导出（包含所有主要内容）
export default {
  ...components,
  designTokens,
  version,
  libraryInfo,
  importStyles,
} as const;