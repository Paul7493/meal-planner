"use client"

import React from 'react';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { clearLocalStorageData } from '@/lib/utils';

interface UploadStatusProps {
  progress: number;
  total: number;
  error?: string;
  isUploading?: boolean;
  onClose?: () => void;
  onRetry?: () => void;
  onClearStorage?: () => void;
}

export default function UploadStatus({ 
  progress, 
  total, 
  error, 
  isUploading = false,
  onClose,
  onRetry,
  onClearStorage
}: UploadStatusProps) {
  const percentage = total > 0 ? (progress / total) * 100 : 0;
  const isComplete = progress === total && total > 0;
  const isQuotaError = error?.includes('quota') || error?.includes('Storage');

  const handleClearStorage = () => {
    const confirmed = window.confirm(
      'This will clear all browser storage data for this site. Are you sure you want to continue?'
    );
    
    if (confirmed) {
      const success = clearLocalStorageData(true);
      if (success && onClearStorage) {
        onClearStorage();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isComplete ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : isUploading ? (
              <Upload className="h-6 w-6 text-blue-500 animate-pulse" />
            ) : (
              <AlertCircle className="h-6 w-6 text-orange-500" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {isComplete ? 'Upload Complete' : isUploading ? 'Uploading Files' : 'Upload Status'}
            </h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Section */}
        {!error && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{progress} of {total} files</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="text-center text-sm text-gray-500">
              {percentage.toFixed(1)}% complete
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div>
                <strong>Upload Failed:</strong> {error}
              </div>
              
              {isQuotaError && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">This error occurs when your browser's storage is full.</p>
                  <div className="bg-red-50 p-3 rounded border">
                    <p className="font-medium mb-2">Quick Solutions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Clear your browser's localStorage (button below)</li>
                      <li>Close other tabs to free up memory</li>
                      <li>Try uploading fewer files at once</li>
                      <li>Clear your browser cache and cookies</li>
                    </ol>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          {error && onRetry && (
            <Button onClick={onRetry} className="flex-1">
              Try Again
            </Button>
          )}
          
          {isQuotaError && (
            <Button 
              onClick={handleClearStorage}
              variant="outline"
              className="flex-1"
            >
              Clear Storage
            </Button>
          )}
          
          {isComplete && onClose && (
            <Button onClick={onClose} className="flex-1">
              Close
            </Button>
          )}
          
          {!isComplete && !error && onClose && (
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          )}
        </div>

        {/* Help Text */}
        {isQuotaError && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>
              <strong>Need more help?</strong> Check the UPLOAD_GUIDE.md file for detailed troubleshooting steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for managing upload status
export function useUploadStatus() {
  const [status, setStatus] = React.useState<{
    isVisible: boolean;
    progress: number;
    total: number;
    error?: string;
    isUploading: boolean;
  }>({
    isVisible: false,
    progress: 0,
    total: 0,
    isUploading: false
  });

  const showUpload = (total: number) => {
    setStatus({
      isVisible: true,
      progress: 0,
      total,
      isUploading: true
    });
  };

  const updateProgress = (progress: number) => {
    setStatus(prev => ({ ...prev, progress }));
  };

  const showError = (error: string) => {
    setStatus(prev => ({ 
      ...prev, 
      error, 
      isUploading: false 
    }));
  };

  const hideUpload = () => {
    setStatus({
      isVisible: false,
      progress: 0,
      total: 0,
      isUploading: false
    });
  };

  const retry = () => {
    setStatus(prev => ({
      ...prev,
      error: undefined,
      isUploading: true,
      progress: 0
    }));
  };

  return {
    status,
    showUpload,
    updateProgress,
    showError,
    hideUpload,
    retry
  };
}
