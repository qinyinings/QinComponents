# VirtualList 组件测试指南

## 测试用例

### 1. 基础功能测试

```tsx
// 测试基本渲染
const basicData = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  value: Math.random() * 100,
}));

<VirtualList
  items={basicData}
  config={{ height: 400, itemHeight: 50 }}
  renderItem={({ index, data }) => (
    <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
      #{index}: {data.name} - {data.value.toFixed(2)}
    </div>
  )}
/>
```

### 2. 动态高度测试

```tsx
// 测试动态高度计算
const dynamicData = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  title: `Title ${i}`,
  content: i % 3 === 0 
    ? 'Short content' 
    : i % 3 === 1 
    ? 'Medium length content that spans multiple lines and contains more text'
    : 'Very long content that definitely spans multiple lines and contains a lot of text to test the dynamic height calculation feature of the virtual list component',
}));

<VirtualList
  items={dynamicData}
  config={{
    height: 400,
    itemHeight: (index, data) => {
      const baseHeight = 40;
      const contentLines = Math.ceil(data.content.length / 50);
      return baseHeight + (contentLines - 1) * 20;
    },
    estimatedItemHeight: 60,
  }}
  renderItem={({ index, data }) => (
    <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
      <h4 style={{ margin: '0 0 8px 0' }}>{data.title}</h4>
      <p style={{ margin: 0, lineHeight: '1.4' }}>{data.content}</p>
    </div>
  )}
/>
```

### 3. 无限滚动测试

```tsx
function InfiniteScrollTest() {
  const [items, setItems] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      name: `Initial Item ${i}`,
    }))
  );
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newItems = Array.from({ length: 20 }, (_, i) => ({
      id: items.length + i,
      name: `Loaded Item ${items.length + i}`,
    }));
    
    setItems(prev => [...prev, ...newItems]);
    setLoading(false);
  }, [items.length, loading]);

  return (
    <VirtualList
      items={items}
      loading={loading}
      config={{ height: 400, itemHeight: 50 }}
      onReachBottom={loadMore}
      reachBottomThreshold={100}
      renderItem={({ index, data }) => (
        <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
          {data.name}
        </div>
      )}
    />
  );
}
```

### 4. 滚动控制测试

```tsx
function ScrollControlTest() {
  const listRef = useRef<VirtualListRef>(null);
  const [targetIndex, setTargetIndex] = useState('');

  const scrollToIndex = () => {
    const index = parseInt(targetIndex);
    if (!isNaN(index)) {
      listRef.current?.scrollToIndex(index, 'center');
    }
  };

  const scrollToTop = () => {
    listRef.current?.scrollToIndex(0);
  };

  const scrollToBottom = () => {
    listRef.current?.scrollToIndex(testData.length - 1);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="number"
          value={targetIndex}
          onChange={(e) => setTargetIndex(e.target.value)}
          placeholder="输入索引"
        />
        <button onClick={scrollToIndex}>滚动到指定位置</button>
        <button onClick={scrollToTop}>滚动到顶部</button>
        <button onClick={scrollToBottom}>滚动到底部</button>
      </div>
      
      <VirtualList
        ref={listRef}
        items={testData}
        config={{ height: 400, itemHeight: 50 }}
        renderItem={({ index, data }) => (
          <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            #{index}: {data.name}
          </div>
        )}
      />
    </div>
  );
}
```

### 5. 水平滚动测试

```tsx
const horizontalData = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `Card ${i}`,
  color: `hsl(${(i * 137.5) % 360}, 70%, 80%)`,
}));

<VirtualList
  items={horizontalData}
  config={{
    height: 200,
    width: 800,
    itemHeight: 150, // 在水平模式下表示宽度
    horizontal: true,
  }}
  renderItem={({ index, data }) => (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: data.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
      }}
    >
      {data.name}
    </div>
  )}
/>
```

### 6. 性能测试

```tsx
// 大数据量测试
const largeData = Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  description: `Description for item ${i}`,
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
}));

function PerformanceTest() {
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const timer = setTimeout(() => {
      const end = performance.now();
      setRenderTime(end - start);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <p>渲染时间: {renderTime.toFixed(2)}ms</p>
      <p>数据量: {largeData.length.toLocaleString()} 项</p>
      
      <VirtualList
        items={largeData}
        config={{ height: 400, itemHeight: 60 }}
        renderItem={({ index, data }) => (
          <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 'bold' }}>{data.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {data.description}
            </div>
            <div style={{ fontSize: '10px', color: '#999' }}>
              {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      />
    </div>
  );
}
```

### 7. 空状态和加载状态测试

```tsx
// 空状态测试
<VirtualList
  items={[]}
  config={{ height: 400, itemHeight: 50 }}
  renderItem={() => null}
  renderEmpty={() => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h3>自定义空状态</h3>
      <p>没有找到任何数据</p>
    </div>
  )}
/>

// 加载状态测试
<VirtualList
  items={[]}
  loading={true}
  config={{ height: 400, itemHeight: 50 }}
  renderItem={() => null}
  renderLoading={() => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <div>自定义加载状态...</div>
    </div>
  )}
/>
```

## 测试检查点

### 功能性测试
- [ ] 基本列表渲染正常
- [ ] 滚动流畅，无卡顿
- [ ] 动态高度计算正确
- [ ] 滚动到指定位置功能正常
- [ ] 无限滚动触发正确
- [ ] 水平滚动模式正常
- [ ] 空状态显示正确
- [ ] 加载状态显示正确

### 性能测试
- [ ] 大数据量（10万+）渲染流畅
- [ ] 内存使用稳定，无内存泄漏
- [ ] 滚动帧率保持在 60fps
- [ ] 初始渲染时间合理（< 100ms）

### 交互测试
- [ ] 鼠标滚轮滚动正常
- [ ] 触摸滚动正常（移动设备）
- [ ] 键盘导航正常
- [ ] 项目点击事件正常

### 边界测试
- [ ] 空数据处理正确
- [ ] 单项数据处理正确
- [ ] 极大高度项目处理正确
- [ ] 容器大小变化适应正常

### 兼容性测试
- [ ] 现代浏览器兼容性良好
- [ ] 移动端适配正常
- [ ] 暗色主题显示正常
- [ ] 打印样式正确
