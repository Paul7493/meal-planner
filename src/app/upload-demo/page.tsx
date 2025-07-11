"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import UploadStatus, { useUploadStatus } from '@/components/ui/upload-status';
import { GitHubUploadHandler, UploadFile } from '@/lib/upload-handler';
import { getLocalStorageUsage } from '@/lib/utils';
import { Upload, FileText, AlertCircle, CheckCircle, Trash2, Info } from 'lucide-react';

export default function UploadDemoPage() {
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 5 * 1024 * 1024, percentage: 0 });
  const [uploadResult, setUploadResult] = useState<string>('');
  const uploadStatus = useUploadStatus();

  // Initialize storage info on client side only
  React.useEffect(() => {
    setStorageInfo(getLocalStorageUsage());
  }, []);

  // Mock files for demonstration
  const mockFiles: UploadFile[] = [
    { path: 'src/app/page.tsx', content: 'export default function Page() { return <div>Home</div>; }', size: 1024 },
    { path: 'src/components/Header.tsx', content: 'export default function Header() { return <header>Header</header>; }', size: 2048 },
    { path: 'package.json', content: '{"name": "demo", "version": "1.0.0"}', size: 512 },
    { path: 'README.md', content: '# Demo Project\n\nThis is a demo project.', size: 256 },
    { path: 'src/lib/utils.ts', content: 'export function cn() { return ""; }', size: 128 },
  ];

  // Create a large mock file to test quota exceeded
  const createLargeFile = (sizeMB: number): UploadFile => {
    const content = 'x'.repeat(sizeMB * 1024 * 1024);
    return {
      path: `large-file-${sizeMB}mb.txt`,
      content,
      size: content.length
    };
  };

  const refreshStorageInfo = () => {
    setStorageInfo(getLocalStorageUsage());
  };

  const handleNormalUpload = async () => {
    setUploadResult('');
    uploadStatus.showUpload(mockFiles.length);

    const result = await GitHubUploadHandler.uploadFiles(
      mockFiles,
      (progress) => {
        uploadStatus.updateProgress(progress.current);
      },
      (error) => {
        uploadStatus.showError(error);
      }
    );

    if (result.success) {
      setUploadResult(`✅ Successfully uploaded ${result.uploadedFiles} files!`);
      setTimeout(() => uploadStatus.hideUpload(), 2000);
    } else {
      setUploadResult(`❌ Upload failed: ${result.error}`);
    }

    refreshStorageInfo();
  };

  const handleLargeUpload = async () => {
    setUploadResult('');
    const largeFiles = [createLargeFile(10)]; // 10MB file to trigger quota error
    uploadStatus.showUpload(largeFiles.length);

    const result = await GitHubUploadHandler.uploadFiles(
      largeFiles,
      (progress) => {
        uploadStatus.updateProgress(progress.current);
      },
      (error) => {
        uploadStatus.showError(error);
      }
    );

    if (result.success) {
      setUploadResult(`✅ Successfully uploaded ${result.uploadedFiles} files!`);
      setTimeout(() => uploadStatus.hideUpload(), 2000);
    } else {
      setUploadResult(`❌ Upload failed: ${result.error}`);
    }

    refreshStorageInfo();
  };

  const handleClearStorage = () => {
    GitHubUploadHandler.clearUploadData();
    localStorage.clear();
    refreshStorageInfo();
    setUploadResult('🧹 Storage cleared successfully!');
  };

  const getStorageStatusColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Upload Demo & Storage Management</h1>
          <p className="text-gray-600">
            Demonstration of the improved upload system with localStorage quota handling
          </p>
        </div>

        {/* Storage Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Browser Storage Status</span>
            </CardTitle>
            <CardDescription>
              Current localStorage usage and available space
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>{storageInfo.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getStorageStatusColor(storageInfo.percentage)}`}
                  style={{ width: `${Math.min(100, storageInfo.percentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Used: {formatBytes(storageInfo.used)}</span>
                <span>Available: {formatBytes(storageInfo.available)}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={refreshStorageInfo} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={handleClearStorage} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Storage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Files Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Demo Files</span>
            </CardTitle>
            <CardDescription>
              Sample files for testing the upload functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockFiles.map((file, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-mono">{file.path}</span>
                  <Badge variant="secondary">{formatBytes(file.size)}</Badge>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <Badge>{formatBytes(mockFiles.reduce((sum, file) => sum + file.size, 0))}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Tests</span>
            </CardTitle>
            <CardDescription>
              Test different upload scenarios to see error handling in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Normal Upload</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Upload small demo files (should succeed)
                </p>
                <Button onClick={handleNormalUpload} className="w-full">
                  Upload Demo Files
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Large Upload (Test Error)</span>
                </h4>
                <p className="text-sm text-gray-600">
                  Upload large file to trigger quota error
                </p>
                <Button onClick={handleLargeUpload} variant="outline" className="w-full">
                  Test Quota Error
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {uploadResult && (
          <Alert>
            <AlertDescription>{uploadResult}</AlertDescription>
          </Alert>
        )}

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Implemented Features</CardTitle>
            <CardDescription>
              New capabilities added to handle localStorage quota issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Error Handling</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✅ Safe localStorage operations</li>
                  <li>✅ Quota exceeded detection</li>
                  <li>✅ Graceful error recovery</li>
                  <li>✅ User-friendly error messages</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Storage Management</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✅ Storage usage monitoring</li>
                  <li>✅ File chunking for large uploads</li>
                  <li>✅ Automatic cleanup on errors</li>
                  <li>✅ Clear storage functionality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Links */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                For detailed troubleshooting and additional help:
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="/UPLOAD_GUIDE.md" target="_blank">
                    📖 Upload Guide
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/README.md" target="_blank">
                    📋 README
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Status Modal */}
      {uploadStatus.status.isVisible && (
        <UploadStatus
          progress={uploadStatus.status.progress}
          total={uploadStatus.status.total}
          error={uploadStatus.status.error}
          isUploading={uploadStatus.status.isUploading}
          onClose={uploadStatus.hideUpload}
          onRetry={uploadStatus.retry}
          onClearStorage={() => {
            handleClearStorage();
            uploadStatus.hideUpload();
          }}
        />
      )}
    </div>
  );
}
