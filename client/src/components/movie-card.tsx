import { cn } from "@/lib/utils";
import { PlayIcon, InfoIcon } from "lucide-react";

interface MovieCardProps {
  title: string;
  year: string;
  category: string;
  posterUrl: string;
  className?: string;
  onClick?: () => void;
}

export function MovieCard({
  title,
  year,
  category,
  posterUrl,
  className,
  onClick,
}: MovieCardProps) {
  return (
    <div 
      className={cn(
        "group rounded-md overflow-hidden bg-netflix-dark-gray hover:scale-105 transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3]">
        <img 
          src={posterUrl}
          alt={title} 
          className="w-full h-full object-cover"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
          {/* Play button */}
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex flex-col items-center">
            <button className="bg-white bg-opacity-80 hover:bg-white text-netflix-red p-3 rounded-full transform scale-90 group-hover:scale-100 transition-all duration-300 mb-2">
              <PlayIcon className="h-6 w-6" fill="currentColor" />
            </button>
            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Play</span>
          </div>
          
          {/* Info overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <h3 className="font-medium text-white truncate">{title}</h3>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-300 font-medium">{year}</span>
              <span className="mx-1 text-gray-400">•</span>
              <span className="text-xs text-gray-300">{category}</span>
            </div>
          </div>
        </div>
        
        {/* Normal overlay gradient for bottom text (visible without hover) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
      </div>
      
      {/* Bottom title (visible always) */}
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{title}</h3>
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-400">{year}</span>
          <span className="mx-1 text-gray-500">•</span>
          <span className="text-xs text-gray-400">{category}</span>
        </div>
      </div>
    </div>
  );
}
