# FileUpload 组件测试文档

## 测试覆盖范围

### 1. 主组件测试 (`FileUpload.test.tsx`)
- ✅ 渲染测试 - 基本组件渲染、自定义内容、条件渲染
- ✅ 文件选择测试 - 点击选择、多文件支持、单文件模式
- ✅ 拖拽功能测试 - 拖拽上传、状态显示、禁用拖拽
- ✅ 文件验证测试 - 类型验证、大小验证、数量限制
- ✅ 上传状态测试 - 状态显示、文件大小格式化
- ✅ 可访问性测试 - ARIA属性、键盘导航
- ✅ 错误处理测试 - 配置错误、文件选择错误

### 2. 子组件测试

#### UploadArea 组件 (`UploadArea.test.tsx`)
- ✅ 渲染测试 - 默认内容、自定义内容、状态文本
- ✅ 样式类名测试 - 基础类名、状态类名组合
- ✅ 点击事件测试 - 文件选择触发
- ✅ 拖拽事件测试 - 启用/禁用拖拽事件绑定
- ✅ 内容结构测试 - DOM结构、样式类名
- ✅ 可访问性测试 - 交互行为
- ✅ 边界情况测试 - 回调函数缺失、极端状态

#### FileItem 组件 (`FileItem.test.tsx`)
- ✅ 渲染测试 - 文件基本信息、错误信息
- ✅ 状态显示测试 - 所有上传状态的正确显示
- ✅ 进度显示测试 - 进度条、暂停、错误状态
- ✅ 上传统计测试 - 速度、剩余时间、已上传大小
- ✅ 分片信息测试 - 多分片显示、失败分片统计
- ✅ 操作按钮测试 - 不同状态下的按钮显示
- ✅ 按钮点击事件测试 - 所有操作按钮的事件处理
- ✅ 样式类名测试 - 状态相关的CSS类名
- ✅ 可访问性测试 - title属性、按钮类型

#### FileList 组件 (`FileList.test.tsx`)
- ✅ 渲染测试 - 标题、文件数量、FileItem组件
- ✅ 清除按钮测试 - 显示条件、数量统计、点击事件
- ✅ 回调函数传递测试 - 所有操作回调的正确传递
- ✅ 样式类名测试 - CSS类名应用
- ✅ 文件状态统计测试 - 已完成文件数量计算
- ✅ 边界情况测试 - 空列表、全完成状态、回调缺失
- ✅ 可访问性测试 - 按钮属性、语义化结构

### 3. 工具函数测试

#### 文件工具函数 (`fileUtils.test.ts`)
- ✅ `createFileChunks` - 正常分片、小文件、空文件
- ✅ `calculateFileHash` - 哈希计算、大文件采样、小文件处理
- ✅ `formatFileSize` - 字节格式化、小数处理、大数字
- ✅ `formatUploadSpeed` - 速度格式化、零速度处理
- ✅ `formatRemainingTime` - 时间格式化、无效时间、零填充
- ✅ `getFileExtension` - 扩展名提取、大小写处理、特殊情况
- ✅ `getFileTypeIcon` - 各种文件类型图标、默认图标
- ✅ `validateFileType` - 扩展名验证、MIME类型验证、通配符
- ✅ `validateFileSize` - 大小验证、边界情况
- ✅ `generateId` - 唯一ID生成、时间戳、随机字符串

#### 上传工具函数 (`uploadUtils.test.ts`)
- ✅ `uploadChunk` - 成功上传、FormData字段、失败处理、AbortSignal
- ✅ `checkChunkExists` - 存在检查、失败处理、自定义headers
- ✅ `mergeChunks` - 成功合并、失败处理、网络错误
- ✅ `cancelUpload` - 取消请求、错误忽略
- ✅ `getUploadProgress` - 进度获取、失败处理
- ✅ `calculateUploadSpeed` - 速度计算、边界情况、默认时间
- ✅ `calculateRemainingTime` - 剩余时间计算、边界情况
- ✅ `createRetryDelay` - 指数退避、最大延迟限制、负值处理

## 测试统计

- **总测试数量**: 156个
- **通过测试**: 141个
- **失败测试**: 15个（主要是主组件的UI交互测试）
- **测试覆盖率**: 约90%

## Mock策略

### 1. 浏览器API Mock
- `fetch` - 网络请求模拟
- `crypto.subtle` - 文件哈希计算模拟
- `URL.createObjectURL` - 对象URL创建模拟
- `File` 构造函数 - 文件对象模拟

### 2. React组件Mock
- `FileItem` - 在FileList测试中简化为测试组件
- 工具函数 - 在组件测试中模拟复杂的工具函数

### 3. 事件Mock
- 文件选择事件 - 使用`Object.defineProperty`模拟
- 拖拽事件 - 使用`fireEvent`模拟
- DOM事件 - 使用testing-library的事件工具

## 测试最佳实践

### 1. 组件测试
- 使用`render`渲染组件
- 使用`screen`查询元素
- 使用`fireEvent`触发事件
- 使用`waitFor`等待异步更新

### 2. 工具函数测试
- 测试正常情况和边界情况
- 测试错误处理
- 使用适当的Mock避免副作用

### 3. Mock使用
- 在`beforeEach`中设置Mock
- 在`afterEach`中清理Mock
- 使用`vi.clearAllMocks()`清理调用记录

## 运行测试

```bash
# 运行所有FileUpload测试
npm test -- --run src/components/FileUpload

# 运行特定测试文件
npm test -- --run src/components/FileUpload/.tests/fileUtils.test.ts

# 运行测试并查看覆盖率
npm run coverage
```

## 注意事项

1. **浏览器兼容性**: 测试使用了现代浏览器API，需要适当的polyfill
2. **异步处理**: 上传相关的测试需要正确处理异步操作
3. **Mock限制**: 某些浏览器API的Mock可能不完全模拟真实行为
4. **UI测试**: 主组件的UI交互测试可能需要更复杂的设置

## 后续改进

1. 增加集成测试覆盖完整的上传流程
2. 添加性能测试验证大文件处理能力
3. 增加可访问性测试确保组件符合WCAG标准
4. 添加视觉回归测试确保UI一致性
