import { createContext, useContext, ReactNode } from "react";
import { useRatingSystem } from "@/hooks/useRatingSystem";
import RatingPopup from "./RatingPopup";

interface RatingSystemContextType {
  showRating: (trigger: any) => void;
  hideRating: () => void;
  canShowRating: (triggerType: string) => boolean;
  trackFeatureUsage: (feature: string, category?: string) => void;
  trackMilestone: (event: string) => void;
  trackErrorRecovery: (error: string, resolution: string) => void;
}

const RatingSystemContext = createContext<RatingSystemContextType | null>(null);

interface RatingSystemProviderProps {
  children: ReactNode;
}

export function RatingSystemProvider({ children }: RatingSystemProviderProps) {
  const ratingSystem = useRatingSystem();

  return (
    <RatingSystemContext.Provider value={ratingSystem}>
      {children}

      {/* Global Rating Popup */}
      <RatingPopup
        isOpen={ratingSystem.isRatingOpen}
        onClose={ratingSystem.hideRating}
        trigger={ratingSystem.currentTrigger || {
          type: 'manual',
          context: {},
          priority: 'medium'
        }}
        onRatingComplete={(data) => {
          // Handle rating completion
          console.log('Rating completed:', data);
        }}
      />
    </RatingSystemContext.Provider>
  );
}

export function useRatingSystemContext() {
  const context = useContext(RatingSystemContext);
  if (!context) {
    throw new Error('useRatingSystemContext must be used within a RatingSystemProvider');
  }
  return context;
}