
'use client';

import { useNotification, type NotificationItem, type UploadNotification, type StatusNotification } from '@/core/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, FileImage, Loader2, AlertTriangle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const UploadItem = ({ notification }: { notification: UploadNotification }) => {
    let statusIcon;
  
    switch (notification.status) {
      case 'uploading':
        statusIcon = <Loader2 className="h-5 w-5 text-primary animate-spin" />;
        break;
      case 'completed':
        statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
        break;
      case 'error':
        statusIcon = <X className="h-5 w-5 text-destructive" />;
        break;
      default:
        statusIcon = <Info className="h-5 w-5 text-muted-foreground" />;
    }
  
    return (
      <div className="flex items-center gap-3 p-3">
        <FileImage className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{notification.file.name}</p>
          {notification.status === 'uploading' && (
            <div className="flex items-center gap-2 mt-1">
              <Progress value={notification.progress} className="h-1.5 w-full" />
              <span className="text-xs text-muted-foreground">{Math.round(notification.progress)}%</span>
            </div>
          )}
        </div>
        <div className='pl-2'>{statusIcon}</div>
      </div>
    );
};

const StatusItem = ({ notification }: { notification: StatusNotification }) => {
    let statusIcon;
  
    switch (notification.status) {
      case 'loading':
        statusIcon = <Loader2 className="h-5 w-5 text-primary animate-spin" />;
        break;
      case 'success':
        statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
        break;
      case 'error':
        statusIcon = <AlertTriangle className="h-5 w-5 text-destructive" />;
        break;
      default:
        statusIcon = <Info className="h-5 w-5 text-muted-foreground" />;
    }
  
    return (
      <div className="flex items-center gap-3 p-3">
        {statusIcon}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{notification.title}</p>
        </div>
      </div>
    );
}

const NotificationCardItem = ({ notification }: { notification: NotificationItem }) => {
    if (notification.type === 'upload') {
        return <UploadItem notification={notification as UploadNotification} />;
    }
    if (notification.type === 'status') {
        return <StatusItem notification={notification as StatusNotification} />;
    }
    return null;
}

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }
  
  const inProgressCount = notifications.filter(u => u.status === 'uploading' || u.status === 'loading').length;
  
  let title;
  if(inProgressCount > 0){
    title = `En progreso (${inProgressCount})...`
  } else {
    title = `Completado`
  }


  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => notifications.forEach(u => removeNotification(u.id))}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 max-h-60 overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationCardItem key={notification.id} notification={notification} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
