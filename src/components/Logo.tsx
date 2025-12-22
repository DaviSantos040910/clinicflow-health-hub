import { Activity } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-primary rounded-lg p-1.5 shadow-sm">
        <Activity className={`${sizeClasses[size]} text-primary-foreground`} />
      </div>
      {showText && (
        <span className={`font-display font-bold ${textClasses[size]} text-foreground`}>
          Clinic<span className="text-gradient">Flow</span>
        </span>
      )}
    </div>
  );
}
