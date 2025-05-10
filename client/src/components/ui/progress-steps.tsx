import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function ProgressSteps({
  currentStep,
  totalSteps,
  labels = [],
  className
}: ProgressStepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute left-0 top-1/2 h-1 bg-gray-700 transform -translate-y-1/2 w-full rounded-full" />
        
        {/* Progress bar filled */}
        <div 
          className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-netflix-red to-netflix-bright-red transform -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <div key={idx} className="relative flex flex-col items-center z-10">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow",
                  isCompleted ? "bg-gradient-to-br from-netflix-red to-netflix-bright-red text-white transform scale-105" : 
                  isActive ? "bg-netflix-red text-white ring-2 ring-netflix-bright-red ring-opacity-50" : 
                  "bg-gray-800 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>
              
              {labels && labels[idx] && (
                <span className={cn(
                  "mt-2 text-xs font-medium",
                  isActive ? "text-white" : 
                  isCompleted ? "text-netflix-red" : 
                  "text-gray-500"
                )}>
                  {labels[idx]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}