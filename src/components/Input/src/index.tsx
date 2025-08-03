import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import type { 
  BaseComponentProps, 
  DisableableProps, 
  SizeProps,
  FormFieldProps,
  InputType,
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEventHandler
} from '../../../types/common';
import './index.scss';

/**
 * Input 组件属性接口
 * 继承原生 input 元素的所有属性（排除冲突属性），并添加自定义属性
 */
export interface InputProps extends 
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>,
  BaseComponentProps,
  DisableableProps,
  SizeProps,
  FormFieldProps {
  /**
   * 输入框类型
   * @default 'text'
   */
  type?: InputType;
  
  /**
   * 输入框值（受控组件）
   */
  value?: string | number;
  
  /**
   * 默认值（非受控组件）
   */
  defaultValue?: string | number;
  
  /**
   * 输入框前缀图标或内容
   */
  prefix?: ReactNode;
  
  /**
   * 输入框后缀图标或内容
   */
  suffix?: ReactNode;
  
  /**
   * 输入框前置标签
   */
  addonBefore?: ReactNode;
  
  /**
   * 输入框后置标签
   */
  addonAfter?: ReactNode;
  
  /**
   * 是否显示清除按钮
   */
  allowClear?: boolean;
  
  /**
   * 是否显示字数统计
   */
  showCount?: boolean;
  
  /**
   * 最大输入长度
   */
  maxLength?: number;
  
  /**
   * 输入变化事件
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  
  /**
   * 输入框获得焦点事件
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  
  /**
   * 输入框失去焦点事件
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  
  /**
   * 键盘按下事件
   */
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  
  /**
   * 键盘抬起事件
   */
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  
  /**
   * 回车事件
   */
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
  
  /**
   * 清除按钮点击事件
   */
  onClear?: () => void;
  
  /**
   * 自动获取焦点
   */
  autoFocus?: boolean;
  
  /**
   * 自动完成
   */
  autoComplete?: string;
  
  /**
   * 拼写检查
   */
  spellCheck?: boolean;
}

/**
 * 输入框组件
 */
export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  defaultValue,
  placeholder,
  size = 'medium',
  disabled = false,
  readOnly = false,
  label,
  error,
  helperText,
  required = false,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  allowClear = false,
  showCount = false,
  maxLength,
  className = '',
  style,
  id,
  name,
  autoFocus = false,
  autoComplete,
  spellCheck,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onPressEnter,
  onClear,
  'data-testid': testId,
  ...restProps
}) => {
  const [currentValue, setCurrentValue] = React.useState(value || defaultValue || '');
  const [focused, setFocused] = React.useState(false);
  
  // 处理受控组件
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : currentValue;
  
  // 构建className
  const wrapperClassName = [
    'QinComponents-input-wrapper',
    className,
  ].filter(Boolean).join(' ');
  
  const inputClassName = [
    'QinComponents-input',
    `QinComponents-input--${size}`,
    error && 'QinComponents-input--error',
    focused && 'QinComponents-input--focused',
    prefix && 'QinComponents-input--with-prefix',
    suffix && 'QinComponents-input--with-suffix',
  ].filter(Boolean).join(' ');
  
  // 事件处理
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!isControlled) {
      setCurrentValue(e.target.value);
    }
    onChange?.(e);
  };
  
  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(false);
    onBlur?.(e);
  };
  
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      onPressEnter?.(e);
    }
    onKeyDown?.(e);
  };
  
  const handleClear = () => {
    if (!isControlled) {
      setCurrentValue('');
    }
    onClear?.();
    // 触发onChange事件
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };
  
  // 计算当前字符数
  const currentLength = String(inputValue).length;
  const shouldShowCount = showCount && maxLength;
  const shouldShowClear = allowClear && inputValue && !disabled && !readOnly;

  return (
    <div className={wrapperClassName} style={style}>
      {label && (
        <label 
          className="QinComponents-input-label" 
          htmlFor={id}
        >
          {label}
          {required && <span className="QinComponents-input-required">*</span>}
        </label>
      )}
      
      <div className="QinComponents-input-container">
        {addonBefore && (
          <div className="QinComponents-input-addon-before">
            {addonBefore}
          </div>
        )}
        
        <div className="QinComponents-input-inner">
          {prefix && (
            <span className="QinComponents-input-prefix">
              {prefix}
            </span>
          )}
          
          <input
            {...restProps}
            id={id}
            name={name}
            type={type}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            spellCheck={spellCheck}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onKeyUp={onKeyUp}
            className={inputClassName}
            data-testid={testId}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          
          {shouldShowClear && (
            <button
              type="button"
              className="QinComponents-input-clear"
              onClick={handleClear}
              tabIndex={-1}
            >
              ×
            </button>
          )}
          
          {suffix && (
            <span className="QinComponents-input-suffix">
              {suffix}
            </span>
          )}
        </div>
        
        {addonAfter && (
          <div className="QinComponents-input-addon-after">
            {addonAfter}
          </div>
        )}
      </div>
      
      <div className="QinComponents-input-footer">
        {error && (
          <div 
            className="QinComponents-input-error-message"
            id={`${id}-error`}
            role="alert"
          >
            {error}
          </div>
        )}
        
        {!error && helperText && (
          <div className="QinComponents-input-helper-text">
            {helperText}
          </div>
        )}
        
        {shouldShowCount && (
          <div className="QinComponents-input-count">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input; 