import React from 'react';
import type { DragEvent, ReactNode } from 'react';

interface UploadAreaProps {
  draggable: boolean;
  isDragOver: boolean;
  isUploading: boolean;
  children?: ReactNode;
  onDragEnter: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
  onSelectFiles: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  draggable,
  isDragOver,
  isUploading,
  children,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onSelectFiles,
}) => {
  const areaClassName = [
    'QinComponents-upload-area',
    isDragOver && 'QinComponents-upload-area--drag-over',
    isUploading && 'QinComponents-upload-area--uploading',
  ].filter(Boolean).join(' ');

  const dragProps = draggable ? {
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  } : {};

  return (
    <div
      className={areaClassName}
      onClick={onSelectFiles}
      {...dragProps}
    >
      {children || (
        <div className="QinComponents-upload-area__content">
          <div className="QinComponents-upload-area__icon">
            📁
          </div>
          <div className="QinComponents-upload-area__text">
            {isDragOver ? (
              <span className="QinComponents-upload-area__drag-text">
                松开鼠标上传文件
              </span>
            ) : (
              <>
                <span className="QinComponents-upload-area__main-text">
                  点击选择文件或拖拽文件到此处
                </span>
                <span className="QinComponents-upload-area__sub-text">
                  支持大文件上传，断点续传
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
