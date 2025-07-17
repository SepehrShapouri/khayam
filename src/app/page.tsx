"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Play, Pause, Volume2 } from "lucide-react";
import Image from "next/image";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  key: string;
}

interface AudioPlayerProps {
  src: string;
  name: string;
}

const CustomAudioPlayer: React.FC<AudioPlayerProps> = ({ src, name }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-neutral-900 text-white rounded-lg p-6 w-full">
      <audio ref={audioRef} src={src} />
      
      {/* Track Name */}
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-300 truncate">{name}</h3>
      </div>

      {/* Progress Bar */}
      <div 
        className="w-full h-1 bg-gray-700 rounded-full mb-4 cursor-pointer"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-white rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Time Display */}
        <div className="text-sm text-gray-400 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );
};

export default function Homepage() {
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

  const getFileTypeFromName = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'heif'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'];
    
    if (imageExtensions.includes(extension || '')) return 'image';
    if (videoExtensions.includes(extension || '')) return 'video';
    if (audioExtensions.includes(extension || '')) return 'audio';
    
    return 'unknown';
  };

  const renderMediaContent = (file: MediaFile) => {
    const isImage = file.type.startsWith("image/") || getFileTypeFromName(file.name) === 'image';
    const isVideo = file.type.startsWith("video/") || getFileTypeFromName(file.name) === 'video';
    const isAudio = file.type.startsWith("audio/") || getFileTypeFromName(file.name) === 'audio';

    if (isImage) {
      return (
        <Image
          src={file.url}
          alt={file.name}
          className="w-full h-auto rounded-lg"
          loading="lazy"
          width={1000}
          height={1000}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          controls
          className="w-full h-auto rounded-lg"
          preload="metadata"
        >
          <source src={file.url} />
        </video>
      );
    }

    if (isAudio) {
      return <CustomAudioPlayer src={file.url} name={file.name} />;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-8">
        {mediaFiles.map((file) => (
          <div key={file.id}>
            {renderMediaContent(file)}
          </div>
        ))}
      </div>
    </div>
  );
}