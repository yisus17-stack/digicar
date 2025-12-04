
'use client';

import { useUpload, type Upload } from '@/core/contexts/UploadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, FileImage, Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const UploadItem = ({ upload }: { upload: Upload }) => {
    const { removeUpload } = useUpload();
    let statusIcon;
    let statusText;
  
    switch (upload.status) {
      case 'uploading':
        statusIcon = <Loader className="h-5 w-5 text-primary animate-spin" />;
        statusText = `Subiendo... ${Math.round(upload.progress)}%`;
        break;
      case 'completed':
        statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
        statusText = 'Completado';
        break;
      case 'error':
        statusIcon = <X className="h-5 w-5 text-destructive" />;
        statusText = 'Error';
        break;
    }
  
    return (
      <div className="flex items-center gap-3 p-3">
        <FileImage className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium truncate">{upload.file.name}</p>
          <div className="flex items-center gap-2 mt-1">
            {upload.status === 'uploading' ? (
              <Progress value={upload.progress} className="h-1.5 w-full" />
            ) : (
              <p className="text-xs text-muted-foreground">{statusText}</p>
            )}
          </div>
        </div>
        {upload.status !== 'uploading' && (
            <div className='pl-2'>
                {statusIcon}
            </div>
        )}
      </div>
    );
  };
  

export default function UploadNotifier() {
  const { uploads, removeUpload } = useUpload();

  if (uploads.length === 0) {
    return null;
  }
  
  const completedCount = uploads.filter(u => u.status === 'completed').length;
  const inProgress = uploads.some(u => u.status === 'uploading');
  
  let title;
  if(inProgress){
    title = `Subiendo ${uploads.length} archivo${uploads.length > 1 ? 's' : ''}`
  } else {
    title = `${completedCount} carga${completedCount > 1 ? 's' : ''} completada${completedCount > 1 ? 's' : ''}`
  }


  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => uploads.forEach(u => removeUpload(u.id))}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 max-h-60 overflow-y-auto">
          {uploads.map((upload) => (
            <UploadItem key={upload.id} upload={upload} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
