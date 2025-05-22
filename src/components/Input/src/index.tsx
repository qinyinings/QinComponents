import React from 'react';
import type { ChangeEvent } from 'react';
import './index.scss';

export interface InputProps {
  /**
   * 输入框类型
   */
  type?: 'text' | 'password' | 'email' | 'number';
  /**
   * 输入框值
   */
  value?: string;
  /**
   * 占位符文本
   */
  placeholder?: string;
  /**
   * 输入框大小
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否只读
   */
  readOnly?: boolean;
  /**
   * 输入框标签
   */
  label?: string;
  /**
   * 错误信息
   */
  error?: string;
  /**
   * 输入框变化事件
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 输入框组件
 */
export const Input: React.FC<InputProps> = ({
  type = 'text',
  value = '',
  placeholder = '',
  size = 'medium',
  disabled = false,
  readOnly = false,
  label,
  error,
  onChange,
}) => {
  const inputClassNames = [
    'QinComponents-input',
    `QinComponents-input--${size}`,
    error ? 'QinComponents-input--error' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="QinComponents-input-wrapper">
      {label && (
        <label className="QinComponents-input-label">
          {label}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        className={inputClassNames}
      />
      
      {error && (
        <div className="QinComponents-input-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input; 