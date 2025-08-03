import { useState } from 'react'
import { Button, Card, Input } from './components'
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
