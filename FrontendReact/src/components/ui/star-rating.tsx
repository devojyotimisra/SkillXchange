import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (rating: number) => {
    if (readonly) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const handleClick = (rating: number) => {
    if (readonly || !onChange) return;
    onChange(rating);
  };

  const currentRating = hoverRating || value;

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          className={`text-2xl ${
            star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
          } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          disabled={readonly}
        >
          ★
        </button>
      ))}
    </div>
  );
}