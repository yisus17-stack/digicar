
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UploadStatus = 'uploading' | 'completed' | 'error';

export interface Upload {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
}

interface UploadContextType {
  uploads: Upload[];
  startUpload: (file: File) => string;
  updateUploadProgress: (id: string, progress: number) => void;
  completeUpload: (id: string) => void;
  errorUpload: (id: string) => void;
  removeUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

interface UploadProviderProps {
  children: ReactNode;
}

export const UploadProvider = ({ children }: UploadProviderProps) => {
  const [uploads, setUploads] = useState<Upload[]>([]);

  const startUpload = (file: File) => {
    const id = `upload_${Date.now()}_${Math.random()}`;
    const newUpload: Upload = {
      id,
      file,
      progress: 0,
      status: 'uploading',
    };
    setUploads((prev) => [...prev, newUpload]);
    return id;
  };

  const updateUploadProgress = (id: string, progress: number) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, progress } : upload
      )
    );
  };

  const completeUpload = (id: string) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, status: 'completed', progress: 100 } : upload
      )
    );
  };

  const errorUpload = (id: string) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, status: 'error' } : upload
      )
    );
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  };

  const value = {
    uploads,
    startUpload,
    updateUploadProgress,
    completeUpload,
    errorUpload,
    removeUpload,
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
};
