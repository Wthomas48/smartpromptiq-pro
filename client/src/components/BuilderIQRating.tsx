import React, { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BuilderIQRatingProps {
  initialRating?: number;
  totalRatings?: number;
  itemId: string;
  itemType: 'template' | 'agent' | 'blueprint' | 'questionnaire';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const BuilderIQRating: React.FC<BuilderIQRatingProps> = ({
  initialRating = 0,
  totalRatings = 0,
  itemId,
  itemType,
  size = 'md',
  showCount = true,
  interactive = true,
  onRate,
  className,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if user already rated this item
  React.useEffect(() => {
    const storedRatings = localStorage.getItem('builderiq_ratings');
    if (storedRatings) {
      const ratings = JSON.parse(storedRatings);
      if (ratings[`${itemType}_${itemId}`]) {
        setHasRated(true);
        setRating(ratings[`${itemType}_${itemId}`]);
      }
    }
  }, [itemId, itemType]);

  const handleRate = useCallback((newRating: number) => {
    if (!interactive || hasRated) return;

    setIsAnimating(true);
    setRating(newRating);
    setHasRated(true);

    // Store rating locally
    const storedRatings = localStorage.getItem('builderiq_ratings') || '{}';
    const ratings = JSON.parse(storedRatings);
    ratings[`${itemType}_${itemId}`] = newRating;
    localStorage.setItem('builderiq_ratings', JSON.stringify(ratings));

    // Callback
    onRate?.(newRating);

    // Show toast
    const messages = {
      5: "Amazing! Thanks for the 5-star rating!",
      4: "Great! Thanks for your feedback!",
      3: "Thanks! We'll work to improve!",
      2: "Thanks for your honesty. We'll do better!",
      1: "Sorry it didn't meet expectations. We'll improve!",
    };

    toast({
      title: `${newRating} Star${newRating > 1 ? 's' : ''}`,
      description: messages[newRating as keyof typeof messages],
    });

    setTimeout(() => setIsAnimating(false), 500);
  }, [interactive, hasRated, itemId, itemType, onRate, toast]);

  const displayRating = hoverRating || rating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive || hasRated}
            onClick={() => handleRate(star)}
            onMouseEnter={() => interactive && !hasRated && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={cn(
              "transition-all duration-150 focus:outline-none",
              interactive && !hasRated && "cursor-pointer hover:scale-110",
              !interactive || hasRated ? "cursor-default" : "",
              isAnimating && star <= rating && "animate-bounce"
            )}
            style={{ animationDelay: `${star * 50}ms` }}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-gray-400 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>

      {showCount && (
        <span className="text-xs text-gray-400 ml-1">
          {rating > 0 ? rating.toFixed(1) : '—'}
          {totalRatings > 0 && (
            <span className="ml-1">({totalRatings.toLocaleString()})</span>
          )}
        </span>
      )}

      {hasRated && (
        <span className="text-xs text-green-400 ml-2">✓ Rated</span>
      )}
    </div>
  );
};

// Compact version for lists
export const BuilderIQRatingCompact: React.FC<{
  rating: number;
  count?: number;
  className?: string;
}> = ({ rating, count, className }) => (
  <div className={cn("flex items-center gap-1", className)}>
    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
    <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
    {count !== undefined && (
      <span className="text-xs text-gray-400">({count.toLocaleString()})</span>
    )}
  </div>
);

// Rating summary for detail pages
export const BuilderIQRatingSummary: React.FC<{
  rating: number;
  totalRatings: number;
  distribution?: { stars: number; count: number }[];
  className?: string;
}> = ({ rating, totalRatings, distribution, className }) => {
  const defaultDistribution = distribution || [
    { stars: 5, count: Math.floor(totalRatings * 0.7) },
    { stars: 4, count: Math.floor(totalRatings * 0.2) },
    { stars: 3, count: Math.floor(totalRatings * 0.05) },
    { stars: 2, count: Math.floor(totalRatings * 0.03) },
    { stars: 1, count: Math.floor(totalRatings * 0.02) },
  ];

  return (
    <div className={cn("bg-slate-800/50 rounded-xl p-4", className)}>
      <div className="flex items-start gap-6">
        {/* Overall rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white">{rating.toFixed(1)}</div>
          <div className="flex justify-center my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-4 h-4",
                  star <= Math.round(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-transparent text-gray-500"
                )}
              />
            ))}
          </div>
          <div className="text-sm text-gray-400">{totalRatings.toLocaleString()} ratings</div>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1">
          {defaultDistribution.map(({ stars, count }) => {
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-400">{stars}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400">{Math.round(percentage)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BuilderIQRating;
