import React, { memo } from 'react';
import type { VirtualScrollState } from '../../../../types/common';

interface ScrollIndicatorProps {
  /**
   * 滚动状态
   */
  scrollState: VirtualScrollState;
  
  /**
   * 是否显示滚动指示器
   */
  visible?: boolean;
  
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 滚动指示器组件
 * 显示当前滚动位置和进度
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = memo(({
  scrollState,
  visible = true,
  className = '',
  style,
}) => {
  if (!visible || scrollState.totalHeight <= scrollState.containerHeight) {
    return null;
  }
  
  const { scrollTop, totalHeight, containerHeight, range } = scrollState;
  const scrollProgress = totalHeight > containerHeight 
    ? (scrollTop / (totalHeight - containerHeight)) * 100 
    : 0;
  
  const indicatorClassName = [
    'QinComponents-scroll-indicator',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div
      className={indicatorClassName}
      style={style}
    >
      <div className="QinComponents-scroll-indicator__track">
        <div
          className="QinComponents-scroll-indicator__thumb"
          style={{
            height: `${(containerHeight / totalHeight) * 100}%`,
            transform: `translateY(${scrollProgress}%)`,
          }}
        />
      </div>
      
      <div className="QinComponents-scroll-indicator__info">
        <span className="QinComponents-scroll-indicator__progress">
          {Math.round(scrollProgress)}%
        </span>
        <span className="QinComponents-scroll-indicator__range">
          {range.visibleStartIndex + 1}-{range.visibleEndIndex + 1}
        </span>
      </div>
    </div>
  );
});

ScrollIndicator.displayName = 'ScrollIndicator';
