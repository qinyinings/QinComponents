import { useState } from 'react'
import { Button, Card, Input, FileUpload } from './components'
import './App.css'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>
          QinComponents 组件库
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '32px' }}>
          基于 React + TypeScript + SCSS 构建的现代化组件库
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button 
            label="查看 Storybook 文档" 
            variant="primary"
            onClick={() => window.open('http://localhost:6006', '_blank')}
          />
          <Button 
            label="查看 GitHub" 
            variant="secondary"
            onClick={() => console.log('GitHub 链接')}
          />
        </div>
      </header>

      <main>
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '2rem' }}>组件展示</h2>
          
          <div style={{ display: 'grid', gap: '32px' }}>
            {/* Button 组件展示 */}
            <Card title="Button 按钮组件" bordered>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button label="主要按钮" variant="primary" onClick={() => setCount(count + 1)} />
                <Button label="次要按钮" variant="secondary" />
                <Button label="轮廓按钮" variant="outline" />
                <Button label="禁用状态" disabled />
                <Button label="小尺寸" size="small" />
                <Button label="大尺寸" size="large" />
              </div>
              <p style={{ marginTop: '16px', color: '#666' }}>
                点击次数: <strong>{count}</strong>
              </p>
            </Card>

            {/* Input 组件展示 */}
            <Card title="Input 输入框组件" bordered>
              <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
                <Input
                  placeholder="请输入内容"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  placeholder="禁用状态"
                  disabled
                />
                <Input
                  placeholder="请输入邮箱"
                  error="请输入有效的邮箱地址"
                />
              </div>
              <p style={{ marginTop: '16px', color: '#666' }}>
                当前输入值: <strong>{inputValue || '(空)'}</strong>
              </p>
            </Card>

            {/* Card 组件展示 */}
            <Card title="Card 卡片组件" bordered>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <Card 
                  title="基础卡片" 
                  bordered
                  footer={<Button label="操作按钮" size="small" />}
                >
                  这是一个基础的卡片内容示例，展示了标题、内容和底部操作区域。
                </Card>
                
                <Card 
                  title="带额外操作的卡片"
                  extra={<Button label="更多" variant="secondary" size="small" />}
                  bordered
                >
                  这个卡片展示了如何在标题区域添加额外的操作按钮。
                </Card>
                
                <Card bordered={false}>
                  这是一个无边框的卡片，适用于需要更简洁视觉效果的场景。
                </Card>
              </div>
            </Card>

            {/* FileUpload 组件展示 */}
            <Card title="FileUpload 大文件上传组件" bordered>
              <div style={{ maxWidth: '600px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>标准模式 (显示文件列表)</h4>
                <FileUpload
                  config={{
                    url: '/api/upload', // 这是一个示例URL，实际使用时需要配置真实的上传接口
                    chunkSize: 1024 * 1024 * 2, // 2MB分片
                    concurrent: 3, // 并发上传3个分片
                    maxRetries: 3, // 最多重试3次
                    enableResume: true, // 启用断点续传
                    enableHash: true, // 启用文件哈希
                    maxFileSize: 1024 * 1024 * 100, // 最大100MB
                    maxFiles: 5, // 最多5个文件
                    debug: true, // 启用调试模式
                  }}
                  multiple={true}
                  draggable={true}
                  showFileList={true}
                  onFileSelect={(files) => {
                    console.log('选择了文件:', files);
                  }}
                  onUploadStart={(fileInfo) => {
                    console.log('开始上传:', fileInfo.name);
                  }}
                  onUploadProgress={(fileInfo) => {
                    console.log('上传进度:', fileInfo.name, fileInfo.progress + '%');
                  }}
                  onUploadComplete={(fileInfo) => {
                    console.log('上传完成:', fileInfo.name);
                  }}
                  onUploadError={(fileInfo, error) => {
                    console.error('上传失败:', fileInfo.name, error);
                  }}
                  onAllComplete={(files) => {
                    console.log('所有文件上传完成:', files);
                  }}
                >
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                      点击选择文件或拖拽文件到此处
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      支持大文件上传、断点续传、分片重试
                    </div>
                  </div>
                </FileUpload>
                
                <h4 style={{ margin: '32px 0 16px 0', fontSize: '16px' }}>简洁模式 - 智能上传 (推荐)</h4>
                <FileUpload
                  config={{
                    url: '/api/upload', // 这是一个示例URL，实际使用时需要配置真实的上传接口
                    chunkSize: 1024 * 1024 * 2, // 2MB分片
                    concurrent: 3, // 并发上传3个分片
                    maxRetries: 3, // 最多重试3次
                    enableResume: true, // 启用断点续传
                    enableHash: true, // 启用文件哈希
                    maxFileSize: 1024 * 1024 * 100, // 最大100MB
                    maxFiles: 3, // 最多3个文件
                    debug: true, // 启用调试模式
                  }}
                  multiple={true}
                  draggable={true}
                  showFileList={false} // 不显示文件列表
                  autoUploadStrategy="smart" // 智能模式：有上传时等待，无上传时立即开始
                  onFileSelect={(files) => {
                    console.log('智能模式选择了文件:', files);
                  }}
                  onUploadStart={(fileInfo) => {
                    console.log('智能模式开始上传:', fileInfo.name);
                  }}
                  onUploadProgress={(fileInfo) => {
                    console.log('智能模式上传进度:', fileInfo.name, fileInfo.progress + '%');
                  }}
                  onUploadComplete={(fileInfo) => {
                    console.log('智能模式上传完成:', fileInfo.name);
                  }}
                  onUploadError={(fileInfo, error) => {
                    console.error('智能模式上传失败:', fileInfo.name, error);
                  }}
                  onAllComplete={(files) => {
                    console.log('智能模式所有文件上传完成:', files);
                  }}
                >
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                      智能上传模式
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      自动避免并发冲突，优化上传体验
                    </div>
                  </div>
                </FileUpload>
                
                <h4 style={{ margin: '32px 0 16px 0', fontSize: '16px' }}>队列模式 - 逐个上传</h4>
                <FileUpload
                  config={{
                    url: '/api/upload',
                    chunkSize: 1024 * 1024 * 2,
                    concurrent: 3,
                    maxRetries: 3,
                    enableResume: true,
                    enableHash: true,
                    maxFileSize: 1024 * 1024 * 100,
                    maxFiles: 3,
                    debug: true,
                  }}
                  multiple={true}
                  draggable={true}
                  showFileList={false}
                  autoUploadStrategy="queue" // 队列模式：一个文件完成后再上传下一个
                  onFileSelect={(files) => {
                    console.log('队列模式选择了文件:', files);
                  }}
                  onUploadStart={(fileInfo) => {
                    console.log('队列模式开始上传:', fileInfo.name);
                  }}
                  onUploadProgress={(fileInfo) => {
                    console.log('队列模式上传进度:', fileInfo.name, fileInfo.progress + '%');
                  }}
                  onUploadComplete={(fileInfo) => {
                    console.log('队列模式上传完成:', fileInfo.name);
                  }}
                  onUploadError={(fileInfo, error) => {
                    console.error('队列模式上传失败:', fileInfo.name, error);
                  }}
                  onAllComplete={(files) => {
                    console.log('队列模式所有文件上传完成:', files);
                  }}
                >
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                      队列上传模式
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      文件依次上传，避免网络拥塞
                    </div>
                  </div>
                </FileUpload>
                
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>功能特点：</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#666' }}>
                    <li>支持大文件分片上传（默认2MB分片）</li>
                    <li>支持断点续传，刷新页面后可继续上传</li>
                    <li>分片失败自动重试（最多3次）</li>
                    <li>并发上传多个分片提高效率</li>
                    <li>实时显示上传进度和速度</li>
                    <li>支持拖拽上传和多文件上传</li>
                    <li><strong>新功能：智能自动上传，避免并发冲突</strong></li>
                    <li><strong>新功能：队列上传模式，逐个处理文件</strong></li>
                    <li><strong>新功能：三种上传策略 (immediate/queue/smart)</strong></li>
                  </ul>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ff4d4f' }}>
                    注意：示例中的上传URL是模拟的，实际使用时需要配置真实的服务器接口。
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section>
          <Card title="开发信息" bordered>
            <div style={{ display: 'grid', gap: '12px' }}>
              <p><strong>开发服务器:</strong> http://localhost:5173</p>
              <p><strong>Storybook 文档:</strong> http://localhost:6006</p>
              <p><strong>技术栈:</strong> React 19 + TypeScript + Vite + SCSS</p>
              <p><strong>包管理器:</strong> pnpm</p>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default App
