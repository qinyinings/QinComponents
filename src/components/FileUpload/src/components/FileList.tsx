import React from 'react';
import type { UploadFileInfo } from '../../../../types/common';
import { FileItem } from './FileItem';

interface FileListProps {
  files: UploadFileInfo[];
  onRemove: (fileId: string) => void;
  onStart: (fileId: string) => void;
  onPause: (fileId: string) => void;
  onResume: (fileId: string) => void;
  onCancel: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  onClearCompleted: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemove,
  onStart,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onClearCompleted,
}) => {
  // 添加调试日志
  console.log('FileList 渲染', { 
    filesCount: files.length, 
    onPause: typeof onPause, 
    onCancel: typeof onCancel 
  });
  
  const completedCount = files.filter(file => file.status === 'completed').length;
  const hasCompleted = completedCount > 0;

  return (
    <div className="QinComponents-file-list">
      <div className="QinComponents-file-list__header">
        <span className="QinComponents-file-list__title">
          文件列表 ({files.length})
        </span>
        {hasCompleted && (
          <button
            className="QinComponents-file-list__clear-btn"
            onClick={onClearCompleted}
            type="button"
          >
            清除已完成 ({completedCount})
          </button>
        )}
      </div>
      
      <div className="QinComponents-file-list__items">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onRemove={() => onRemove(file.id)}
            onStart={() => onStart(file.id)}
            onPause={() => onPause(file.id)}
            onResume={() => onResume(file.id)}
            onCancel={() => onCancel(file.id)}
            onRetry={() => onRetry(file.id)}
          />
        ))}
      </div>
    </div>
  );
};
