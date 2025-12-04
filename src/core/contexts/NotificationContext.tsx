
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'upload' | 'status';
export type NotificationStatus = 'uploading' | 'completed' | 'error' | 'success' | 'loading';

export interface BaseNotification {
  id: string;
  status: NotificationStatus;
  title: string;
  type: NotificationType;
  onRemove?: () => void;
}

export interface UploadNotification extends BaseNotification {
  type: 'upload';
  file: File;
  progress: number;
}

export interface StatusNotification extends BaseNotification {
  type: 'status';
}

export type NotificationItem = UploadNotification | StatusNotification;

interface NotificationContextType {
  notifications: NotificationItem[];
  startUpload: (file: File) => string;
  updateUploadProgress: (id: string, progress: number) => void;
  completeUpload: (id: string, newTitle?: string) => void;
  errorUpload: (id: string, newTitle?: string) => void;
  showNotification: (options: { title: string; status: 'success' | 'error' | 'loading' }) => string;
  updateNotificationStatus: (id:string, status: NotificationStatus, newTitle?: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within an NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const startUpload = (file: File) => {
    const id = `upload_${Date.now()}_${Math.random()}`;
    const newUpload: UploadNotification = {
      id,
      file,
      progress: 0,
      status: 'uploading',
      type: 'upload',
      title: `Subiendo ${file.name}`,
    };
    setNotifications((prev) => [newUpload, ...prev]);
    return id;
  };
  
  const updateNotificationStatus = (id: string, status: NotificationStatus, newTitle?: string) => {
    setNotifications(prev => prev.map(n => {
        if (n.id === id) {
            const updated = {...n, status};
            if (newTitle) updated.title = newTitle;
            if (status === 'completed' || status === 'success' || status === 'error') {
              setTimeout(() => removeNotification(id), 5000);
            }
            return updated;
        }
        return n;
    }));
  };
  

  const showNotification = (options: { title: string; status: 'success' | 'error' | 'loading' }) => {
    const id = `status_${Date.now()}_${Math.random()}`;
    const newNotification: StatusNotification = {
      id,
      title: options.title,
      status: options.status,
      type: 'status',
    };
    setNotifications((prev) => [newNotification, ...prev]);
    
    if (options.status === 'success' || options.status === 'error') {
      setTimeout(() => removeNotification(id), 5000);
    }
    
    return id;
  };


  const updateUploadProgress = (id: string, progress: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && n.type === 'upload' ? { ...n, progress } : n
      )
    );
  };

  const completeUpload = (id: string, newTitle: string = "Carga completada") => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
            setTimeout(() => removeNotification(id), 5000);
            return { ...n, status: 'completed', title: newTitle, progress: 100 };
        }
        return n;
      })
    );
  };
  
  const errorUpload = (id: string, newTitle: string = "Error en la carga") => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
            setTimeout(() => removeNotification(id), 5000);
            return { ...n, status: 'error', title: newTitle };
        }
        return n;
      })
    );
  };

  const value = {
    notifications,
    startUpload,
    updateUploadProgress,
    completeUpload,
    errorUpload,
    removeNotification,
    showNotification,
    updateNotificationStatus,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
