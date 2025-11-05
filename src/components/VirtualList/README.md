# VirtualList 虚拟滚动列表组件

一个高性能的虚拟滚动列表组件，支持大量数据的流畅渲染。只渲染可视区域内的项目，大幅提升性能。

## 特性

- 🚀 **高性能**: 只渲染可视区域内的项目，支持百万级数据
- 📱 **响应式**: 支持动态高度和容器大小变化
- 🎯 **精确滚动**: 支持滚动到指定索引或位置
- 🔄 **无限滚动**: 内置到达底部检测，支持无限滚动
- 🎨 **自定义渲染**: 灵活的项目渲染函数
- 📐 **动态高度**: 支持固定高度和动态高度计算
- 🌊 **平滑滚动**: 支持平滑滚动动画
- 🎭 **状态管理**: 内置加载和空状态处理
- ♿ **无障碍**: 支持键盘导航和屏幕阅读器
- 🌙 **主题支持**: 支持亮色和暗色主题

## 基础用法

```tsx
import { VirtualList } from '@qin/components';

const data = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  description: `Description for item ${i}`,
}));

function App() {
  return (
    <VirtualList
      items={data}
      config={{
        height: 400,
        itemHeight: 60,
      }}
      renderItem={({ index, data }) => (
        <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
          <h4>{data.name}</h4>
          <p>{data.description}</p>
        </div>
      )}
    />
  );
}
```

## 动态高度

```tsx
<VirtualList
  items={data}
  config={{
    height: 400,
    itemHeight: (index, data) => {
      // 根据内容动态计算高度
      return data.description.length > 50 ? 80 : 60;
    },
    estimatedItemHeight: 60, // 预估高度
  }}
  renderItem={({ index, data }) => (
    <div style={{ padding: '10px' }}>
      <h4>{data.name}</h4>
      <p>{data.description}</p>
    </div>
  )}
/>
```

## 无限滚动

```tsx
function InfiniteList() {
  const [items, setItems] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const newItems = await fetchMoreData();
    setItems(prev => [...prev, ...newItems]);
    setLoading(false);
  };

  return (
    <VirtualList
      items={items}
      loading={loading}
      config={{ height: 400, itemHeight: 60 }}
      onReachBottom={loadMore}
      reachBottomThreshold={100}
      renderItem={({ index, data }) => (
        <div>{data.name}</div>
      )}
    />
  );
}
```

## 滚动控制

```tsx
function ScrollControlExample() {
  const listRef = useRef<VirtualListRef>(null);

  const scrollToTop = () => {
    listRef.current?.scrollToIndex(0);
  };

  const scrollToMiddle = () => {
    listRef.current?.scrollToIndex(Math.floor(data.length / 2), 'center');
  };

  return (
    <div>
      <button onClick={scrollToTop}>滚动到顶部</button>
      <button onClick={scrollToMiddle}>滚动到中间</button>
      
      <VirtualList
        ref={listRef}
        items={data}
        config={{ height: 400, itemHeight: 60 }}
        renderItem={({ index, data }) => (
          <div>{data.name}</div>
        )}
      />
    </div>
  );
}
```

## 水平滚动

```tsx
<VirtualList
  items={data}
  config={{
    height: 200,
    width: 800,
    itemHeight: 150, // 水平模式下表示项目宽度
    horizontal: true,
  }}
  renderItem={({ index, data }) => (
    <div style={{ padding: '10px', width: '100%' }}>
      <h4>{data.name}</h4>
    </div>
  )}
/>
```

## API 参考

### VirtualListProps

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| items | T[] | - | 数据列表 |
| renderItem | VirtualItemRenderer<T> | - | 项目渲染函数 |
| config | VirtualListConfig | - | 虚拟滚动配置 |
| getItemKey | (item: T, index: number) => string \| number | (item, index) => index | 获取项目唯一标识 |
| renderEmpty | () => ReactNode | - | 空状态渲染函数 |
| renderLoading | () => ReactNode | - | 加载状态渲染函数 |
| loading | boolean | false | 是否显示加载状态 |
| onScroll | VirtualScrollCallback | - | 滚动回调 |
| onScrollStart | () => void | - | 滚动开始回调 |
| onScrollEnd | () => void | - | 滚动结束回调 |
| onItemClick | (item: T, index: number, event: MouseEvent) => void | - | 项目点击回调 |
| onReachBottom | () => void | - | 到达底部回调 |
| reachBottomThreshold | number | 100 | 到达底部阈值 |

### VirtualListConfig

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| itemHeight | number \| ((index: number, data: any) => number) | 50 | 项目高度 |
| overscan | number | 5 | 缓冲区大小 |
| enabled | boolean | true | 是否启用虚拟化 |
| height | number \| string | 400 | 容器高度 |
| width | number \| string | '100%' | 容器宽度 |
| horizontal | boolean | false | 是否水平滚动 |
| scrollThreshold | number | 1 | 滚动阈值 |
| smoothScroll | boolean | true | 是否平滑滚动 |
| estimatedItemHeight | number | 50 | 预估项目高度 |

### VirtualListRef

| 方法 | 类型 | 描述 |
|------|------|------|
| scrollToIndex | (index: number, align?: 'start' \| 'center' \| 'end' \| 'auto') => void | 滚动到指定索引 |
| scrollToOffset | (offset: number) => void | 滚动到指定位置 |
| getItemPosition | (index: number) => VirtualItemPosition \| null | 获取项目位置信息 |
| updateItemHeight | (index: number, height: number) => void | 更新项目高度 |
| recalculate | () => void | 重新计算位置 |
| getScrollState | () => VirtualScrollState | 获取滚动状态 |
| getContainer | () => HTMLDivElement \| null | 获取容器元素 |

## 性能优化建议

1. **使用稳定的 key**: 确保 `getItemKey` 返回稳定的唯一标识
2. **避免内联函数**: 将渲染函数提取到组件外部或使用 `useCallback`
3. **合理设置缓冲区**: `overscan` 值不宜过大，通常 5-10 即可
4. **预估高度**: 为动态高度提供准确的 `estimatedItemHeight`
5. **避免频繁更新**: 批量更新数据而不是逐个添加

## 注意事项

- 项目高度变化时会自动重新计算位置
- 水平滚动模式下，`itemHeight` 表示项目宽度
- 动态高度模式下性能会略有下降
- 建议为大数据集启用虚拟化（enabled: true）
