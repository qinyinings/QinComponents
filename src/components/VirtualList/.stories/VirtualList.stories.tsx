import React, { useRef, useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VirtualList } from '../src';
import type { VirtualListProps, VirtualListRef } from '../src';

// 生成测试数据的工具函数
const generateItems = (count: number, prefix: string = 'Item') => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `${prefix} ${i}`,
    description: `Description for ${prefix.toLowerCase()} ${i}`,
    value: Math.random() * 100,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
    category: ['工作', '生活', '学习', '娱乐'][i % 4],
    priority: ['高', '中', '低'][i % 3],
    content: i % 3 === 0 
      ? '短内容' 
      : i % 3 === 1 
      ? '中等长度的内容，包含更多的文字信息，用于测试动态高度计算功能'
      : '非常长的内容，包含大量的文字信息，用于测试虚拟滚动组件的动态高度计算功能。这段文字会占用更多的垂直空间，帮助我们验证组件在处理不同高度项目时的表现。',
  }));
};

const meta: Meta<typeof VirtualList> = {
  title: 'Components/VirtualList',
  component: VirtualList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '一个高性能的虚拟滚动列表组件，支持大量数据的流畅渲染。只渲染可视区域内的项目，大幅提升性能。',
      },
    },
  },
  argTypes: {
    items: {
      description: '数据列表',
      control: { type: 'object' },
    },
    renderItem: {
      description: '项目渲染函数',
    },
    config: {
      description: '虚拟滚动配置对象',
      control: { type: 'object' },
    },
    getItemKey: {
      description: '获取项目唯一标识的函数',
    },
    loading: {
      description: '是否显示加载状态',
      control: { type: 'boolean' },
    },
    onScroll: {
      description: '滚动回调',
    },
    onScrollStart: {
      description: '滚动开始回调',
    },
    onScrollEnd: {
      description: '滚动结束回调',
    },
    onItemClick: {
      description: '项目点击回调',
    },
    onReachBottom: {
      description: '到达底部回调',
    },
    reachBottomThreshold: {
      description: '到达底部阈值',
      control: { type: 'number' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VirtualList>;

// 基础配置
const baseConfig = {
  height: 400,
  itemHeight: 60,
  overscan: 5,
};

// 基础渲染函数
const basicRenderItem = ({ index, data }: any) => (
  <div style={{ 
    padding: '15px', 
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 80%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: '#333',
    }}>
      {index}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{data.name}</h4>
      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{data.description}</p>
    </div>
    <div style={{ fontSize: '12px', color: '#999' }}>
      {data.value.toFixed(1)}
    </div>
  </div>
);

// 基础故事
export const Default: Story = {
  args: {
    items: generateItems(1000),
    config: baseConfig,
    renderItem: basicRenderItem,
    onScroll: (state) => console.log('scroll', state),
    onScrollStart: () => console.log('scroll start'),
    onScrollEnd: () => console.log('scroll end'),
    onItemClick: (item, index) => console.log('item click', item, index),
  },
};

// 大数据量测试
export const LargeDataset: Story = {
  args: {
    ...Default.args,
    items: generateItems(100000, 'BigData'),
  },
  parameters: {
    docs: {
      description: {
        story: '10万条数据的大数据量测试，验证虚拟滚动的性能表现。',
      },
    },
  },
};

// 动态高度
export const DynamicHeight: Story = {
  args: {
    items: generateItems(500),
    config: {
      height: 400,
      itemHeight: (index: number, data: any) => {
        const baseHeight = 60;
        const contentLines = Math.ceil(data.content.length / 50);
        return baseHeight + (contentLines - 1) * 20;
      },
      estimatedItemHeight: 80,
      overscan: 3,
    },
    renderItem: ({ index, data }: any) => (
      <div style={{ 
        padding: '15px', 
        borderBottom: '1px solid #eee',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 80%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            {index}
          </div>
          <h4 style={{ margin: 0, fontSize: '14px' }}>{data.name}</h4>
          <span style={{ 
            padding: '2px 6px', 
            borderRadius: '4px', 
            fontSize: '10px', 
            backgroundColor: '#f0f0f0',
            color: '#666',
          }}>
            {data.category}
          </span>
        </div>
        <p style={{ 
          margin: 0, 
          fontSize: '12px', 
          color: '#666', 
          lineHeight: '1.4',
        }}>
          {data.content}
        </p>
      </div>
    ),
    onItemClick: (item, index) => console.log('dynamic item click', item, index),
  },
  parameters: {
    docs: {
      description: {
        story: '动态高度模式，根据内容长度自动计算项目高度。',
      },
    },
  },
};

// 水平滚动
export const HorizontalScroll: Story = {
  args: {
    items: generateItems(200, 'Card'),
    config: {
      height: 200,
      width: 800,
      itemHeight: 180, // 水平模式下表示宽度
      horizontal: true,
      overscan: 10, // 增加缓冲区以支持快速滚动
      scrollThreshold: 3, // 降低滚动阈值提高响应性
    },
    onScroll: (state) => {
      // 详细调试信息
      console.log('Scroll State:', {
        scrollLeft: state.scrollTop, // 在水平模式下这是scrollLeft
        range: state.range,
        visibleItems: state.range.endIndex - state.range.startIndex + 1,
        isScrolling: state.isScrolling,
        totalHeight: state.totalHeight,
        containerHeight: state.containerHeight,
        itemPositionsLength: state.itemPositions.length,
        // 检查是否有异常的重置
        isReset: state.scrollTop === 0 && state.range.startIndex === 0,
      });
      
      // 如果检测到异常重置，输出警告
      if (state.scrollTop === 0 && state.range.startIndex === 0 && state.isScrolling) {
        console.warn('检测到可能的状态重置！');
      }
    },
    renderItem: ({ index, data }: any) => (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 90%)`,
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 70%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '8px',
        }}>
          {index}
        </div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{data.name}</h4>
        <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>{data.category}</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '水平滚动模式，适用于卡片列表等横向布局场景。',
      },
    },
  },
};

// 无限滚动
export const InfiniteScroll: Story = {
  render: () => {
    const [items, setItems] = useState(generateItems(50, 'Initial'));
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
      if (loading) return;
      
      setLoading(true);
      console.log('Loading more items...');
      
      // 模拟异步加载
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItems = generateItems(20, `Batch${Math.floor(items.length / 20)}`);
      setItems(prev => [...prev, ...newItems.map(item => ({ ...item, id: prev.length + item.id }))]);
      setLoading(false);
    }, [items.length, loading]);

    return (
      <VirtualList
        items={items}
        loading={loading}
        config={baseConfig}
        renderItem={basicRenderItem}
        onReachBottom={loadMore}
        reachBottomThreshold={100}
        onItemClick={(item, index) => console.log('infinite scroll item click', item, index)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: '无限滚动示例，滚动到底部时自动加载更多数据。',
      },
    },
  },
};

// 滚动控制
export const ScrollControl: Story = {
  render: () => {
    const listRef = useRef<VirtualListRef>(null);
    const [targetIndex, setTargetIndex] = useState('');
    const items = generateItems(1000);

    const scrollToIndex = () => {
      const index = parseInt(targetIndex);
      if (!isNaN(index) && index >= 0 && index < items.length) {
        listRef.current?.scrollToIndex(index, 'center');
      }
    };

    const scrollToTop = () => {
      listRef.current?.scrollToIndex(0);
    };

    const scrollToMiddle = () => {
      listRef.current?.scrollToIndex(Math.floor(items.length / 2), 'center');
    };

    const scrollToBottom = () => {
      listRef.current?.scrollToIndex(items.length - 1);
    };

    return (
      <div>
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <input
            type="number"
            value={targetIndex}
            onChange={(e) => setTargetIndex(e.target.value)}
            placeholder="输入索引 (0-999)"
            style={{ 
              padding: '4px 8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              width: '150px',
            }}
          />
          <button onClick={scrollToIndex} style={{ padding: '4px 12px' }}>
            滚动到指定位置
          </button>
          <button onClick={scrollToTop} style={{ padding: '4px 12px' }}>
            顶部
          </button>
          <button onClick={scrollToMiddle} style={{ padding: '4px 12px' }}>
            中间
          </button>
          <button onClick={scrollToBottom} style={{ padding: '4px 12px' }}>
            底部
          </button>
        </div>
        
        <VirtualList
          ref={listRef}
          items={items}
          config={baseConfig}
          renderItem={basicRenderItem}
          onItemClick={(item, index) => console.log('scroll control item click', item, index)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '滚动控制示例，可以通过按钮或输入索引来控制滚动位置。',
      },
    },
  },
};

// 空状态
export const EmptyState: Story = {
  args: {
    items: [],
    config: baseConfig,
    renderItem: basicRenderItem,
    renderEmpty: () => (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#999',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>暂无数据</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>请添加一些数据后再查看</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '空状态显示，当没有数据时显示自定义的空状态内容。',
      },
    },
  },
};

// 加载状态··
export const LoadingState: Story = {
  args: {
    items: [],
    loading: true,
    config: baseConfig,
    renderItem: basicRenderItem,
    renderLoading: () => (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#666',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <h3 style={{ margin: '0 0 8px 0' }}>加载中...</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>正在获取数据，请稍候</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '加载状态显示，当数据正在加载时显示自定义的加载状态内容。',
      },
    },
  },
};

// 小尺寸列表
export const SmallSize: Story = {
  args: {
    items: generateItems(200),
    config: {
      height: 200,
      itemHeight: 30,
      overscan: 10,
    },
    renderItem: ({ index, data }: any) => (
      <div style={{ 
        padding: '6px 12px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
      }}>
        <span style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 80%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
        }}>
          {index}
        </span>
        <span style={{ flex: 1 }}>{data.name}</span>
        <span style={{ color: '#999' }}>{data.category}</span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '小尺寸列表，适用于紧凑的界面布局。',
      },
    },
  },
};

// 复杂项目
export const ComplexItems: Story = {
  args: {
    items: generateItems(300),
    config: {
      height: 400,
      itemHeight: 120,
      overscan: 3,
    },
    renderItem: ({ index, data }: any) => (
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #eee',
        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 80%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '18px',
          }}>
            {index}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '16px' }}>{data.name}</h4>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '10px', 
                backgroundColor: data.priority === '高' ? '#ff4d4f' : data.priority === '中' ? '#faad14' : '#52c41a',
                color: 'white',
              }}>
                {data.priority}
              </span>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '10px', 
                backgroundColor: '#f0f0f0',
                color: '#666',
              }}>
                {data.category}
              </span>
            </div>
            <p style={{ 
              margin: '0 0 8px 0', 
              fontSize: '13px', 
              color: '#666', 
              lineHeight: '1.4',
            }}>
              {data.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {new Date(data.timestamp).toLocaleDateString()}
              </span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: data.value > 50 ? '#52c41a' : '#faad14',
              }}>
                {data.value.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '复杂项目示例，包含多种元素和样式的复杂列表项。',
      },
    },
  },
};

// 禁用虚拟化
export const DisabledVirtualization: Story = {
  args: {
    items: generateItems(100), // 较少的数据量
    config: {
      height: 400,
      itemHeight: 60,
      enabled: false, // 禁用虚拟化
    },
    renderItem: basicRenderItem,
  },
  parameters: {
    docs: {
      description: {
        story: '禁用虚拟化模式，所有项目都会被渲染。适用于数据量较少的场景。',
      },
    },
  },
};

// 高性能水平滚动
export const HighPerformanceHorizontal: Story = {
  args: {
    items: generateItems(1000, 'FastCard'),
    config: {
      height: 200,
      width: 800,
      itemHeight: 150,
      horizontal: true,
      overscan: 15, // 更大的缓冲区
      scrollThreshold: 3, // 适中的滚动阈值
      smoothScroll: false, // 禁用平滑滚动提升性能
    },
    renderItem: ({ index, data }: any) => (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: `hsl(${(index * 137.5) % 360}, 60%, 85%)`,
        border: '1px solid #ccc',
        borderRadius: '6px',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: '12px',
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: `hsl(${(index * 137.5) % 360}, 60%, 70%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '6px',
          fontSize: '10px',
        }}>
          {index}
        </div>
        <div style={{ fontWeight: '500' }}>{data.name}</div>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
          {data.category}
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '高性能水平滚动示例，优化了快速滚动时的性能，支持1000个项目的流畅滚动。',
      },
    },
  },
};
