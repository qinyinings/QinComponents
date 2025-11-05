import React, { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import type {
  BaseComponentProps,
  VirtualListConfig,
  VirtualItemRenderer,
  VirtualScrollCallback,
  VirtualScrollState,
  VirtualItemPosition,
} from '../../../types/common';
import { useVirtualList } from './hooks/useVirtualList';
import './index.scss';

/**
 * VirtualList 组件属性接口
 */
export interface VirtualListProps<T = any> extends BaseComponentProps {
  /**
   * 数据列表
   */
  items: T[];
  
  /**
   * 项目渲染函数
   */
  renderItem: VirtualItemRenderer<T>;
  
  /**
   * 虚拟滚动配置
   */
  config?: VirtualListConfig;
  
  /**
   * 获取项目唯一标识的函数
   * @default (item, index) => index
   */
  getItemKey?: (item: T, index: number) => string | number;
  
  /**
   * 空状态渲染函数
   */
  renderEmpty?: () => React.ReactNode;
  
  /**
   * 加载状态渲染函数
   */
  renderLoading?: () => React.ReactNode;
  
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
  
  /**
   * 滚动回调
   */
  onScroll?: VirtualScrollCallback;
  
  /**
   * 滚动开始回调
   */
  onScrollStart?: () => void;
  
  /**
   * 滚动结束回调
   */
  onScrollEnd?: () => void;
  
  /**
   * 项目点击回调
   */
  onItemClick?: (item: T, index: number, event: React.MouseEvent) => void;
  
  /**
   * 到达底部回调（用于无限滚动）
   */
  onReachBottom?: () => void;
  
  /**
   * 到达底部的阈值（距离底部多少像素时触发）
   * @default 100
   */
  reachBottomThreshold?: number;
}

/**
 * VirtualList 组件引用接口
 */
export interface VirtualListRef {
  /**
   * 滚动到指定索引
   */
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void;
  
  /**
   * 滚动到指定位置
   */
  scrollToOffset: (offset: number) => void;
  
  /**
   * 获取项目位置信息
   */
  getItemPosition: (index: number) => VirtualItemPosition | null;
  
  /**
   * 更新项目高度
   */
  updateItemHeight: (index: number, height: number) => void;
  
  /**
   * 重新计算所有项目位置
   */
  recalculate: () => void;
  
  /**
   * 获取当前滚动状态
   */
  getScrollState: () => VirtualScrollState;
  
  /**
   * 获取容器元素
   */
  getContainer: () => HTMLDivElement | null;
}

/**
 * 默认空状态组件
 */
const DefaultEmpty = () => (
  <div className="QinComponents-virtual-list__empty">
    <div className="QinComponents-virtual-list__empty-icon">📄</div>
    <div className="QinComponents-virtual-list__empty-text">暂无数据</div>
  </div>
);

/**
 * 默认加载状态组件
 */
const DefaultLoading = () => (
  <div className="QinComponents-virtual-list__loading">
    <div className="QinComponents-virtual-list__loading-spinner"></div>
    <div className="QinComponents-virtual-list__loading-text">加载中...</div>
  </div>
);

/**
 * 虚拟滚动列表组件
 * 支持大量数据的高性能渲染，只渲染可视区域内的项目
 */
export const VirtualList = forwardRef<VirtualListRef, VirtualListProps>(
  <T,>({
    items,
    renderItem,
    config,
    getItemKey = (_item: T, index: number) => index,
    renderEmpty = DefaultEmpty,
    renderLoading = DefaultLoading,
    loading = false,
    className = '',
    style,
    onScroll,
    onScrollStart,
    onScrollEnd,
    onItemClick,
    onReachBottom,
    reachBottomThreshold = 100,
    'data-testid': testId,
  }: VirtualListProps<T>, ref: React.Ref<VirtualListRef>) => {
    const reachBottomTriggeredRef = useRef(false);
    
    // 到达底部检测
    const handleScroll = useCallback((scrollState: VirtualScrollState) => {
      onScroll?.(scrollState);
      
      // 检查是否到达底部
      if (onReachBottom) {
        const { scrollTop, totalHeight, containerHeight } = scrollState;
        const distanceToBottom = totalHeight - (scrollTop + containerHeight);
        
        if (distanceToBottom <= reachBottomThreshold && !reachBottomTriggeredRef.current) {
          reachBottomTriggeredRef.current = true;
          onReachBottom();
        } else if (distanceToBottom > reachBottomThreshold) {
          reachBottomTriggeredRef.current = false;
        }
      }
    }, [onScroll, onReachBottom, reachBottomThreshold]);
    
    // 使用虚拟滚动hook
    const {
      scrollState,
      visibleItems,
      containerRef,
      scrollToIndex,
      scrollToOffset,
      getItemPosition,
      updateItemHeight,
      recalculate,
    } = useVirtualList({
      items,
      config,
      onScroll: handleScroll,
      onScrollStart,
      onScrollEnd,
    });
    
    // 暴露组件方法
    useImperativeHandle(ref, () => ({
      scrollToIndex,
      scrollToOffset,
      getItemPosition,
      updateItemHeight,
      recalculate,
      getScrollState: () => scrollState,
      getContainer: () => containerRef.current,
    }), [
      scrollToIndex,
      scrollToOffset,
      getItemPosition,
      updateItemHeight,
      recalculate,
      scrollState,
    ]);
    
    // 项目点击处理
    const handleItemClick = useCallback((
      item: T,
      index: number,
      event: React.MouseEvent
    ) => {
      onItemClick?.(item, index, event);
    }, [onItemClick]);
    
    // 构建className
    const listClassName = [
      'QinComponents-virtual-list',
      config?.horizontal && 'QinComponents-virtual-list--horizontal',
      loading && 'QinComponents-virtual-list--loading',
      className,
    ].filter(Boolean).join(' ');
    
    // 容器样式
    const containerStyle: React.CSSProperties = {
      height: config?.height || 400,
      width: config?.width || '100%',
      ...style,
    };
    
    // 内容样式
    const contentStyle: React.CSSProperties = config?.horizontal
      ? {
          width: scrollState.totalHeight,
          height: '100%',
        }
      : {
          height: scrollState.totalHeight,
          width: '100%',
        };
    
    // 如果正在加载且没有数据，显示加载状态
    if (loading && items.length === 0) {
      return (
        <div
          className={listClassName}
          style={containerStyle}
          data-testid={testId}
        >
          {renderLoading()}
        </div>
      );
    }
    
    // 如果没有数据且不在加载中，显示空状态
    if (items.length === 0 && !loading) {
      return (
        <div
          className={listClassName}
          style={containerStyle}
          data-testid={testId}
        >
          {renderEmpty()}
        </div>
      );
    }
    
    return (
      <div
        ref={containerRef}
        className={listClassName}
        style={containerStyle}
        data-testid={testId}
      >
        <div
          className="QinComponents-virtual-list__content"
          style={contentStyle}
        >
          {visibleItems.map((item) => {
            const key = getItemKey(item.data, item.index);
            
            return (
              <div
                key={key}
                className={[
                  'QinComponents-virtual-list__item',
                  item.isVisible && 'QinComponents-virtual-list__item--visible',
                ].filter(Boolean).join(' ')}
                style={item.style}
                onClick={(event) => handleItemClick(item.data, item.index, event)}
              >
                {renderItem({
                  index: item.index,
                  data: item.data,
                  style: item.style,
                  isVisible: item.isVisible,
                })}
              </div>
            );
          })}
          
          {/* 加载状态（在列表底部） */}
          {loading && items.length > 0 && (
            <div className="QinComponents-virtual-list__bottom-loading">
              {renderLoading()}
            </div>
          )}
        </div>
      </div>
    );
  }
) as <T = any>(props: VirtualListProps<T> & { ref?: React.Ref<VirtualListRef> }) => React.ReactElement;

// 设置显示名称
(VirtualList as any).displayName = 'VirtualList';

export default VirtualList;
