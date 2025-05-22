import React from 'react';
import './index.scss';

export interface ButtonProps {
  /**
   * 按钮的主要内容
   */
  label: string;
  /**
   * 按钮类型
   */
  variant?: 'primary' | 'secondary' | 'outline';
  /**
   * 按钮尺寸
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 按钮是否禁用
   */
  disabled?: boolean;
  /**
   * 点击事件回调函数
   */
  onClick?: () => void;
}

/**
 * 基础按钮组件
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  return (
    <button
      className={`QinComponents-button QinComponents-button--${variant} QinComponents-button--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button; 