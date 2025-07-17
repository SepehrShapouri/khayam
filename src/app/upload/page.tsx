"use client";

import React, { useState, useEffect } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileImage, FileVideo, FileAudio, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  key: string;
}

interface UploadThingResponse {
  key: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function UploadPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/uploadthing/files");
      if (response.ok) {
        const files = await response.json();
        setMediaFiles(files);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadComplete = (res: UploadThingResponse[]) => {
    console.log("Files: ", res);
    fetchFiles();
  };

  const handleDeleteFile = async (fileKey: string) => {
    try {
      const response = await fetch("/api/uploadthing", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileKey }),
      });

      if (response.ok) {
        setMediaFiles((prev) => prev.filter((file) => file.key !== fileKey));
      } else {
        console.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const getFileIcon = (type: string, name: string) => {
    const extension = name.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'heif'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'];
    
    if (type.startsWith("image/") || imageExtensions.includes(extension || '')) 
      return <FileImage className="h-6 w-6 text-blue-500 flex-shrink-0" />;
    if (type.startsWith("video/") || videoExtensions.includes(extension || '')) 
      return <FileVideo className="h-6 w-6 text-green-500 flex-shrink-0" />;
    if (type.startsWith("audio/") || audioExtensions.includes(extension || '')) 
      return <FileAudio className="h-6 w-6 text-purple-500 flex-shrink-0" />;
    return <FileImage className="h-6 w-6 text-gray-500 flex-shrink-0" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeColor = (type: string, name: string) => {
    const extension = name.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'heif'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'];
    
    if (type.startsWith("image/") || imageExtensions.includes(extension || '')) 
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (type.startsWith("video/") || videoExtensions.includes(extension || '')) 
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (type.startsWith("audio/") || audioExtensions.includes(extension || '')) 
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getFileType = (type: string, name: string) => {
    const extension = name.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'heif'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'];
    
    if (type.startsWith("image/") || imageExtensions.includes(extension || '')) return "IMAGE";
    if (type.startsWith("video/") || videoExtensions.includes(extension || '')) return "VIDEO";
    if (type.startsWith("audio/") || audioExtensions.includes(extension || '')) return "AUDIO";
    return "FILE";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Upload</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFiles}
            disabled={loading}
            className="p-2"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Upload New Media</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadButton
              endpoint="mediaUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Files ({mediaFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No files yet</p>
                <p className="text-sm text-muted-foreground mt-1">Upload some media to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mediaFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    {/* File info row */}
                    <div className="flex items-start space-x-3">
                      {getFileIcon(file.type, file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-5 break-words">{file.name}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-1 ${getFileTypeColor(file.type, file.name)}`}
                          >
                            {getFileType(file.type, file.name)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFile(file.key)}
                        className="px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 