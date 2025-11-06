import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MascotProps {
  mood?: 'normal' | 'disappointed' | 'excited';
  message?: string;
  show?: boolean;
}

export const Mascot = ({ mood = 'normal', message, show = true }: MascotProps) => {
  const [isVisible, setIsVisible] = useState(show);

  if (!isVisible) return null;

  const getMoodEmoji = () => {
    switch (mood) {
      case 'disappointed':
        return '😔';
      case 'excited':
        return '🎉';
      default:
        return '🤖';
    }
  };

  const getMoodColor = () => {
    switch (mood) {
      case 'disappointed':
        return 'from-orange-500/20 to-red-500/20';
      case 'excited':
        return 'from-yellow-500/20 to-orange-500/20';
      default:
        return 'from-primary/20 to-secondary/20';
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-4">
      <div className="relative">
        {/* Mascot */}
        <div 
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-gradient-to-br shadow-lg",
            "transform transition-all duration-300",
            "hover:scale-110 cursor-pointer",
            "animate-bounce",
            getMoodColor()
          )}
        >
          <span className="text-3xl">{getMoodEmoji()}</span>
          
          {mood === 'excited' && (
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
          )}
        </div>

        {/* Message Tooltip */}
        {message && (
          <div className="absolute bottom-full right-0 mb-2 w-64 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border-2 border-primary/20 rounded-xl p-4 shadow-xl relative">
              <div className="text-sm text-foreground">
                {message}
              </div>
              {/* Speech bubble arrow */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r-2 border-b-2 border-primary/20 transform rotate-45" />
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};
