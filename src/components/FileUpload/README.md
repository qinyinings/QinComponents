# FileUpload 大文件上传组件

一个功能强大的大文件上传组件，支持断点续传、分片失败重试、多文件上传等特性。

## 功能特点

- ✅ **大文件分片上传**: 将大文件分割成小块进行上传，提高成功率
- ✅ **断点续传**: 支持网络中断后继续上传，无需重新开始
- ✅ **分片失败重试**: 单个分片失败时自动重试，最大化上传成功率
- ✅ **并发上传**: 支持多个分片并发上传，提高上传速度
- ✅ **实时进度**: 显示详细的上传进度、速度和剩余时间
- ✅ **拖拽上传**: 支持拖拽文件到上传区域
- ✅ **多文件支持**: 可同时上传多个文件
- ✅ **文件验证**: 支持文件类型和大小限制
- ✅ **响应式设计**: 适配移动端和桌面端
- ✅ **TypeScript**: 完整的类型定义支持

## 基本用法

```tsx
import { FileUpload } from 'QinComponents';

function App() {
  return (
    <FileUpload
      config={{
        url: '/api/upload',
        chunkSize: 1024 * 1024 * 2, // 2MB分片
        concurrent: 3, // 并发上传3个分片
        maxRetries: 3, // 最多重试3次
        enableResume: true, // 启用断点续传
        enableHash: true, // 启用文件哈希
      }}
      onUploadComplete={(fileInfo) => {
        console.log('上传完成:', fileInfo.name);
      }}
    />
  );
}
```

## API 参数

### FileUploadProps

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| config | `UploadConfig` | - | 上传配置（必需） |
| multiple | `boolean` | `true` | 是否支持多文件上传 |
| draggable | `boolean` | `true` | 是否支持拖拽上传 |
| showFileList | `boolean` | `true` | 是否显示文件列表 |
| autoUpload | `boolean` | `undefined` | 是否自动开始上传。当为 `undefined` 时，如果 `showFileList` 为 `false` 则自动为 `true` |
| autoUploadStrategy | `'immediate' \| 'queue' \| 'smart'` | `'smart'` | 自动上传策略 |
| children | `ReactNode` | - | 自定义上传区域内容 |
| onFileSelect | `(files: File[]) => void` | - | 文件选择回调 |
| onUploadStart | `(fileInfo: UploadFileInfo) => void` | - | 上传开始回调 |
| onUploadProgress | `(fileInfo: UploadFileInfo) => void` | - | 上传进度回调 |
| onUploadComplete | `(fileInfo: UploadFileInfo) => void` | - | 上传完成回调 |
| onUploadError | `(fileInfo: UploadFileInfo, error: string) => void` | - | 上传错误回调 |
| onAllComplete | `(files: UploadFileInfo[]) => void` | - | 所有文件上传完成回调 |

### UploadConfig

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| url | `string` | - | 上传URL（必需） |
| chunkSize | `number` | `2MB` | 分片大小（字节） |
| concurrent | `number` | `3` | 并发上传数 |
| maxRetries | `number` | `3` | 最大重试次数 |
| retryDelay | `number` | `1000` | 重试延迟（毫秒） |
| headers | `Record<string, string>` | - | 请求头 |
| data | `Record<string, any>` | - | 额外的表单数据 |
| enableResume | `boolean` | `true` | 是否启用断点续传 |
| enableHash | `boolean` | `true` | 是否计算文件哈希 |
| accept | `string[]` | - | 支持的文件类型 |
| maxFileSize | `number` | - | 最大文件大小（字节） |
| maxFiles | `number` | - | 最大文件数量 |

## 高级用法

### 简洁模式（自动上传）

当不需要显示文件列表时，可以设置 `showFileList={false}`，此时文件选择后会自动开始上传：

```tsx
<FileUpload
  config={config}
  showFileList={false} // 不显示文件列表，选择后自动上传
  onUploadComplete={(fileInfo) => {
    console.log('上传完成:', fileInfo.name);
  }}
>
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <h3>选择文件立即上传</h3>
    <p>不显示文件列表，选择后自动开始上传</p>
  </div>
</FileUpload>
```

你也可以明确控制自动上传行为：

```tsx
<FileUpload
  config={config}
  showFileList={true}  // 显示文件列表
  autoUpload={true}    // 但仍然自动上传
/>
```

### 上传策略控制

组件提供三种自动上传策略来处理并发上传问题：

#### 1. 智能模式 (smart) - 推荐

```tsx
<FileUpload
  config={config}
  autoUploadStrategy="smart" // 默认策略
  showFileList={false}
/>
```

