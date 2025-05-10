import { cn } from "@/lib/utils";

interface LoaderProps {
  text?: string;
  className?: string;
}

export function Loader({ text = "Memproses...", className }: LoaderProps) {
  return (
    <div className={cn("fixed inset-0 bg-dark bg-opacity-70 z-50 flex items-center justify-center", className)}>
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-dark-light">{text}</p>
      </div>
    </div>
  );
}
