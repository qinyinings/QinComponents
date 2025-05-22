import React from 'react';
import type { ReactNode, CSSProperties } from 'react';
import './index.scss';

export interface CardProps {
  /**
   * 卡片标题
   */
  title?: string;
  /**
   * 卡片额外内容，显示在右上角
   */
  extra?: ReactNode;
  /**
   * 是否显示边框
   */
  bordered?: boolean;
  /**
   * 卡片内容
   */
  children: ReactNode;
  /**
   * 卡片底部内容
   */
  footer?: ReactNode;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: CSSProperties;
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
  className = '',
  style,
}) => {
  const cardClassName = [
    'QinComponents-card',
    bordered ? 'QinComponents-card--bordered' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClassName} style={style}>
      {(title || extra) && (
        <div className="QinComponents-card-header">
          {title && <div className="QinComponents-card-title">{title}</div>}
          {extra && <div className="QinComponents-card-extra">{extra}</div>}
        </div>
      )}
      
      <div className="QinComponents-card-content">
        {children}
      </div>
      
      {footer && (
        <div className="QinComponents-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 