// ===========================================
// QinComponents 通用类型定义
// ===========================================

import type { ReactNode, CSSProperties } from 'react';

/**
 * 组件尺寸枚举
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * 按钮变体枚举
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline';

/**
 * 输入框类型枚举
 */
export type InputType = 
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'color';

/**
 * 基础组件属性接口
 */
export interface BaseComponentProps {
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 自定义样式
   */
  style?: CSSProperties;
  
  /**
   * 测试标识符
   */
  'data-testid'?: string;
}

/**
 * 可禁用组件属性接口
 */
export interface DisableableProps {
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * 尺寸属性接口
 */
export interface SizeProps {
  /**
   * 组件尺寸
   */
  size?: ComponentSize;
}

/**
 * 加载状态属性接口
 */
export interface LoadingProps {
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
}

/**
 * 子元素属性接口
 */
export interface ChildrenProps {
  /**
   * 子元素内容
   */
  children?: ReactNode;
}

/**
 * 必须子元素属性接口
 */
export interface RequiredChildrenProps {
  /**
   * 子元素内容
   */
  children: ReactNode;
}

/**
 * 表单字段通用属性
 */
export interface FormFieldProps {
  /**
   * 字段名称
   */
  name?: string;
  
  /**
   * 字段ID
   */
  id?: string;
  
  /**
   * 字段标签
   */
  label?: string;
  
  /**
   * 错误信息
   */
  error?: string;
  
  /**
   * 帮助文本
   */
  helperText?: string;
  
  /**
   * 是否必填
   */
  required?: boolean;
}

/**
 * 键盘事件处理器类型
 */
export type KeyboardEventHandler<T = HTMLElement> = (event: React.KeyboardEvent<T>) => void;

/**
 * 鼠标事件处理器类型
 */
export type MouseEventHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void;

/**
 * 焦点事件处理器类型
 */
export type FocusEventHandler<T = HTMLElement> = (event: React.FocusEvent<T>) => void;

/**
 * 输入变化事件处理器类型
 */
export type ChangeEventHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;

/**
 * 工具类型：排除某些属性
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * 工具类型：可选属性
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 工具类型：合并两个类型
 */
export type Merge<T, U> = Omit<T, Extract<keyof T, keyof U>> & U;