import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  customAction?: () => void;
  label?: string;
}

export default function BackButton({ className = "", customAction, label = "Back" }: BackButtonProps) {
  const [location] = useLocation();

  const handleBack = () => {
    if (customAction) {
      customAction();
    } else {
      window.history.back();
    }
  };

  // Don't show back button on home/landing pages
  if (location === "/" || location === "/dashboard") {
    return null;
  }

  return (
    <div className={`hidden md:block ${className}`}>
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </div>
  );
}