- **行为**：如果当前有文件在上传，新选择的文件会等待；如果没有上传任务，立即开始上传
- **优点**：避免并发冲突，自动优化性能
- **适用场景**：大多数情况下的最佳选择

#### 2. 队列模式 (queue)

```tsx
<FileUpload
  config={config}
  autoUploadStrategy="queue"
  showFileList={false}
/>
```

- **行为**：文件严格按顺序逐个上传，一个完成后才开始下一个
- **优点**：避免网络拥塞，节省带宽
- **适用场景**：网络条件较差或需要严格控制带宽使用

#### 3. 立即模式 (immediate)

```tsx
<FileUpload
  config={config}
  autoUploadStrategy="immediate"
  showFileList={false}
/>
```

- **行为**：所有选择的文件立即开始上传（可能并发）
- **优点**：上传速度最快
- **适用场景**：网络条件良好且服务器支持高并发

### 自定义上传区域

```tsx
<FileUpload config={config}>
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <h3>拖拽文件到此处</h3>
    <p>或点击选择文件</p>
  </div>
</FileUpload>
```

### 文件类型限制

```tsx
<FileUpload
  config={{
    url: '/api/upload',
    accept: ['.jpg', '.jpeg', '.png', '.gif', 'image/*'],
    maxFileSize: 1024 * 1024 * 10, // 10MB
    maxFiles: 5,
  }}
/>
```

### 完整的事件处理

```tsx
<FileUpload
  config={config}
  onFileSelect={(files) => {
    console.log('选择了文件:', files.map(f => f.name));
  }}
  onUploadStart={(fileInfo) => {
    console.log(`开始上传: ${fileInfo.name}`);
  }}
  onUploadProgress={(fileInfo) => {
    console.log(`${fileInfo.name} 进度: ${fileInfo.progress}%`);
  }}
  onUploadComplete={(fileInfo) => {
    console.log(`上传完成: ${fileInfo.name}`);
  }}
  onUploadError={(fileInfo, error) => {
    console.error(`上传失败: ${fileInfo.name}`, error);
  }}
  onAllComplete={(files) => {
    console.log('所有文件上传完成:', files.length);
  }}
/>
```

## 服务端接口要求

组件需要服务端提供以下接口：

### 1. 分片上传接口

```
POST /api/upload
Content-Type: multipart/form-data

参数:
- chunk: 分片文件数据
- chunkIndex: 分片索引
- chunkSize: 分片大小
- chunkStart: 分片开始位置
- chunkEnd: 分片结束位置
- fileName: 文件名
- fileSize: 文件总大小
- fileType: 文件类型
- totalChunks: 总分片数
- fileHash: 文件哈希值（可选）
- chunkHash: 分片哈希值（可选）
```

### 2. 断点续传检查接口（可选）

```
POST /api/upload/check
Content-Type: application/json

{
  "fileHash": "文件哈希值",
  "chunkIndex": "分片索引"
}

响应:
{
  "exists": true/false
}
```

### 3. 文件合并接口（可选）

```
POST /api/upload/merge
Content-Type: application/json

{
  "fileName": "文件名",
  "fileSize": "文件大小",
  "fileType": "文件类型",
  "fileHash": "文件哈希值",
  "totalChunks": "总分片数"
}

响应:
{
  "success": true,
  "fileUrl": "文件访问URL"
}
```

### 4. 取消上传接口（可选）

```
POST /api/upload/cancel
Content-Type: application/json

{
  "fileHash": "文件哈希值"
}
```

## 样式定制

组件使用SCSS编写样式，支持CSS变量定制：

```scss
.QinComponents-file-upload {
  // 自定义上传区域样式
  .QinComponents-upload-area {
    border-color: #your-color;
    background-color: #your-bg-color;
  }
  
  // 自定义进度条样式
  .QinComponents-file-item__progress-fill {
    background-color: #your-progress-color;
  }
}
```

## 注意事项

1. **服务端支持**: 需要服务端实现对应的分片上传接口
2. **网络稳定性**: 在网络不稳定的环境下，建议调小分片大小
3. **浏览器兼容性**: 使用了现代Web API，需要现代浏览器支持
4. **内存占用**: 大文件上传时会占用一定内存，建议合理设置分片大小
5. **并发限制**: 过多的并发请求可能被服务器限制，建议根据实际情况调整

## 最佳实践

1. **分片大小**: 建议设置为1-5MB，根据网络环境调整
2. **并发数量**: 建议设置为2-5个，避免过多并发请求
3. **重试策略**: 建议设置3次重试，避免无限重试
4. **文件验证**: 在前端和后端都进行文件类型和大小验证
5. **用户体验**: 提供清晰的进度反馈和错误提示
