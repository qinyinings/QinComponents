import React, { useRef, useEffect, memo } from 'react';

interface VirtualItemProps {
  /**
   * 项目索引
   */
  index: number;
  
  /**
   * 项目数据
   */
  data: any;
  
  /**
   * 项目样式
   */
  style: React.CSSProperties;
  
  /**
   * 是否在可视区域内
   */
  isVisible: boolean;
  
  /**
   * 渲染函数
   */
  children: React.ReactNode;
  
  /**
   * 高度变化回调
   */
  onHeightChange?: (index: number, height: number) => void;
  
  /**
   * 是否启用高度监测
   */
  enableHeightMeasurement?: boolean;
}

/**
 * 虚拟列表项组件
 * 负责监测项目高度变化并通知父组件
 */
export const VirtualItem: React.FC<VirtualItemProps> = memo(({
  index,
  data: _data,
  style,
  isVisible,
  children,
  onHeightChange,
  enableHeightMeasurement = false,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(0);
  
  // 监测高度变化
  useEffect(() => {
    if (!enableHeightMeasurement || !onHeightChange || !itemRef.current) {
      return;
    }
    
    const measureHeight = () => {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        const newHeight = rect.height;
        
        if (newHeight !== lastHeightRef.current && newHeight > 0) {
          lastHeightRef.current = newHeight;
          onHeightChange(index, newHeight);
        }
      }
    };
    
    // 初始测量
    measureHeight();
    
    // 使用 ResizeObserver 监听大小变化
    const resizeObserver = new ResizeObserver(measureHeight);
    resizeObserver.observe(itemRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [index, onHeightChange, enableHeightMeasurement]);
  
  return (
    <div
      ref={itemRef}
      className={[
        'QinComponents-virtual-item',
        isVisible && 'QinComponents-virtual-item--visible',
      ].filter(Boolean).join(' ')}
      style={style}
      data-index={index}
    >
      {children}
    </div>
  );
});

VirtualItem.displayName = 'VirtualItem';
