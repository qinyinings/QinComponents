import React from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import type { 
  BaseComponentProps, 
  RequiredChildrenProps,
  SizeProps,
  MouseEventHandler
} from '../../../types/common';
import './index.scss';

/**
 * Card 组件属性接口
 * 继承原生 div 元素的所有属性，并添加自定义属性
 */
export interface CardProps extends 
  Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'>,
  BaseComponentProps,
  RequiredChildrenProps,
  SizeProps {
  /**
   * 卡片标题，支持字符串或React节点
   */
  title?: ReactNode;
  
  /**
   * 卡片额外内容，显示在标题右侧
   */
  extra?: ReactNode;
  
  /**
   * 是否显示边框
   * @default true
   */
  bordered?: boolean;
  
  /**
   * 卡片底部内容
   */
  footer?: ReactNode;
  
  /**
   * 卡片是否可悬停（显示悬停效果）
   * @default false
   */
  hoverable?: boolean;
  
  /**
   * 卡片是否加载中
   */
  loading?: boolean;
  
  /**
   * 卡片类型
   */
  type?: 'default' | 'inner';
  
  /**
   * 卡片头部样式
   */
  headStyle?: React.CSSProperties;
  
  /**
   * 卡片内容样式
   */
  bodyStyle?: React.CSSProperties;
  
  /**
   * 卡片操作组
   */
  actions?: ReactNode[];
  
  /**
   * 卡片封面
   */
  cover?: ReactNode;
  
  /**
   * 点击事件
   */
  onClick?: MouseEventHandler<HTMLDivElement>;
  
  /**
   * 标题点击事件
   */
  onTitleClick?: MouseEventHandler<HTMLDivElement>;
}

/**
 * 卡片组件
 */
export const Card: React.FC<CardProps> = ({
  title,
  extra,
  bordered = true,
  children,
  footer,
  hoverable = false,
  loading = false,
  type = 'default',
  size = 'medium',
  actions,
  cover,
  headStyle,
  bodyStyle,
  className = '',
  style,
  onClick,
  onTitleClick,
  'data-testid': testId,
  ...restProps
}) => {
  // 构建className
  const cardClassName = [
    'QinComponents-card',
    `QinComponents-card--${type}`,
    `QinComponents-card--${size}`,
    bordered && 'QinComponents-card--bordered',
    hoverable && 'QinComponents-card--hoverable',
    loading && 'QinComponents-card--loading',
    onClick && 'QinComponents-card--clickable',
    className,
  ].filter(Boolean).join(' ');
  
  // 处理标题点击
  const handleTitleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation(); // 阻止冒泡到卡片点击事件
    onTitleClick?.(e);
  };

  return (
    <div 
      {...restProps}
      className={cardClassName} 
      style={style}
      onClick={onClick}
      data-testid={testId}
    >
      {loading && (
        <div className="QinComponents-card-loading">
          <div className="QinComponents-card-loading-spinner">⟳</div>
        </div>
      )}
      
      {cover && (
        <div className="QinComponents-card-cover">
          {cover}
        </div>
      )}
      
      {(title || extra) && (
        <div 
          className="QinComponents-card-header"
          style={headStyle}
        >
          {title && (
            <div 
              className="QinComponents-card-title"
              onClick={onTitleClick ? handleTitleClick : undefined}
              style={{ cursor: onTitleClick ? 'pointer' : 'default' }}
            >
              {title}
            </div>
          )}
          {extra && (
            <div className="QinComponents-card-extra">
              {extra}
            </div>
          )}
        </div>
      )}
      
      <div 
        className="QinComponents-card-content"
        style={bodyStyle}
      >
        {children}
      </div>
      
      {actions && actions.length > 0 && (
        <div className="QinComponents-card-actions">
          {actions.map((action, index) => (
            <div key={index} className="QinComponents-card-action">
              {action}
            </div>
          ))}
        </div>
      )}
      
      {footer && (
        <div className="QinComponents-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 