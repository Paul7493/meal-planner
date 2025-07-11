"use client"

import { safeSetLocalStorage, safeGetLocalStorage, safeRemoveLocalStorage, getLocalStorageUsage } from './utils';

export interface UploadFile {
  path: string;
  content: string;
  size: number;
}

export interface UploadProgress {
  current: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  uploadedFiles?: number;
}

export class GitHubUploadHandler {
  private static readonly UPLOAD_KEY = '9x5yvw-uploadfiles';
  private static readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private static readonly MAX_STORAGE_USAGE = 0.8; // Use max 80% of available storage

  /**
   * Safely prepare files for upload with storage quota management
   */
  static async prepareUpload(files: UploadFile[]): Promise<{ success: boolean; error?: string; chunks?: any[] }> {
    try {
      // Check current storage usage
      const storageInfo = getLocalStorageUsage();
      
      if (storageInfo.percentage > this.MAX_STORAGE_USAGE * 100) {
        return {
          success: false,
          error: `Browser storage is ${storageInfo.percentage.toFixed(1)}% full. Please clear storage before uploading.`
        };
      }

      // Calculate total size of files to upload
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const estimatedStorageNeeded = totalSize * 1.5; // Add 50% overhead for JSON encoding

      if (estimatedStorageNeeded > storageInfo.available) {
        return {
          success: false,
          error: `Upload size (${(estimatedStorageNeeded / 1024 / 1024).toFixed(1)}MB) exceeds available storage (${(storageInfo.available / 1024 / 1024).toFixed(1)}MB). Please clear browser storage or upload fewer files.`
        };
      }

      // Split files into manageable chunks
      const chunks = this.createFileChunks(files);
      
      // Try to store the first chunk to test storage
      const testResult = safeSetLocalStorage(`${this.UPLOAD_KEY}-test`, { test: true });
      if (!testResult) {
        return {
          success: false,
          error: 'Browser storage quota exceeded. Please clear your browser storage and try again.'
        };
      }
      
      // Clean up test data
      safeRemoveLocalStorage(`${this.UPLOAD_KEY}-test`);

      return { success: true, chunks };
    } catch (error) {
      return {
        success: false,
        error: `Failed to prepare upload: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Upload files with progress tracking and error handling
   */
  static async uploadFiles(
    files: UploadFile[],
    onProgress?: (progress: UploadProgress) => void,
    onError?: (error: string) => void
  ): Promise<UploadResult> {
    try {
      // Prepare upload
      const preparation = await this.prepareUpload(files);
      if (!preparation.success) {
        onError?.(preparation.error || 'Failed to prepare upload');
        return { success: false, error: preparation.error };
      }

      const chunks = preparation.chunks || [];
      let uploadedFiles = 0;

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkKey = `${this.UPLOAD_KEY}-chunk-${i}`;

        // Try to store chunk
        const success = safeSetLocalStorage(chunkKey, chunk);
        if (!success) {
          // Clean up any stored chunks
          this.cleanupChunks(i);
          const error = 'Storage quota exceeded during upload. Please clear browser storage and try again.';
          onError?.(error);
          return { success: false, error };
        }

        // Update progress
        uploadedFiles += chunk.files.length;
        onProgress?.({
          current: uploadedFiles,
          total: files.length,
          percentage: (uploadedFiles / files.length) * 100
        });

        // Simulate upload delay (remove in production)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Store metadata
      const metadata = {
        totalFiles: files.length,
        totalChunks: chunks.length,
        uploadTime: new Date().toISOString()
      };

      const metadataSuccess = safeSetLocalStorage(`${this.UPLOAD_KEY}-metadata`, metadata);
      if (!metadataSuccess) {
        this.cleanupChunks(chunks.length);
        const error = 'Failed to store upload metadata. Storage quota exceeded.';
        onError?.(error);
        return { success: false, error };
      }

      return { success: true, uploadedFiles };
    } catch (error) {
      const errorMessage = `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create file chunks to manage storage efficiently
   */
  private static createFileChunks(files: UploadFile[]): any[] {
    const chunks: any[] = [];
    let currentChunk: UploadFile[] = [];
    let currentChunkSize = 0;

    for (const file of files) {
      // If adding this file would exceed chunk size, start a new chunk
      if (currentChunkSize + file.size > this.CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push({ files: currentChunk, size: currentChunkSize });
        currentChunk = [];
        currentChunkSize = 0;
      }

      currentChunk.push(file);
      currentChunkSize += file.size;
    }

    // Add the last chunk if it has files
    if (currentChunk.length > 0) {
      chunks.push({ files: currentChunk, size: currentChunkSize });
    }

    return chunks;
  }

  /**
   * Clean up stored chunks in case of error
   */
  private static cleanupChunks(maxIndex: number): void {
    for (let i = 0; i < maxIndex; i++) {
      safeRemoveLocalStorage(`${this.UPLOAD_KEY}-chunk-${i}`);
    }
    safeRemoveLocalStorage(`${this.UPLOAD_KEY}-metadata`);
  }

  /**
   * Clear all upload-related data from storage
   */
  static clearUploadData(): void {
    // Remove main upload key
    safeRemoveLocalStorage(this.UPLOAD_KEY);
    
    // Remove metadata
    safeRemoveLocalStorage(`${this.UPLOAD_KEY}-metadata`);
    
    // Remove any chunks (try up to 100 chunks)
    for (let i = 0; i < 100; i++) {
      safeRemoveLocalStorage(`${this.UPLOAD_KEY}-chunk-${i}`);
    }
  }

  /**
   * Get current upload status from storage
   */
  static getUploadStatus(): { hasData: boolean; metadata?: any; storageUsage: any } {
    const metadata = safeGetLocalStorage(`${this.UPLOAD_KEY}-metadata`);
    const storageUsage = getLocalStorageUsage();
    
    return {
      hasData: !!metadata,
      metadata,
      storageUsage
    };
  }

  /**
   * Validate files before upload
   */
  static validateFiles(files: UploadFile[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (files.length === 0) {
      errors.push('No files to upload');
    }

    if (files.length > 1000) {
      errors.push('Too many files (max 1000)');
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 100 * 1024 * 1024) { // 100MB limit
      errors.push('Total file size exceeds 100MB limit');
    }

    // Check for invalid file paths
    files.forEach((file, index) => {
      if (!file.path || file.path.trim() === '') {
        errors.push(`File ${index + 1} has invalid path`);
      }
      if (file.size < 0) {
        errors.push(`File ${file.path} has invalid size`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export utility functions for direct use
export {
  safeSetLocalStorage,
  safeGetLocalStorage,
  safeRemoveLocalStorage,
  getLocalStorageUsage
} from './utils';
