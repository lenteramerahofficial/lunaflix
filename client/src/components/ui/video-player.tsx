import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  X, 
  SkipForward, 
  SkipBack,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Slider } from "./slider";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

export function VideoPlayer({
  src,
  title,
  poster,
  className,
  onClose,
  autoPlay = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timeout);
      };
    }
  }, [isPlaying]);
  
  // Update video state when autoPlay changes
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(err => console.error("Autoplay failed:", err));
      setIsPlaying(true);
    }
  }, [autoPlay]);
  
  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.error("Play failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const seekTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setProgress(value[0]);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0] / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    
    if (!container) return;
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Skip forward/back
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative group bg-black overflow-hidden w-full",
        showControls ? "cursor-default" : "cursor-none",
        className
      )}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Control overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Title bar */}
      {title && (
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-black/20 rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
      
      {/* Play/Pause overlay button */}
      <button
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/30 text-white p-4 rounded-full transition-all",
          isPlaying ? "opacity-0 scale-50" : "opacity-100 scale-100",
          showControls ? "visible" : "invisible"
        )}
        onClick={togglePlay}
      >
        <Play className="h-8 w-8" fill="white" />
      </button>
      
      {/* Control bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-4 transition-opacity duration-300 flex flex-col",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="w-full mb-2">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 rounded-full hidden sm:flex"
              onClick={() => skip(-10)}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 rounded-full hidden sm:flex"
              onClick={() => skip(10)}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center group/volume relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10 rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 opacity-0 group-hover/volume:opacity-100">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20 mx-2"
                />
              </div>
            </div>
            
            <span className="text-white text-xs ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 rounded-full hidden sm:flex"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 rounded-full"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}