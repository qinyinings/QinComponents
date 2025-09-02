import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from '../src';
import type { FileUploadProps } from '../src';

// Mock server URL for stories
const MOCK_UPLOAD_URL = 'https://httpbin.org/post';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '一个功能强大的大文件上传组件，支持断点续传、分片失败重试、多文件上传等特性。',
      },
    },
  },
  argTypes: {
    config: {
      description: '上传配置对象',
      control: { type: 'object' },
    },
    multiple: {
      description: '是否支持多文件上传',
      control: { type: 'boolean' },
    },
    draggable: {
      description: '是否支持拖拽上传',
      control: { type: 'boolean' },
    },
    showFileList: {
      description: '是否显示文件列表',
      control: { type: 'boolean' },
    },
    onFileSelect: {
      description: '文件选择回调',
    },
    onUploadStart: {
      description: '上传开始回调',
    },
    onUploadProgress: {
      description: '上传进度回调',
    },
    onUploadComplete: {
      description: '上传完成回调',
    },
    onUploadError: {
      description: '上传错误回调',
    },
    onAllComplete: {
      description: '所有文件上传完成回调',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

// 基础配置
const baseConfig = {
  url: MOCK_UPLOAD_URL,
  chunkSize: 1024 * 1024 * 2, // 2MB
  concurrent: 3,
  maxRetries: 3,
  retryDelay: 1000,
  enableResume: true,
  enableHash: true,
};

// 基础故事
export const Default: Story = {
  args: {
    config: baseConfig,
    multiple: true,
    draggable: true,
    showFileList: true,
    onFileSelect: (files) => console.log('fileSelect', files),
    onUploadStart: (fileInfo) => console.log('uploadStart', fileInfo),
    onUploadProgress: (fileInfo) => console.log('uploadProgress', fileInfo),
    onUploadComplete: (fileInfo) => console.log('uploadComplete', fileInfo),
    onUploadError: (fileInfo, error) => console.log('uploadError', fileInfo, error),
    onAllComplete: (files) => console.log('allComplete', files),
  },
};

// 单文件上传
export const SingleFile: Story = {
  args: {
    ...Default.args,
    multiple: false,
  },
  parameters: {
    docs: {
      description: {
        story: '单文件上传模式，只允许选择一个文件。',
      },
    },
  },
};

// 禁用拖拽
export const NoDrag: Story = {
  args: {
    ...Default.args,
    draggable: false,
  },
  parameters: {
    docs: {
      description: {
        story: '禁用拖拽功能，只能通过点击选择文件。',
      },
    },
  },
};

// 不显示文件列表
export const NoFileList: Story = {
  args: {
    ...Default.args,
    showFileList: false,
  },
  parameters: {
    docs: {
      description: {
        story: '不显示文件列表，适用于简单的上传场景。',
      },
    },
  },
};

// 图片上传
export const ImageUpload: Story = {
  args: {
    ...Default.args,
    config: {
      ...baseConfig,
      accept: ['.jpg', '.jpeg', '.png', '.gif', '.webp', 'image/*'],
      maxFileSize: 1024 * 1024 * 10, // 10MB
      maxFiles: 5,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '专门用于图片上传，限制文件类型为图片格式，最大10MB，最多5个文件。',
      },
    },
  },
};

// 文档上传
export const DocumentUpload: Story = {
  args: {
    ...Default.args,
    config: {
      ...baseConfig,
      accept: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
      maxFileSize: 1024 * 1024 * 50, // 50MB
      maxFiles: 3,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '专门用于文档上传，支持PDF、Word等格式，最大50MB，最多3个文件。',
      },
    },
  },
};

// 小分片上传
export const SmallChunks: Story = {
  args: {
    ...Default.args,
    config: {
      ...baseConfig,
      chunkSize: 1024 * 512, // 512KB 小分片
      concurrent: 5, // 更多并发
    },
  },
  parameters: {
    docs: {
      description: {
        story: '使用较小的分片大小(512KB)和更多并发连接，适用于网络不稳定的环境。',
      },
    },
  },
};

// 大分片上传
export const LargeChunks: Story = {
  args: {
    ...Default.args,
    config: {
      ...baseConfig,
      chunkSize: 1024 * 1024 * 10, // 10MB 大分片
      concurrent: 1, // 单个并发
    },
  },
  parameters: {
    docs: {
      description: {
        story: '使用较大的分片大小(10MB)和单个并发连接，适用于网络稳定的环境。',
      },
    },
  },
};

// 自定义上传区域
export const CustomUploadArea: Story = {
  args: {
    ...Default.args,
    children: (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        border: '2px dashed #1890ff',
        borderRadius: '8px',
        backgroundColor: '#f0f8ff',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>☁️</div>
        <div style={{ fontSize: '18px', marginBottom: '8px', color: '#1890ff' }}>
          自定义上传区域
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          拖拽文件到这里或点击选择
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '使用自定义的上传区域内容，可以完全自定义样式和布局。',
      },
    },
  },
};

// 禁用断点续传
export const NoResume: Story = {
  args: {
    ...Default.args,
    config: {
      ...baseConfig,
      enableResume: false,
      enableHash: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '禁用断点续传功能，每次上传都从头开始。',
      },
    },
  },
};

// 高重试次数
export const HighRetry: Story = {
  args: {
    ...Default.args,
    config: {
      ...baseConfig,
      maxRetries: 10,
      retryDelay: 500,
    },
  },
  parameters: {
    docs: {
      description: {
        story: '设置高重试次数(10次)和短重试延迟(500ms)，适用于网络不稳定的环境。',
      },
    },
  },
};

// 带额外数据的上传
export const WithExtraData: Story = {
  args: {
    ...Default.args,
    config: {
      ...baseConfig,
      headers: {
        'Authorization': 'Bearer your-token-here',
        'X-Custom-Header': 'custom-value',
      },
      data: {
        userId: '12345',
        category: 'documents',
        tags: ['important', 'work'],
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: '上传时包含额外的请求头和表单数据，用于身份验证和分类。',
      },
    },
  },
};

// 演示所有回调
export const AllCallbacks: Story = {
  args: {
    ...Default.args,
    onFileSelect: (files) => {
      console.log('选择了文件:', files.map(f => f.name));
    },
    onUploadStart: (fileInfo) => {
      console.log('开始上传:', fileInfo.name);
    },
    onUploadProgress: (fileInfo) => {
      console.log(`${fileInfo.name} 进度: ${fileInfo.progress}%`);
    },
    onUploadComplete: (fileInfo) => {
      console.log('上传完成:', fileInfo.name);
    },
    onUploadError: (fileInfo, error) => {
      console.error('上传失败:', fileInfo.name, error);
    },
    onAllComplete: (files) => {
      console.log('所有文件上传完成:', files.length);
    },
  },
  parameters: {
    docs: {
      description: {
        story: '演示所有回调函数的使用，查看控制台和Actions面板查看详细信息。',
      },
    },
  },
};
