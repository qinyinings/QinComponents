import React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { 
  BaseComponentProps, 
  DisableableProps, 
  SizeProps, 
  LoadingProps,
  ButtonVariant,
  MouseEventHandler,
  KeyboardEventHandler
} from '../../../types/common';
import './index.scss';

/**
 * Button 组件属性接口
 * 继承原生 button 元素的所有属性（排除冲突属性），并添加自定义属性
 */
export interface ButtonProps extends 
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
  BaseComponentProps,
  DisableableProps,
  SizeProps,
  LoadingProps {
  /**
   * 按钮内容，支持文本或React节点
   */
  children?: ReactNode;
  
  /**
   * 按钮内容（向后兼容，优先级低于children）
   */
  label?: ReactNode;
  
  /**
   * 按钮变体类型
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * 按钮HTML类型
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * 是否为块级按钮（宽度100%）
   */
  block?: boolean;
  
  /**
   * 按钮图标（前置）
   */
  icon?: ReactNode;
  
  /**
   * 按钮图标（后置）
   */
  iconRight?: ReactNode;
  
  /**
   * 点击事件处理器
   */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  
  /**
   * 键盘事件处理器
   */
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  
  /**
   * 危险按钮样式（红色主题）
   */
  danger?: boolean;
  
  /**
   * 幽灵按钮（透明背景）
   */
  ghost?: boolean;
}

/**
 * 基础按钮组件
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  label,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  block = false,
  danger = false,
  ghost = false,
  icon,
  iconRight,
  className = '',
  onClick,
  onKeyDown,
  style,
  'data-testid': testId,
  ...restProps
}) => {
  // 内容优先级：children > label
  const content = children ?? label;
  
  // 构建className
  const buttonClassName = [
    'QinComponents-button',
    `QinComponents-button--${variant}`,
    `QinComponents-button--${size}`,
    block && 'QinComponents-button--block',
    danger && 'QinComponents-button--danger',
    ghost && 'QinComponents-button--ghost',
    loading && 'QinComponents-button--loading',
    className,
  ].filter(Boolean).join(' ');
  
  // 处理禁用状态（加载时也应该禁用）
  const isDisabled = disabled || loading;
  
  return (
    <button
      {...restProps}
      type={type}
      className={buttonClassName}
      style={style}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      onKeyDown={isDisabled ? undefined : onKeyDown}
      data-testid={testId}
    >
      {icon && <span className="QinComponents-button-icon">{icon}</span>}
      {loading && <span className="QinComponents-button-loading">⟳</span>}
      {content && <span className="QinComponents-button-content">{content}</span>}
      {iconRight && <span className="QinComponents-button-icon-right">{iconRight}</span>}
    </button>
  );
};

export default Button; 