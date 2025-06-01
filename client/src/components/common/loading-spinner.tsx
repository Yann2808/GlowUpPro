import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size],
          className
        )} 
      />
      {text && (
        <p className="text-warm-gray text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
