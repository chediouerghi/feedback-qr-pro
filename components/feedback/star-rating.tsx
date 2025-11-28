"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  onChange: (rating: number) => void
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, onChange, size = "lg" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const gapClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  }

  const labels = ["Très mauvais", "Mauvais", "Moyen", "Bien", "Excellent"]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("flex items-center", gapClasses[size])} role="group" aria-label="Note">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoverRating || rating)
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={cn(
                "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm",
                isActive ? "scale-110" : "scale-100",
              )}
              aria-label={`${star} étoile${star > 1 ? "s" : ""} - ${labels[star - 1]}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-150",
                  isActive
                    ? star <= 2
                      ? "fill-danger text-danger"
                      : star === 3
                        ? "fill-warning text-warning"
                        : "fill-primary text-primary"
                    : "fill-none text-border",
                )}
              />
            </button>
          )
        })}
      </div>
      {(hoverRating || rating) > 0 && (
        <p
          className={cn(
            "text-sm font-medium animate-in fade-in duration-200",
            (hoverRating || rating) <= 2
              ? "text-danger"
              : (hoverRating || rating) === 3
                ? "text-warning"
                : "text-primary",
          )}
        >
          {labels[(hoverRating || rating) - 1]}
        </p>
      )}
    </div>
  )
}
